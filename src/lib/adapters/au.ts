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

export class AustraliaAdapter implements CountryAdapter {
  countryCode = 'AU';
  countryName = 'Australia';
  currency = 'AUD';
  locale = 'en-AU';

  async searchByPostcode(postcode: string): Promise<AddressResult[]> {
    // TODO: Integrate with NatHERS / state databases
    console.log(`Australia adapter: searchByPostcode ${postcode} - not yet implemented`);
    return [];
  }

  async getCertificate(id: string): Promise<EnergyData | null> {
    console.log(`Australia adapter: getCertificate ${id} - not yet implemented`);
    return null;
  }

  calculateEnergyScore(data: EnergyData): EnergyScore {
    return {
      current: data.currentEnergyEfficiency,
      potential: data.potentialEnergyEfficiency,
      savings: {
        annual: (data.heatingCostCurrent + data.hotWaterCostCurrent + data.lightingCostCurrent) -
                (data.heatingCostPotential + data.hotWaterCostPotential + data.lightingCostPotential),
        twentyYear: ((data.heatingCostCurrent + data.hotWaterCostCurrent + data.lightingCostCurrent) -
                     (data.heatingCostPotential + data.hotWaterCostPotential + data.lightingCostPotential)) * 20,
      },
    };
  }

  getRatingScale(): RatingBand[] {
    // NatHERS 0-10 star scale
    return [
      { letter: '10★', min: 90, max: 100, color: '#00A651', description: 'Net zero / Passivhaus' },
      { letter: '8-9★', min: 70, max: 89, color: '#50B848', description: 'Excellent efficiency' },
      { letter: '7★', min: 60, max: 69, color: '#8DC63F', description: 'New build minimum (2024+)' },
      { letter: '5-6★', min: 40, max: 59, color: '#FFC20E', description: 'Average existing home' },
      { letter: '3-4★', min: 20, max: 39, color: '#F7941D', description: 'Below average' },
      { letter: '1-2★', min: 1, max: 19, color: '#ED1C24', description: 'Poor — urgent upgrades needed' },
      { letter: '0★', min: 0, max: 0, color: '#BE1E2D', description: 'Unrated' },
    ];
  }

  async getEnergyPrices(region?: string): Promise<EnergyPrices> {
    // Australian average energy prices (AUD)
    return {
      region: region || 'National Average',
      electricityRate_p: 33, // cents/kWh
      gasRate_p: 4, // cents/MJ
      currentAnnualCost: 2400,
      potentialAnnualCost: 1400,
      liveSavings: 1000,
    };
  }

  async getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult> {
    // Australia has excellent solar — 1500-1800 kWh/kWp/year
    const kWp = Math.min(roofArea * 0.15, 10); // 150W/m², max 10kWp
    const irradiance = lat < -25 ? 1700 : 1500; // higher in north
    const annualGen = kWp * irradiance;
    return {
      annualGeneration_kWh: annualGen,
      monthlyGeneration_kWh: Array(12).fill(annualGen / 12),
      peakPower_kWp: kWp,
      annualSavings_GBP: annualGen * 0.33, // using AU electricity rate
      co2Saved_kg: annualGen * 0.79, // AU grid factor
      paybackYears: (kWp * 1200) / (annualGen * 0.33), // ~$1200/kWp installed
    };
  }

  async getAvailableGrants(data: EnergyData): Promise<Grant[]> {
    return [
      { scheme: 'STCs (Federal)', amount: 'Varies by system size & zone', description: 'Small-scale Technology Certificates — upfront discount on solar, heat pumps, hot water' },
      { scheme: 'VEECs (VIC)', amount: 'Up to $1,400', description: 'Victorian Energy Efficiency Certificates for insulation, heating, hot water' },
      { scheme: 'ESS (NSW)', amount: 'Varies', description: 'Energy Savings Scheme — discounts on efficient appliances and upgrades' },
      { scheme: 'SA REPS', amount: 'Varies', description: 'Retailer Energy Productivity Scheme — South Australia energy efficiency incentives' },
      { scheme: 'QLD Battery Booster', amount: 'Up to $4,000', description: 'Queensland rebate for home battery systems' },
    ];
  }

  getRecommendations(data: EnergyData): Recommendation[] {
    const recs: Recommendation[] = [];
    if (data.wallsDescription?.toLowerCase().includes('uninsulated')) {
      recs.push({ type: 'wall_insulation', description: 'Add wall insulation (R2.5+ batts)', cost_estimate: 6000, savings_kwh_year: 2500, payback_years: 7 });
    }
    if (data.roofDescription?.toLowerCase().includes('uninsulated')) {
      recs.push({ type: 'roof_insulation', description: 'Upgrade ceiling insulation to R6.0+', cost_estimate: 3000, savings_kwh_year: 3000, payback_years: 3 });
    }
    if (data.mainHeatDescription?.toLowerCase().includes('gas') || data.mainFuel?.toLowerCase().includes('gas')) {
      recs.push({ type: 'wall_insulation', description: 'Replace gas heating with reverse-cycle heat pump', cost_estimate: 4500, savings_kwh_year: 4000, payback_years: 4 });
    }
    return recs;
  }

  getContractorSearchUrl(postcode: string, improvementType: string): string {
    return `https://www.hipages.com.au/find/${improvementType}?postcode=${postcode}&utm_source=evolvinghome&utm_medium=affiliate`;
  }

  validatePostcode(postcode: string): boolean {
    return /^[0-9]{4}$/.test(postcode.trim());
  }

  formatPostcode(postcode: string): string {
    return postcode.trim();
  }
}
