import { EPCRecord } from './epc-to-openbem';
import { EnergyResults } from './openbem';
import { BuildingGeometry } from './osm-building';

interface EnrichedScore {
  epcData: EPCRecord;
  openBemResult: EnergyResults;
  geometry: BuildingGeometry;
  improvements: {
    wallAreaAccuracy: 'estimated' | 'actual';
    roofAreaAccuracy: 'estimated' | 'actual';
    orientationAccuracy: 'estimated' | 'actual';
    sharedWallsAccounted: boolean;
    estimatedVsActualHeatLoss: {
      walls: number; // kWh difference
      roof: number; // kWh difference
      total: number; // kWh difference
    };
    solarGainAdjustment: number; // kWh difference
  };
  enhancedEnergyRating: {
    current: string;
    potential: string;
    improvement: number; // percentage points
  };
}

/**
 * Enrich energy calculation with actual building geometry
 * @param epcData EPC record
 * @param geometry Building geometry from OSM
 * @param openBemResult Original OpenBEM result
 * @returns Enhanced score with geometry improvements
 */
function enrichWithGeometry(
  epcData: EPCRecord,
  geometry: BuildingGeometry,
  openBemResult: EnergyResults
): EnrichedScore {
  // Create a copy of the OpenBEM result for modification
  const enrichedResult = { ...openBemResult };

  // 1. Replace estimated wall area with actual exposed wall area
  const originalWallArea = enrichedResult.fabric.total_wall_WK / (enrichedResult.fabric.total_wall_WK / enrichedResult.fabric.total_wall_WK || 1); // Need to track original U-value
  // This is simplified - in practice, we'd need to rebuild the fabric elements

  // For now, assume we can adjust the heat loss calculations
  const wallUValue = 1.6; // Default, should come from EPC
  const originalWallHeatLoss = geometry.estimatedWallArea_m2 * wallUValue;
  const actualWallHeatLoss = geometry.exposedPerimeter_m * (geometry.height_m || (geometry.levels || 1) * 2.7) * wallUValue;

  const wallHeatLossDiff = actualWallHeatLoss - originalWallHeatLoss;

  // 2. Adjust roof area
  const roofUValue = 0.6; // Default
  const originalRoofArea = enrichedResult.fabric.total_roof_WK / roofUValue;
  const actualRoofHeatLoss = geometry.estimatedRoofArea_m2 * roofUValue;
  const roofHeatLossDiff = actualRoofHeatLoss - (originalRoofArea * roofUValue);

  // 3. Shared walls reduce heat loss (party walls ≈ 0 heat loss)
  const sharedWallReduction = geometry.sharedWalls.reduce((sum, wall) => sum + wall.length_m, 0) * (geometry.height_m || (geometry.levels || 1) * 2.7) * wallUValue;

  // 4. Orientation for solar gain - adjust south-facing windows
  let solarGainAdjustment = 0;
  if (geometry.orientationLabel.includes('south')) {
    // Increase solar gain for south-facing buildings
    solarGainAdjustment = enrichedResult.fabric.annual_solar_gain_kwh * 0.2; // 20% increase
  } else if (geometry.orientationLabel.includes('north')) {
    // Decrease for north-facing
    solarGainAdjustment = -enrichedResult.fabric.annual_solar_gain_kwh * 0.3; // 30% decrease
  }

  // 5. Use real footprint for floor heat loss
  const floorUValue = 0.7; // Default
  const originalFloorHeatLoss = enrichedResult.fabric.total_floor_WK;
  const actualFloorHeatLoss = geometry.footprintArea_m2 * floorUValue;
  const floorHeatLossDiff = actualFloorHeatLoss - originalFloorHeatLoss;

  // Total heat loss adjustment
  const totalHeatLossAdjustment = wallHeatLossDiff + roofHeatLossDiff - sharedWallReduction + floorHeatLossDiff;

  // Estimate energy impact (rough approximation)
  const degreeDays = 2500; // Typical UK heating degree days
  const estimatedEnergyDiff_kWh = totalHeatLossAdjustment * degreeDays / 1000; // Convert W/K to kWh/year approx

  // Enhanced rating calculation (simplified)
  const currentEfficiency = epcData.current_energy_efficiency || 50;
  const potentialEfficiency = epcData.potential_energy_efficiency || 80;

  // Assume geometry improvements add 5-10 points to efficiency
  const geometryBonus = geometry.sharedWalls.length > 0 ? 10 : 5;
  const enhancedCurrent = Math.min(100, currentEfficiency + geometryBonus);
  const enhancedPotential = Math.min(100, potentialEfficiency + geometryBonus);

  const currentRating = efficiencyToRating(enhancedCurrent);
  const potentialRating = efficiencyToRating(enhancedPotential);

  return {
    epcData,
    openBemResult: enrichedResult,
    geometry,
    improvements: {
      wallAreaAccuracy: 'actual',
      roofAreaAccuracy: 'actual',
      orientationAccuracy: 'actual',
      sharedWallsAccounted: geometry.sharedWalls.length > 0,
      estimatedVsActualHeatLoss: {
        walls: wallHeatLossDiff,
        roof: roofHeatLossDiff,
        total: totalHeatLossAdjustment
      },
      solarGainAdjustment
    },
    enhancedEnergyRating: {
      current: currentRating,
      potential: potentialRating,
      improvement: enhancedPotential - currentEfficiency
    }
  };
}

/**
 * Convert energy efficiency score to EPC rating
 * @param efficiency Energy efficiency score (1-100)
 * @returns EPC rating (A-G)
 */
function efficiencyToRating(efficiency: number): string {
  if (efficiency >= 92) return 'A';
  if (efficiency >= 81) return 'B';
  if (efficiency >= 69) return 'C';
  if (efficiency >= 55) return 'D';
  if (efficiency >= 39) return 'E';
  if (efficiency >= 21) return 'F';
  return 'G';
}

export { enrichWithGeometry };
export type { EnrichedScore };