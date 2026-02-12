/**
 * Octopus Energy Price Integration
 *
 * Fetches live energy prices from Octopus Energy API.
 * Supports electricity and gas tariffs by region.
 */

import { getRegionFromPostcode } from './uk-regions';

export interface EnergyPrices {
  region: string;
  electricityRate_p: number; // pence/kWh
  gasRate_p: number; // pence/kWh
  currentAnnualCost: number;
  potentialAnnualCost: number;
  liveSavings: number;
}

const OCTOPUS_API_BASE = 'https://api.octopus.energy/v1';
const DEFAULT_ELECTRICITY_PRODUCT = 'AGILE-18-02-21';
const DEFAULT_GAS_PRODUCT = 'GAS-EXPORT-19-11-21';

// Cache for price data
const priceCache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get live energy prices for a region
 * @param region Octopus region code (A-P)
 * @param electricityDemand Annual electricity demand in kWh
 * @param gasDemand Annual gas demand in kWh
 * @returns Energy prices and costs
 */
export async function getEnergyPrices(
  region: string,
  electricityDemand: number,
  gasDemand: number
): Promise<EnergyPrices | null> {
  try {
    const cacheKey = `${region}-${electricityDemand}-${gasDemand}`;
    const now = Date.now();
    const cached = priceCache.get(cacheKey);
    if (cached && cached.expiry > now) {
      return calculateCosts(cached.data, region, electricityDemand, gasDemand);
    }

    // Fetch electricity prices
    const elecPrices = await fetchElectricityPrices(region);
    const gasPrices = await fetchGasPrices(region);

    const data = { elecPrices, gasPrices };
    priceCache.set(cacheKey, { data, expiry: now + CACHE_DURATION_MS });

    return calculateCosts(data, region, electricityDemand, gasDemand);
  } catch (error) {
    console.error('Failed to fetch energy prices:', error);
    return null;
  }
}

/**
 * Get energy prices from postcode
 * @param postcode UK postcode
 * @param electricityDemand Annual electricity demand in kWh
 * @param gasDemand Annual gas demand in kWh
 * @returns Energy prices and costs
 */
export async function getEnergyPricesFromPostcode(
  postcode: string,
  electricityDemand: number,
  gasDemand: number
): Promise<EnergyPrices | null> {
  const region = getRegionFromPostcode(postcode);
  return getEnergyPrices(region, electricityDemand, gasDemand);
}

/**
 * Fetch electricity prices for region
 * @param region Octopus region code
 * @returns Electricity tariff data
 */
async function fetchElectricityPrices(region: string) {
  const url = `${OCTOPUS_API_BASE}/products/${DEFAULT_ELECTRICITY_PRODUCT}/electricity-tariffs/E-1R-${DEFAULT_ELECTRICITY_PRODUCT}-${region}/standard-unit-rates/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Electricity API error: ${response.status}`);
  return response.json();
}

/**
 * Fetch gas prices for region
 * @param region Octopus region code
 * @returns Gas tariff data
 */
async function fetchGasPrices(region: string) {
  const url = `${OCTOPUS_API_BASE}/products/${DEFAULT_GAS_PRODUCT}/gas-tariffs/G-1R-${DEFAULT_GAS_PRODUCT}-${region}/standard-unit-rates/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gas API error: ${response.status}`);
  return response.json();
}

/**
 * Calculate costs from price data
 * @param data Price data
 * @param region Region code
 * @param electricityDemand Electricity demand kWh
 * @param gasDemand Gas demand kWh
 * @returns Calculated prices and costs
 */
function calculateCosts(
  data: { elecPrices: any; gasPrices: any },
  region: string,
  electricityDemand: number,
  gasDemand: number
): EnergyPrices {
  // Extract average rates (simplified - in practice would average over time)
  const elecRate = data.elecPrices?.results?.[0]?.value_inc_vat || 24.5;
  const gasRate = data.gasPrices?.results?.[0]?.value_inc_vat || 6.2;

  // Calculate current costs (assuming all consumption is at current rates)
  const currentElecCost = (electricityDemand * elecRate) / 100; // Convert pence to £
  const currentGasCost = (gasDemand * gasRate) / 100;
  const currentAnnualCost = Math.round(currentElecCost + currentGasCost);

  // Potential costs (assume 20% reduction from efficiency improvements)
  const potentialAnnualCost = Math.round(currentAnnualCost * 0.8);
  const liveSavings = currentAnnualCost - potentialAnnualCost;

  return {
    region: getRegionName(region),
    electricityRate_p: elecRate,
    gasRate_p: gasRate,
    currentAnnualCost,
    potentialAnnualCost,
    liveSavings
  };
}

/**
 * Get human-readable region name
 * @param region Octopus region code
 * @returns Region name
 */
function getRegionName(region: string): string {
  const regions: Record<string, string> = {
    'A': 'Eastern England',
    'B': 'East Midlands',
    'C': 'London',
    'D': 'Merseyside and Northern Wales',
    'E': 'West Midlands',
    'F': 'North Eastern England',
    'G': 'North Western England',
    'H': 'Southern England',
    'I': 'South Eastern England',
    'J': 'Southern Scotland',
    'K': 'Southern Wales',
    'L': 'South Western England',
    'M': 'Yorkshire',
    'N': 'Northern Scotland',
    'P': 'Southern Scotland'
  };
  return regions[region] || region;
}