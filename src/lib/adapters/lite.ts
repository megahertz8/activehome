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
import { estimateSolarPotential } from '../solar';

export class LiteAdapter implements CountryAdapter {
  countryCode: string;
  countryName: string;
  currency: string;
  locale: string;

  constructor(countryCode: string) {
    this.countryCode = countryCode.toUpperCase();
    // Basic country info - could be expanded with a lookup table
    const countryMap: Record<string, { name: string; currency: string; locale: string }> = {
      'US': { name: 'United States', currency: 'USD', locale: 'en-US' },
      'DE': { name: 'Germany', currency: 'EUR', locale: 'de-DE' },
      'NL': { name: 'Netherlands', currency: 'EUR', locale: 'nl-NL' },
      'BE': { name: 'Belgium', currency: 'EUR', locale: 'fr-BE' },
      'IT': { name: 'Italy', currency: 'EUR', locale: 'it-IT' },
      'ES': { name: 'Spain', currency: 'EUR', locale: 'es-ES' },
      'PT': { name: 'Portugal', currency: 'EUR', locale: 'pt-PT' },
      'AT': { name: 'Austria', currency: 'EUR', locale: 'de-AT' },
      'SE': { name: 'Sweden', currency: 'SEK', locale: 'sv-SE' },
      'NO': { name: 'Norway', currency: 'NOK', locale: 'no-NO' },
      'DK': { name: 'Denmark', currency: 'DKK', locale: 'da-DK' },
      'FI': { name: 'Finland', currency: 'EUR', locale: 'fi-FI' },
      'PL': { name: 'Poland', currency: 'PLN', locale: 'pl-PL' },
      'CZ': { name: 'Czech Republic', currency: 'CZK', locale: 'cs-CZ' },
      'HU': { name: 'Hungary', currency: 'HUF', locale: 'hu-HU' },
      'SK': { name: 'Slovakia', currency: 'EUR', locale: 'sk-SK' },
      'SI': { name: 'Slovenia', currency: 'EUR', locale: 'sl-SI' },
      'HR': { name: 'Croatia', currency: 'EUR', locale: 'hr-HR' },
      'RO': { name: 'Romania', currency: 'RON', locale: 'ro-RO' },
      'BG': { name: 'Bulgaria', currency: 'BGN', locale: 'bg-BG' },
      'GR': { name: 'Greece', currency: 'EUR', locale: 'el-GR' },
      'TR': { name: 'Turkey', currency: 'TRY', locale: 'tr-TR' },
      'CH': { name: 'Switzerland', currency: 'CHF', locale: 'de-CH' },
      'AU': { name: 'Australia', currency: 'AUD', locale: 'en-AU' },
      'CA': { name: 'Canada', currency: 'CAD', locale: 'en-CA' },
      'NZ': { name: 'New Zealand', currency: 'NZD', locale: 'en-NZ' },
      'ZA': { name: 'South Africa', currency: 'ZAR', locale: 'en-ZA' },
      'JP': { name: 'Japan', currency: 'JPY', locale: 'ja-JP' },
      'KR': { name: 'South Korea', currency: 'KRW', locale: 'ko-KR' },
      'CN': { name: 'China', currency: 'CNY', locale: 'zh-CN' },
      'IN': { name: 'India', currency: 'INR', locale: 'en-IN' },
      'BR': { name: 'Brazil', currency: 'BRL', locale: 'pt-BR' },
      'MX': { name: 'Mexico', currency: 'MXN', locale: 'es-MX' },
      'AR': { name: 'Argentina', currency: 'ARS', locale: 'es-AR' },
      'CL': { name: 'Chile', currency: 'CLP', locale: 'es-CL' },
    };

    const info = countryMap[this.countryCode] || { name: 'Unknown Country', currency: 'EUR', locale: 'en-US' };
    this.countryName = info.name;
    this.currency = info.currency;
    this.locale = info.locale;
  }

  async searchByPostcode(postcode: string): Promise<AddressResult[]> {
    // Use Nominatim for geocoding
    try {
      const query = encodeURIComponent(`${postcode}, ${this.countryName}`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=10&countrycodes=${this.countryCode.toLowerCase()}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EvolvingHome/1.0' }
      });
      if (!response.ok) throw new Error('Nominatim API error');
      const data = await response.json();

      return data.map((item: any) => ({
        address: item.display_name,
        lmk: item.place_id.toString() // Use place_id as unique identifier
      }));
    } catch (error) {
      console.error('Nominatim search error:', error);
      return [];
    }
  }

  async getCertificate(id: string): Promise<EnergyData | null> {
    // Lite mode doesn't have pre-loaded certificates
    // This would typically come from user input or estimation
    return null;
  }

  calculateEnergyScore(data: EnergyData): EnergyScore {
    // Use provided data or estimates
    const currentEfficiency = data.currentEnergyEfficiency || 50; // Default to C rating
    const potentialEfficiency = data.potentialEnergyEfficiency || 70; // Improved

    // Estimate savings based on typical costs
    const annualConsumption = data.floorArea ? (data.floorArea * 100) : 12000; // kWh/m² estimate
    const improvement = (potentialEfficiency - currentEfficiency) / 100;
    const annualSavings = annualConsumption * improvement * 0.1; // Rough estimate

    return {
      current: currentEfficiency,
      potential: potentialEfficiency,
      savings: {
        annual: annualSavings,
        twentyYear: annualSavings * 20
      }
    };
  }

  getRatingScale(): RatingBand[] {
    // EU standard A-G scale based on kWh/m²/yr
    return [
      { letter: 'A', min: 0, max: 50, color: '#00a651', description: 'Very efficient' },
      { letter: 'B', min: 51, max: 90, color: '#50b848', description: 'Efficient' },
      { letter: 'C', min: 91, max: 150, color: '#b3d334', description: 'Average' },
      { letter: 'D', min: 151, max: 230, color: '#fef200', description: 'Below average' },
      { letter: 'E', min: 231, max: 330, color: '#f7941d', description: 'Poor' },
      { letter: 'F', min: 331, max: 450, color: '#ee1d23', description: 'Very poor' },
      { letter: 'G', min: 451, max: 999, color: '#a0171e', description: 'Extremely poor' }
    ];
  }

  async getEnergyPrices(region?: string): Promise<EnergyPrices> {
    // Generic EU/US average prices - in production, integrate real APIs
    const isEU = ['EUR', 'GBP', 'CHF'].includes(this.currency);
    const electricityRate = isEU ? 25 : 15; // cents/kWh
    const gasRate = isEU ? 8 : 5;

    return {
      region: region || this.countryName,
      electricityRate_p: electricityRate,
      gasRate_p: gasRate,
      currentAnnualCost: 0, // Would be calculated from consumption
      potentialAnnualCost: 0,
      liveSavings: 0
    };
  }

  async getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult> {
    // Use the same PVGIS API as UK/France
    return await estimateSolarPotential({ lat, lon, roofArea_m2: roofArea }) || {
      annualGeneration_kWh: 0,
      monthlyGeneration_kWh: [],
      peakPower_kWp: 0,
      annualSavings_GBP: 0,
      co2Saved_kg: 0
    };
  }

  async getAvailableGrants(data: EnergyData): Promise<Grant[]> {
    // No grants mapped for lite mode
    return [{
      scheme: 'Grants not yet mapped',
      amount: 'Contact local authorities',
      description: 'Grants and incentives not yet implemented for this country. Check with local government or energy agencies.'
    }];
  }

  getRecommendations(data: EnergyData): Recommendation[] {
    // Basic recommendations based on building age and type
    const recommendations: Recommendation[] = [];
    const age = this.estimateBuildingAge(data);
    const type = data.propertyType?.toLowerCase() || '';

    // Universal recommendations
    if (age > 1980 || data.wallsDescription?.toLowerCase().includes('uninsulated')) {
      recommendations.push({
        type: 'wall_insulation',
        description: 'Add wall insulation',
        cost_estimate: 8000,
        savings_kwh_year: 1200,
        payback_years: 7
      });
    }

    if (age > 1970 || data.roofDescription?.toLowerCase().includes('uninsulated')) {
      recommendations.push({
        type: 'roof_insulation',
        description: 'Add roof insulation',
        cost_estimate: 2500,
        savings_kwh_year: 600,
        payback_years: 4
      });
    }

    if (age > 1990 || data.windowsDescription?.toLowerCase().includes('single')) {
      recommendations.push({
        type: 'window_upgrade',
        description: 'Replace windows with double glazing',
        cost_estimate: 5000,
        savings_kwh_year: 400,
        payback_years: 12
      });
    }

    if (data.mainHeatDescription?.toLowerCase().includes('gas boiler') && age > 2000) {
      recommendations.push({
        type: 'ventilation_upgrade',
        description: 'Upgrade heating system',
        cost_estimate: 6000,
        savings_kwh_year: 800,
        payback_years: 8
      });
    }

    return recommendations.sort((a, b) => a.payback_years - b.payback_years);
  }

  getContractorSearchUrl(postcode: string, improvementType: string): string {
    // No specific contractor links for lite mode
    return `https://www.google.com/search?q=${encodeURIComponent(`${improvementType} contractor ${postcode} ${this.countryName}`)}`;
  }

  validatePostcode(postcode: string): boolean {
    // Generic validation - accept any non-empty string
    return postcode.trim().length > 0;
  }

  formatPostcode(postcode: string): string {
    return postcode.trim().toUpperCase();
  }

  private estimateBuildingAge(data: EnergyData): number {
    // Rough estimation from property type and descriptions
    const type = data.propertyType?.toLowerCase() || '';
    const walls = data.wallsDescription?.toLowerCase() || '';

    if (walls.includes('victorian') || walls.includes('edwardian')) return 1890;
    if (walls.includes('1930') || walls.includes('pre-1919')) return 1910;
    if (walls.includes('1919-1929')) return 1920;
    if (walls.includes('1930-1949')) return 1940;
    if (walls.includes('1950-1966')) return 1960;
    if (walls.includes('1967-1975')) return 1970;
    if (walls.includes('1976-1982')) return 1980;
    if (walls.includes('1983-1990')) return 1985;
    if (walls.includes('1991-1995')) return 1993;
    if (walls.includes('1996-2002')) return 1999;
    if (walls.includes('2003-2006')) return 2005;
    if (walls.includes('2007-2011')) return 2009;
    if (walls.includes('2012 onwards')) return 2015;

    // Fallback based on type
    if (type.includes('victorian')) return 1890;
    if (type.includes('modern')) return 2000;

    return 1980; // Default
  }
}