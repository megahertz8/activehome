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

export class NetherlandsAdapter implements CountryAdapter {
  countryCode = 'NL';
  countryName = 'Netherlands';
  currency = 'EUR';
  locale = 'nl-NL';

  async searchByPostcode(postcode: string): Promise<AddressResult[]> {
    // TODO: Implement EP-Online API search (requires API key)
    // Search endpoint: https://www.ep-online.nl/
    // Can search by postcode + house number or BAG ID
    console.log(`Netherlands adapter: searchByPostcode ${postcode} - not implemented`);
    return [];
  }

  async getCertificate(id: string): Promise<EnergyData | null> {
    // TODO: Implement energielabel lookup from EP-Online
    // Requires API key from https://apikey.ep-online.nl
    // Map energielabel fields to EnergyData
    console.log(`Netherlands adapter: getCertificate ${id} - not implemented`);
    return null;
  }

  calculateEnergyScore(data: EnergyData): EnergyScore {
    // Dutch energielabel uses kWh/m²/year
    return {
      current: data.currentEnergyEfficiency,
      potential: data.potentialEnergyEfficiency,
      savings: {
        annual: 0, // TODO: Calculate based on energielabel data
        twentyYear: 0
      }
    };
  }

  getRatingScale(): RatingBand[] {
    // Dutch energielabel scale (A++++ to G)
    // Based on primary energy consumption in kWh/m²/year
    return [
      { letter: 'A++++', min: 0, max: 25, color: '#009036', description: 'Zeer zuinig' },
      { letter: 'A+++', min: 26, max: 50, color: '#46ae4a', description: 'Zeer zuinig' },
      { letter: 'A++', min: 51, max: 75, color: '#8fc742', description: 'Zeer zuinig' },
      { letter: 'A+', min: 76, max: 105, color: '#bcd636', description: 'Zuinig' },
      { letter: 'A', min: 106, max: 130, color: '#d6d52a', description: 'Zuinig' },
      { letter: 'B', min: 131, max: 165, color: '#f6eb1d', description: 'Gemiddeld' },
      { letter: 'C', min: 166, max: 195, color: '#fed500', description: 'Gemiddeld' },
      { letter: 'D', min: 196, max: 245, color: '#fcb713', description: 'Matig' },
      { letter: 'E', min: 246, max: 305, color: '#f68920', description: 'Matig' },
      { letter: 'F', min: 306, max: 370, color: '#ee652c', description: 'Onzuinig' },
      { letter: 'G', min: 371, max: 999, color: '#e42e1a', description: 'Zeer onzuinig' }
    ];
  }

  async getEnergyPrices(region?: string): Promise<EnergyPrices> {
    // Current 2025/2026 average prices from CBS (Centraal Bureau voor de Statistiek)
    // Electricity: ~€0.15/kWh, Gas: ~€0.60/m³
    const electricityRate_kWh = 0.1520; // €/kWh (Dec 2025)
    const gasRate_m3 = 0.6010; // €/m³ (Dec 2025)
    
    // Convert to pence for consistency with types (100 pence = 1 euro)
    const electricityRate_p = Math.round(electricityRate_kWh * 100);
    const gasRate_p = Math.round(gasRate_m3 * 100);

    return {
      region: region || 'Nederland',
      electricityRate_p, // ~15 cent/kWh
      gasRate_p, // ~60 cent/m³
      currentAnnualCost: 0, // TODO: Calculate based on consumption
      potentialAnnualCost: 0,
      liveSavings: 0
    };
  }

  async getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult> {
    // Netherlands has ~1000-1100 kWh/m²/year solar irradiation
    // Use PVGIS for accurate calculations (works for NL)
    // TODO: Import and use estimateSolarPotential from solar.ts
    
    // Rough estimate: 1 kWp generates ~900-950 kWh/year in NL
    // Typical panel: 1.7m² = ~400Wp
    const panelsCount = Math.floor(roofArea / 1.7);
    const peakPower_kWp = panelsCount * 0.4;
    const annualGeneration_kWh = peakPower_kWp * 925; // kWh/kWp/year avg for NL
    
    // Current electricity rate ~€0.15/kWh
    const annualSavings_EUR = annualGeneration_kWh * 0.15;
    const co2Saved_kg = annualGeneration_kWh * 0.475; // NL grid carbon intensity ~475g/kWh

    return {
      annualGeneration_kWh,
      monthlyGeneration_kWh: [], // TODO: Calculate monthly distribution
      peakPower_kWp,
      annualSavings_GBP: annualSavings_EUR, // Note: field name is GBP but value is EUR
      co2Saved_kg,
      paybackYears: peakPower_kWp > 0 ? Math.round((peakPower_kWp * 1000) / annualSavings_EUR) : 0
    };
  }

  async getAvailableGrants(data: EnergyData): Promise<Grant[]> {
    const grants: Grant[] = [];
    const rating = data.currentEnergyRating;

    // ISDE (Investeringssubsidie Duurzame Energie) 2026
    // For heat pumps, solar boilers, etc.
    if (['D', 'E', 'F', 'G'].includes(rating)) {
      grants.push({
        scheme: 'ISDE',
        amount: 'Tot €3.000',
        description: 'Subsidie voor warmtepomp, zonneboiler en andere duurzame energie'
      });
    }

    // Subsidieregeling energiebesparing eigen huis
    if (['C', 'D', 'E', 'F', 'G'].includes(rating)) {
      grants.push({
        scheme: 'Subsidieregeling energiebesparing eigen huis',
        amount: 'Tot €8.000',
        description: 'Subsidie voor isolatie (dak, muur, vloer, glas)'
      });
    }

    // Nationale Warmtefonds (low-interest loans)
    grants.push({
      scheme: 'Nationale Warmtefonds',
      amount: 'Lening vanaf 2%',
      description: 'Lening met lage rente voor energiebesparende maatregelen'
    });

    // Local municipality grants (placeholder)
    grants.push({
      scheme: 'Gemeentelijke regelingen',
      amount: 'Varieert',
      description: 'Check uw gemeente voor lokale subsidies en regelingen'
    });

    return grants;
  }

  getRecommendations(data: EnergyData): Recommendation[] {
    // TODO: Implement based on energielabel recommendations
    // Common improvements: roof insulation, wall insulation, HR++ glass, heat pump
    return [];
  }

  getContractorSearchUrl(postcode: string, improvementType: string): string {
    // Dutch contractor platforms
    // Verbeterjehuis.nl is the main government platform
    return `https://www.verbeterjehuis.nl/`;
  }

  validatePostcode(postcode: string): boolean {
    // Dutch postcodes are 4 digits + 2 letters (e.g., 1234 AB)
    // Format: 1234AB or 1234 AB
    const cleaned = postcode.trim().replace(/\s+/g, '').toUpperCase();
    return /^\d{4}[A-Z]{2}$/.test(cleaned);
  }

  formatPostcode(postcode: string): string {
    // Format as "1234 AB"
    const cleaned = postcode.trim().replace(/\s+/g, '').toUpperCase();
    if (this.validatePostcode(cleaned)) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    return postcode.trim();
  }
}
