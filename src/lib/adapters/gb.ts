import {
  CountryAdapter,
  AddressResult,
  EnergyData,
  EnergyScore,
  RatingBand,
  EnergyPrices,
  SolarResult,
  Grant,
  Recommendation,
  CountryInfo
} from './types';

// Extracted from existing UK-specific code
import { searchByPostcode as apiSearchByPostcode, getCertificate as apiGetCertificate } from '../epc-api';
import { searchByPostcode as dbSearchByPostcode, getByAddress, getPostcodeStats, calculateSavings, checkGrants } from '../epc-local';
import { getEnergyPricesFromPostcode } from '../energy-prices';
import { estimateSolarPotential } from '../solar';
import { calculateEnhancedEnergy } from '../energy-calc';

export class UKAdapter implements CountryAdapter {
  countryCode = 'GB';
  countryName = 'United Kingdom';
  currency = 'GBP';
  locale = 'en-GB';

  async searchByPostcode(postcode: string): Promise<AddressResult[]> {
    // First try local DB
    try {
      const results = dbSearchByPostcode(postcode);
      if (results.length > 0) {
        const seen = new Map<string, AddressResult>();
        for (const row of results) {
          if (!seen.has(row.address)) {
            seen.set(row.address, { address: row.address, lmk: row.lmk_key });
          }
        }
        return Array.from(seen.values()).sort((a, b) => a.address.localeCompare(b.address));
      }
    } catch (err) {
      console.warn("Local DB search failed:", err);
    }

    // Fallback to API
    try {
      const addresses = await apiSearchByPostcode(postcode);
      return addresses.map(a => ({ address: a.address, lmk: a.lmk }));
    } catch (err) {
      console.error("API search failed:", err);
      return [];
    }
  }

  async getCertificate(id: string): Promise<EnergyData | null> {
    // First try local DB
    try {
      const result = getByAddress('', ''); // Need to implement proper lookup
      if (result) {
        return {
          id: result.lmk_key,
          address: result.address,
          postcode: result.postcode,
          currentEnergyRating: result.current_energy_rating,
          potentialEnergyRating: result.potential_energy_rating,
          currentEnergyEfficiency: result.current_energy_efficiency,
          potentialEnergyEfficiency: result.potential_energy_efficiency,
          propertyType: result.property_type,
          floorArea: result.total_floor_area,
          heatingCostCurrent: result.heating_cost_current,
          hotWaterCostCurrent: result.hot_water_cost_current,
          lightingCostCurrent: result.lighting_cost_current,
          heatingCostPotential: result.heating_cost_potential,
          hotWaterCostPotential: result.hot_water_cost_potential,
          lightingCostPotential: result.lighting_cost_potential,
          wallsDescription: result.walls_description,
          roofDescription: result.roof_description,
          floorDescription: result.floor_description,
          windowsDescription: result.windows_description,
          mainHeatDescription: result.mainheat_description,
          mainFuel: result.main_fuel,
          lodgementDate: result.lodgement_date,
          localAuthority: result.local_authority
        };
      }
    } catch (err) {
      console.warn("Local DB get failed:", err);
    }

    // Fallback to API
    try {
      const cert = await apiGetCertificate(id);
      if (cert) {
        return {
          id: cert.lmk_key,
          address: cert.address,
          postcode: cert.postcode,
          currentEnergyRating: cert.current_energy_rating,
          potentialEnergyRating: cert.potential_energy_rating,
          currentEnergyEfficiency: cert.current_energy_efficiency,
          potentialEnergyEfficiency: cert.potential_energy_efficiency,
          propertyType: cert.property_type,
          floorArea: cert.total_floor_area,
          heatingCostCurrent: cert.heating_cost_current,
          hotWaterCostCurrent: cert.hot_water_cost_current,
          lightingCostCurrent: cert.lighting_cost_current,
          heatingCostPotential: cert.heating_cost_potential,
          hotWaterCostPotential: cert.hot_water_cost_potential,
          lightingCostPotential: cert.lighting_cost_potential,
          wallsDescription: cert.walls_description,
          roofDescription: cert.roof_description,
          floorDescription: cert.floor_description,
          windowsDescription: cert.windows_description,
          mainHeatDescription: cert.mainheat_description,
          mainFuel: cert.main_fuel,
          lodgementDate: cert.lodgement_date,
          localAuthority: cert.local_authority
        };
      }
    } catch (err) {
      console.error("API get failed:", err);
    }

    return null;
  }

  calculateEnergyScore(data: EnergyData): EnergyScore {
    const savings = calculateSavings({
      heating_cost_current: data.heatingCostCurrent,
      hot_water_cost_current: data.hotWaterCostCurrent,
      lighting_cost_current: data.lightingCostCurrent,
      heating_cost_potential: data.heatingCostPotential,
      hot_water_cost_potential: data.hotWaterCostPotential,
      lighting_cost_potential: data.lightingCostPotential
    } as any);

    return {
      current: data.currentEnergyEfficiency,
      potential: data.potentialEnergyEfficiency,
      savings: {
        annual: savings.annualSavings,
        twentyYear: savings.twentyYearSavings
      }
    };
  }

  getRatingScale(): RatingBand[] {
    return [
      { letter: 'A', min: 92, max: 100, color: '#00a651', description: 'Very efficient' },
      { letter: 'B', min: 81, max: 91, color: '#50b848', description: 'Efficient' },
      { letter: 'C', min: 69, max: 80, color: '#b3d334', description: 'Average' },
      { letter: 'D', min: 55, max: 68, color: '#fef200', description: 'Below average' },
      { letter: 'E', min: 39, max: 54, color: '#f7941d', description: 'Poor' },
      { letter: 'F', min: 21, max: 38, color: '#ee1d23', description: 'Very poor' },
      { letter: 'G', min: 0, max: 20, color: '#a0171e', description: 'Extremely poor' }
    ];
  }

  async getEnergyPrices(region?: string): Promise<EnergyPrices> {
    // For UK, region is derived from postcode, but we can use default
    const prices = await getEnergyPricesFromPostcode('', 0, 0);
    return prices || {
      region: 'Unknown',
      electricityRate_p: 28,
      gasRate_p: 10,
      currentAnnualCost: 0,
      potentialAnnualCost: 0,
      liveSavings: 0
    };
  }

  async getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult> {
    const result = await estimateSolarPotential({ lat, lon, roofArea_m2: roofArea });
    return result || {
      annualGeneration_kWh: 0,
      monthlyGeneration_kWh: [],
      peakPower_kWp: 0,
      annualSavings_GBP: 0,
      co2Saved_kg: 0
    };
  }

  async getAvailableGrants(data: EnergyData): Promise<Grant[]> {
    return checkGrants({
      current_energy_rating: data.currentEnergyRating,
      main_fuel: data.mainFuel,
      mainheat_description: data.mainHeatDescription
    } as any);
  }

  getRecommendations(data: EnergyData): Recommendation[] {
    // Extract from energy-calc.ts logic
    const recommendations: Recommendation[] = [];

    const wallsDesc = data.wallsDescription || '';
    const roofDesc = data.roofDescription || '';
    const windowsDesc = data.windowsDescription || '';

    // Simple heuristics based on descriptions
    if (wallsDesc.toLowerCase().includes('unfilled') || wallsDesc.toLowerCase().includes('cavity')) {
      recommendations.push({
        type: 'wall_insulation',
        description: 'Add wall insulation',
        cost_estimate: 5000,
        savings_kwh_year: 1000,
        payback_years: 5
      });
    }

    if (roofDesc.toLowerCase().includes('uninsulated')) {
      recommendations.push({
        type: 'roof_insulation',
        description: 'Add roof insulation',
        cost_estimate: 2000,
        savings_kwh_year: 500,
        payback_years: 4
      });
    }

    if (windowsDesc.toLowerCase().includes('single') || windowsDesc.toLowerCase().includes('old')) {
      recommendations.push({
        type: 'window_upgrade',
        description: 'Replace windows',
        cost_estimate: 3000,
        savings_kwh_year: 300,
        payback_years: 10
      });
    }

    return recommendations.sort((a, b) => a.payback_years - b.payback_years);
  }

  getContractorSearchUrl(postcode: string, improvementType: string): string {
    // UK contractor platforms
    const baseUrls = {
      wall_insulation: 'https://www.checkatrade.com/',
      roof_insulation: 'https://www.checkatrade.com/',
      window_upgrade: 'https://www.checkatrade.com/'
    };
    return baseUrls[improvementType as keyof typeof baseUrls] || 'https://www.checkatrade.com/';
  }

  validatePostcode(postcode: string): boolean {
    const regex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    return regex.test(postcode.trim());
  }

  formatPostcode(postcode: string): string {
    const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
    if (cleaned.length < 5) return cleaned;
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
}