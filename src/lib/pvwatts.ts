import type { SolarResult } from './solar';

const PVWATTS_BASE_URL = 'https://developer.nrel.gov/api/pvwatts/v8.json';
const API_KEY = process.env.NREL_API_KEY;

export async function fetchPVWatts(
  lat: number,
  lon: number,
  peakPower: number,
  tilt: number,
  azimuth: number,
  losses: number
): Promise<SolarResult | null> {
  if (!API_KEY) {
    console.warn('NREL_API_KEY not set, skipping PVWatts');
    return null;
  }

  try {
    const url = `${PVWATTS_BASE_URL}?api_key=${API_KEY}&lat=${lat}&lon=${lon}&system_capacity=${peakPower}&losses=${losses}&tilt=${tilt}&azimuth=${azimuth}&array_type=1&module_type=0&outputformat=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PVWatts API error: ${response.status}`);
    }
    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      console.error('PVWatts errors:', data.errors);
      return null;
    }

    const outputs = data.outputs;
    if (!outputs || !outputs.ac_annual || !outputs.ac_monthly) {
      return null;
    }

    return {
      annualGeneration_kWh: outputs.ac_annual,
      monthlyGeneration_kWh: outputs.ac_monthly,
      peakPower_kWp: peakPower,
      annualSavings_GBP: 0,
      co2Saved_kg: 0,
    };
  } catch (error) {
    console.error('PVWatts fetch error:', error);
    return null;
  }
}