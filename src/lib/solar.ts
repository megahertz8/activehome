import { fetchPVGIS } from './pvgis';
import { fetchPVWatts } from './pvwatts';

export interface SolarParams {
  lat: number;
  lon: number;
  roofArea_m2?: number;
  peakPower_kWp?: number;
  tilt?: number;
  azimuth?: number;
  losses?: number;
}

export interface SolarResult {
  annualGeneration_kWh: number;
  monthlyGeneration_kWh: number[];
  peakPower_kWp: number;
  annualSavings_GBP: number;
  co2Saved_kg: number;
  paybackYears?: number; // Optional, if cost known
}

const CO2_PER_KWH = 0.231; // kg/kWh, approximate UK grid
const ELECTRICITY_RATE_P_PER_KWH = 28; // Approximate UK rate
const EXPORT_RATE_P_PER_KWH = 15; // SEG rate
const SELF_CONSUMPTION_FRACTION = 0.5;

// Cache for solar data: key -> { data, expiry }
const solarCache = new Map<string, { data: SolarResult; expiry: number }>();
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function estimateSolarPotential(params: SolarParams): Promise<SolarResult | null> {
  const {
    lat,
    lon,
    roofArea_m2,
    peakPower_kWp,
    tilt = 35, // UK typical roof pitch
    azimuth = 0, // South-facing
    losses = 14, // Standard losses
  } = params;

  // Determine peakPower: if not provided, estimate from roofArea
  let peakPower = peakPower_kWp;
  if (!peakPower && roofArea_m2) {
    // Assume ~0.15 kWp per m² roof area (accounting for pitch, spacing)
    peakPower = roofArea_m2 * 0.15;
  }
  if (!peakPower) {
    // Default to 4 kWp if no info
    peakPower = 4;
  }

  // Cache key: rounded lat/lon to 0.01°
  const cacheKey = `${Math.round(lat * 100) / 100}-${Math.round(lon * 100) / 100}-${peakPower}-${tilt}-${azimuth}-${losses}`;
  const now = Date.now();
  const cached = solarCache.get(cacheKey);
  if (cached && cached.expiry > now) {
    return cached.data;
  }

  // Determine region: UK/EU -> PVGIS, US -> PVWatts
  const isUK = lat > 49 && lat < 61 && lon > -11 && lon < 2; // Rough UK bounds
  let result: SolarResult | null = null;

  if (isUK) {
    result = await fetchPVGIS(lat, lon, peakPower, tilt, azimuth, losses);
  } else {
    result = await fetchPVWatts(lat, lon, peakPower, tilt, azimuth, losses);
  }

  if (!result) {
    return null; // API failed
  }

  // Calculate financials
  const generation = result.annualGeneration_kWh;
  const selfConsumptionSavings = generation * SELF_CONSUMPTION_FRACTION * (ELECTRICITY_RATE_P_PER_KWH / 100);
  const exportIncome = generation * (1 - SELF_CONSUMPTION_FRACTION) * (EXPORT_RATE_P_PER_KWH / 100);
  result.annualSavings_GBP = selfConsumptionSavings + exportIncome;
  result.co2Saved_kg = generation * CO2_PER_KWH;
  result.peakPower_kWp = peakPower;

  // Cache the result
  solarCache.set(cacheKey, { data: result, expiry: now + CACHE_DURATION_MS });

  return result;
}

export function estimateRoofCapacity(floorArea_m2: number, floors: number, propertyType: string): number {
  let percentage = 0;
  switch (propertyType.toLowerCase()) {
    case 'detached':
      percentage = 0.4;
      break;
    case 'semi':
    case 'semi-detached':
      percentage = 0.3;
      break;
    case 'terrace':
    case 'terraced':
      percentage = 0.25;
      break;
    case 'flat':
      percentage = 0.1;
      break;
    default:
      percentage = 0.3; // Default to semi
  }
  return floorArea_m2 * percentage;
}

export function calculateSolarSavings(
  generation_kWh: number,
  electricityRate_pPerKwh: number = ELECTRICITY_RATE_P_PER_KWH,
  exportRate_pPerKwh: number = EXPORT_RATE_P_PER_KWH
): { annualSavings_GBP: number; exportIncome_GBP: number } {
  const selfConsumptionSavings = generation_kWh * SELF_CONSUMPTION_FRACTION * (electricityRate_pPerKwh / 100);
  const exportIncome = generation_kWh * (1 - SELF_CONSUMPTION_FRACTION) * (exportRate_pPerKwh / 100);
  return {
    annualSavings_GBP: selfConsumptionSavings + exportIncome,
    exportIncome_GBP: exportIncome,
  };
}