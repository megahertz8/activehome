import {
  CountryAdapter,
  AddressResult,
  EnergyData,
  EnergyScore,
  RatingBand,
  EnergyPrices,
  SolarResult,
  Grant,
  Recommendation
} from './types';

export class FranceAdapter implements CountryAdapter {
  countryCode = 'FR';
  countryName = 'France';
  currency = 'EUR';
  locale = 'fr-FR';

  async searchByPostcode(postcode: string): Promise<AddressResult[]> {
    // TODO: Implement DPE search from local SQLite DB
    // For now, return empty array
    console.log(`France adapter: searchByPostcode ${postcode} - not implemented`);
    return [];
  }

  async getCertificate(id: string): Promise<EnergyData | null> {
    // TODO: Implement DPE lookup from local SQLite DB
    // Map DPE fields to EnergyData
    console.log(`France adapter: getCertificate ${id} - not implemented`);
    return null;
  }

  calculateEnergyScore(data: EnergyData): EnergyScore {
    // DPE uses different scale (A-G same as UK but different thresholds)
    return {
      current: data.currentEnergyEfficiency,
      potential: data.potentialEnergyEfficiency,
      savings: {
        annual: 0, // TODO: Calculate based on DPE data
        twentyYear: 0
      }
    };
  }

  getRatingScale(): RatingBand[] {
    // DPE A-G scale (similar to UK EPC but different kWh/m² thresholds)
    return [
      { letter: 'A', min: 0, max: 50, color: '#00a651', description: 'Très performante' },
      { letter: 'B', min: 51, max: 90, color: '#50b848', description: 'Performante' },
      { letter: 'C', min: 91, max: 150, color: '#b3d334', description: 'Correcte' },
      { letter: 'D', min: 151, max: 230, color: '#fef200', description: 'Passable' },
      { letter: 'E', min: 231, max: 330, color: '#f7941d', description: 'Médiocre' },
      { letter: 'F', min: 331, max: 450, color: '#ee1d23', description: 'Mauvaise' },
      { letter: 'G', min: 451, max: 999, color: '#a0171e', description: 'Très mauvaise' }
    ];
  }

  async getEnergyPrices(region?: string): Promise<EnergyPrices> {
    // EDF regulated tariffs - hardcoded current rates
    return {
      region: region || 'France',
      electricityRate_p: 22, // ~0.22 €/kWh
      gasRate_p: 8, // ~0.08 €/kWh
      currentAnnualCost: 0, // TODO: Calculate based on consumption
      potentialAnnualCost: 0,
      liveSavings: 0
    };
  }

  async getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult> {
    // Use same PVGIS as UK (works for France too)
    // TODO: Import and use estimateSolarPotential from solar.ts
    return {
      annualGeneration_kWh: 0, // TODO: Calculate
      monthlyGeneration_kWh: [],
      peakPower_kWp: 0,
      annualSavings_GBP: 0, // Should be EUR
      co2Saved_kg: 0,
      paybackYears: 0
    };
  }

  async getAvailableGrants(data: EnergyData): Promise<Grant[]> {
    // MaPrimeRénov' grants
    const grants: Grant[] = [];

    const rating = data.currentEnergyRating;
    if (['D', 'E', 'F', 'G'].includes(rating)) {
      grants.push({
        scheme: 'MaPrimeRénov\'',
        amount: 'Up to €8,000',
        description: 'Government grant for energy efficiency improvements'
      });
    }

    // TODO: Add more specific grants based on DPE data
    return grants;
  }

  getRecommendations(data: EnergyData): Recommendation[] {
    // TODO: Implement based on DPE diagnostic recommendations
    return [];
  }

  getContractorSearchUrl(postcode: string, improvementType: string): string {
    // French contractor platforms
    return `https://www.quelleenergie.fr/`;
  }

  validatePostcode(postcode: string): boolean {
    // French postcodes are 5 digits
    return /^\d{5}$/.test(postcode.trim());
  }

  formatPostcode(postcode: string): string {
    return postcode.trim();
  }
}