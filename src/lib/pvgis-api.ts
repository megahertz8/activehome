import type { SolarResult } from './solar';

const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_3';

export async function fetchPVGIS(
  lat: number,
  lon: number,
  peakPower: number,
  tilt: number,
  azimuth: number,
  losses: number
): Promise<SolarResult | null> {
  try {
    const url = `${PVGIS_BASE_URL}/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${losses}&angle=${tilt}&aspect=${azimuth}&outputformat=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PVGIS API error: ${response.status}`);
    }
    const data = await response.json();

    if (!data.outputs || !data.outputs.monthly || !data.outputs.totals) {
      return null;
    }

    const monthly = data.outputs.monthly.fixed || data.outputs.monthly;
    const annual = data.outputs.totals.fixed?.E_y || data.outputs.totals.E_y;

    if (!annual || !Array.isArray(monthly)) {
      return null;
    }

    const monthlyGeneration = monthly.map((m: { E_m?: number }) => m.E_m || 0);
    const annualGeneration = annual;

    return {
      annualGeneration_kWh: annualGeneration,
      monthlyGeneration_kWh: monthlyGeneration,
      peakPower_kWp: peakPower,
      annualSavings_GBP: 0, // Will be calculated in solar.ts
      co2Saved_kg: 0,
    };
  } catch (error) {
    console.error('PVGIS fetch error:', error);
    return null;
  }
}