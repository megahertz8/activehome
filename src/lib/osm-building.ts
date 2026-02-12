interface BuildingGeometry {
  footprintArea_m2: number;
  perimeter_m: number;
  orientation_deg: number; // 0=north, 90=east, 180=south, 270=west
  orientationLabel: string; // "south-facing", "east-facing", etc.
  longestWallLength_m: number;
  longestWallBearing_deg: number;
  levels: number | null;
  height_m: number | null;
  material: string | null;
  roofShape: string | null;
  buildingType: string | null;
  yearBuilt: number | null;
  estimatedWallArea_m2: number; // perimeter × height (or levels × 2.7m)
  estimatedRoofArea_m2: number; // footprint × roof factor
  sharedWalls: SharedWall[]; // walls touching adjacent buildings
  exposedPerimeter_m: number; // perimeter minus shared walls
}

interface SharedWall {
  length_m: number;
  bearing_deg: number;
}

interface OverpassResponse {
  elements: Array<{
    type: 'way' | 'relation';
    id: number;
    tags?: {
      [key: string]: string;
    };
    geometry?: Array<{ lat: number; lon: number }>;
    members?: Array<{
      type: 'way';
      ref: number;
      role: string;
      geometry?: Array<{ lat: number; lon: number }>;
    }>;
  }>;
}

interface Polygon {
  id: number;
  nodes: [number, number][];
  tags: { [key: string]: string };
}

// Cache for geocoding and geometry
const geocodeCache = new Map<string, { lat: number; lon: number }>();
const geometryCache = new Map<string, BuildingGeometry>();

// Rate limiter for Overpass API (1 req/sec)
let lastOverpassRequest = 0;

// Main function
async function getBuildingGeometry(lat: number, lon: number): Promise<BuildingGeometry | null> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey)!;
  }

  const response = await queryOverpass(lat, lon);
  const targetBuilding = findTargetBuilding(response.elements, lat, lon);

  if (!targetBuilding) return null;

  const geometry = calculateBuildingGeometry(targetBuilding, response.elements);
  geometryCache.set(cacheKey, geometry);

  return geometry;
}

// Helper: find the building polygon containing or nearest to the given point
async function queryOverpass(lat: number, lon: number, radius = 30): Promise<OverpassResponse> {
  // Rate limit: ensure at least 1 second between requests
  const now = Date.now();
  const timeSinceLast = now - lastOverpassRequest;
  if (timeSinceLast < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastOverpassRequest = Date.now();

  const query = `[out:json][timeout:10];
(
  way["building"](around:${radius},${lat},${lon});
  relation["building"](around:${radius},${lat},${lon});
);
out body geom;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  return response.json();
}

function findTargetBuilding(elements: OverpassResponse['elements'], targetLat: number, targetLon: number): Polygon | null {
  const buildings: Polygon[] = [];

  for (const element of elements) {
    if (element.type === 'way' && element.tags?.building && element.geometry) {
      buildings.push({
        id: element.id,
        nodes: element.geometry.map(g => [g.lon, g.lat]),
        tags: element.tags,
      });
    } else if (element.type === 'relation' && element.tags?.building && element.members) {
      // For multipolygon relations, combine outer ways
      const outerWays: [number, number][][] = [];
      for (const member of element.members) {
        if (member.role === 'outer' && member.geometry) {
          outerWays.push(member.geometry.map(g => [g.lon, g.lat]));
        }
      }
      if (outerWays.length > 0) {
        // Simple case: take the first outer way (could be more complex for multipolygons)
        buildings.push({
          id: element.id,
          nodes: outerWays[0],
          tags: element.tags,
        });
      }
    }
  }

  // Find building containing the point or nearest
  let bestBuilding: Polygon | null = null;
  let minDistance = Infinity;

  for (const building of buildings) {
    if (isPointInPolygon([targetLon, targetLat], building.nodes)) {
      return building; // Exact match
    }

    // Calculate distance to centroid
    const centroid = calculateCentroid(building.nodes);
    const distance = haversineDistance(targetLat, targetLon, centroid[1], centroid[0]);
    if (distance < minDistance) {
      minDistance = distance;
      bestBuilding = building;
    }
  }

  return bestBuilding;
}

function calculateBuildingGeometry(targetBuilding: Polygon, allElements: OverpassResponse['elements']): BuildingGeometry {
  const nodes = targetBuilding.nodes;
  const footprintArea = calculateFootprintArea(nodes);
  const perimeter = calculatePerimeter(nodes);
  const { degrees: orientation_deg, label: orientationLabel, length: longestWallLength_m, bearing: longestWallBearing_deg } = calculateOrientation(nodes);

  const nearbyBuildings = allElements
    .filter(el => el.id !== targetBuilding.id && (el.type === 'way' || el.type === 'relation'))
    .map(el => {
      if (el.type === 'way' && el.geometry) {
        return { id: el.id, nodes: el.geometry.map(g => [g.lon, g.lat]), tags: el.tags || {} };
      } else if (el.type === 'relation' && el.members) {
        const outer = el.members.find(m => m.role === 'outer' && m.geometry);
        if (outer) {
          return { id: el.id, nodes: outer.geometry!.map(g => [g.lon, g.lat]), tags: el.tags || {} };
        }
      }
      return null;
    })
    .filter(Boolean) as Polygon[];

  const sharedWalls = findSharedWalls(targetBuilding, nearbyBuildings);
  const exposedPerimeter_m = perimeter - sharedWalls.reduce((sum, wall) => sum + wall.length_m, 0);

  const levels = parseInt(targetBuilding.tags['building:levels'] || '') || null;
  const height_m = parseFloat(targetBuilding.tags.height || '') || null;
  const material = targetBuilding.tags['building:material'] || null;
  const roofShape = targetBuilding.tags['roof:shape'] || null;
  const buildingType = targetBuilding.tags.building || null;
  const yearBuilt = parseInt(targetBuilding.tags.start_date || '') || null;

  // Estimated wall area: exposed perimeter × (height or levels × 2.7m)
  const wallHeight = height_m || (levels ? levels * 2.7 : 2.7); // Default 2.7m per level
  const estimatedWallArea_m2 = exposedPerimeter_m * wallHeight;

  // Roof area factor based on roof shape
  const roofFactor = roofShape === 'flat' ? 1.0 : roofShape === 'pitched' ? 1.2 : roofShape === 'hipped' ? 1.3 : 1.1;
  const estimatedRoofArea_m2 = footprintArea * roofFactor;

  return {
    footprintArea_m2: footprintArea,
    perimeter_m: perimeter,
    orientation_deg,
    orientationLabel,
    longestWallLength_m,
    longestWallBearing_deg,
    levels,
    height_m,
    material,
    roofShape,
    buildingType,
    yearBuilt,
    estimatedWallArea_m2,
    estimatedRoofArea_m2,
    sharedWalls,
    exposedPerimeter_m: exposedPerimeter_m,
  };
}

// Geometry calculations from polygon nodes
function calculateFootprintArea(nodes: [number, number][]): number {
  // Shoelace formula for area
  let area = 0;
  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    area += nodes[i][0] * nodes[j][1];
    area -= nodes[j][0] * nodes[i][1];
  }
  area = Math.abs(area) / 2;

  // Convert to square meters (approximate, since lat/lon)
  // For more accuracy, could use proper geodesic area, but for now this is fine
  // Assuming small area, use average latitude for conversion
  const avgLat = nodes.reduce((sum, n) => sum + n[1], 0) / nodes.length;
  const latRadians = (avgLat * Math.PI) / 180;
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 111320 * Math.cos(latRadians);
  area *= metersPerDegreeLat * metersPerDegreeLon;

  return area;
}

function calculatePerimeter(nodes: [number, number][]): number {
  let perimeter = 0;
  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    perimeter += haversineDistance(nodes[i][1], nodes[i][0], nodes[j][1], nodes[j][0]);
  }
  return perimeter;
}

function calculateOrientation(nodes: [number, number][]): { degrees: number; label: string; length: number; bearing: number } {
  let maxLength = 0;
  let bestEdge = { start: nodes[0], end: nodes[1] };

  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    const length = haversineDistance(nodes[i][1], nodes[i][0], nodes[j][1], nodes[j][0]);
    if (length > maxLength) {
      maxLength = length;
      bestEdge = { start: nodes[i], end: nodes[j] };
    }
  }

  const bearing = calculateBearing(bestEdge.start[1], bestEdge.start[0], bestEdge.end[1], bestEdge.end[0]);
  const degrees = bearing;

  let label = 'north-facing';
  if (degrees >= 22.5 && degrees < 67.5) label = 'northeast-facing';
  else if (degrees >= 67.5 && degrees < 112.5) label = 'east-facing';
  else if (degrees >= 112.5 && degrees < 157.5) label = 'southeast-facing';
  else if (degrees >= 157.5 && degrees < 202.5) label = 'south-facing';
  else if (degrees >= 202.5 && degrees < 247.5) label = 'southwest-facing';
  else if (degrees >= 247.5 && degrees < 292.5) label = 'west-facing';
  else if (degrees >= 292.5 && degrees < 337.5) label = 'northwest-facing';
  else label = 'north-facing';

  return { degrees, label, length: maxLength, bearing };
}

function findSharedWalls(targetBuilding: Polygon, nearbyBuildings: Polygon[]): SharedWall[] {
  const sharedWalls: SharedWall[] = [];
  const tolerance = 0.002; // ~2m tolerance for edge matching

  for (const building of nearbyBuildings) {
    for (let i = 0; i < targetBuilding.nodes.length; i++) {
      const j = (i + 1) % targetBuilding.nodes.length;
      const edge1: [[number, number], [number, number]] = [targetBuilding.nodes[i], targetBuilding.nodes[j]];

      for (let k = 0; k < building.nodes.length; k++) {
        const l = (k + 1) % building.nodes.length;
        const edge2: [[number, number], [number, number]] = [building.nodes[k], building.nodes[l]];

        const overlap = getEdgeOverlap(edge1, edge2, tolerance);
        if (overlap) {
          const bearing = calculateBearing(edge1[0][1], edge1[0][0], edge1[1][1], edge1[1][0]);
          sharedWalls.push({
            length_m: overlap,
            bearing_deg: bearing,
          });
        }
      }
    }
  }

  return sharedWalls;
}

// Geocoding helper
async function geocodePostcode(postcode: string, country = 'GB'): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `${postcode}-${country}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)},${country}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'EvolvingHome/1.0 (hello@evolvinghome.ai)',
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.length === 0) return null;

  const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  geocodeCache.set(cacheKey, result);
  return result;
}

// Utility functions

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) &&
        (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
      inside = !inside;
    }
  }
  return inside;
}

function calculateCentroid(nodes: [number, number][]): [number, number] {
  let x = 0, y = 0;
  for (const node of nodes) {
    x += node[0];
    y += node[1];
  }
  return [x / nodes.length, y / nodes.length];
}

function getEdgeOverlap(edge1: [[number, number], [number, number]], edge2: [[number, number], [number, number]], tolerance: number): number | null {
  // Simple overlap check for colinear edges
  const dist1 = pointToLineDistance(edge1[0], edge2[0], edge2[1]);
  const dist2 = pointToLineDistance(edge1[1], edge2[0], edge2[1]);
  if (dist1 < tolerance && dist2 < tolerance) {
    // Edges are close, check if they overlap
    const length1 = haversineDistance(edge1[0][1], edge1[0][0], edge1[1][1], edge1[1][0]);
    const length2 = haversineDistance(edge2[0][1], edge2[0][0], edge2[1][1], edge2[1][0]);
    return Math.min(length1, length2); // Approximate overlap length
  }
  return null;
}

function pointToLineDistance(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
  const A = point[0] - lineStart[0];
  const B = point[1] - lineStart[1];
  const C = lineEnd[0] - lineStart[0];
  const D = lineEnd[1] - lineStart[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = lineStart[0];
    yy = lineStart[1];
  } else if (param > 1) {
    xx = lineEnd[0];
    yy = lineEnd[1];
  } else {
    xx = lineStart[0] + param * C;
    yy = lineStart[1] + param * D;
  }

  return haversineDistance(point[1], point[0], yy, xx);
}

export { getBuildingGeometry, geocodePostcode };
export type { BuildingGeometry };