// Country Adapter Types

export interface AddressResult {
  address: string;
  lmk?: string; // UK-specific, optional for other countries
}

export interface EnergyData {
  id: string;
  address: string;
  postcode: string;
  currentEnergyRating: string;
  potentialEnergyRating: string;
  currentEnergyEfficiency: number;
  potentialEnergyEfficiency: number;
  propertyType: string;
  floorArea: number;
  heatingCostCurrent: number;
  hotWaterCostCurrent: number;
  lightingCostCurrent: number;
  heatingCostPotential: number;
  hotWaterCostPotential: number;
  lightingCostPotential: number;
  wallsDescription: string;
  roofDescription: string;
  floorDescription: string;
  windowsDescription: string;
  mainHeatDescription: string;
  mainFuel: string;
  lodgementDate?: string;
  localAuthority?: string;
}

export interface EnergyScore {
  current: number;
  potential: number;
  savings: {
    annual: number;
    twentyYear: number;
  };
}

export interface RatingBand {
  letter: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export interface EnergyPrices {
  region: string;
  electricityRate_p: number;
  gasRate_p: number;
  currentAnnualCost: number;
  potentialAnnualCost: number;
  liveSavings: number;
}

export interface SolarResult {
  annualGeneration_kWh: number;
  monthlyGeneration_kWh: number[];
  peakPower_kWp: number;
  annualSavings_GBP: number;
  co2Saved_kg: number;
  paybackYears?: number;
}

export interface Grant {
  scheme: string;
  amount: string;
  description: string;
}

export interface Recommendation {
  type: 'wall_insulation' | 'roof_insulation' | 'floor_insulation' | 'window_upgrade' | 'ventilation_upgrade';
  description: string;
  cost_estimate: number;
  savings_kwh_year: number;
  payback_years: number;
}

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  locale: string;
}

export interface CountryAdapter {
  // Identity
  countryCode: string;        // ISO 3166-1 alpha-2 (GB, FR, NL, US, etc.)
  countryName: string;        // "United Kingdom", "France", etc.
  currency: string;           // GBP, EUR, USD
  locale: string;             // en-GB, fr-FR, etc.

  // Data
  searchByPostcode(postcode: string): Promise<AddressResult[]>;
  getCertificate(id: string): Promise<EnergyData | null>;

  // Energy Calculations
  calculateEnergyScore(data: EnergyData): EnergyScore;
  getRatingScale(): RatingBand[];

  // Pricing
  getEnergyPrices(region?: string): Promise<EnergyPrices>;

  // Solar
  getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult>;

  // Grants & Incentives
  getAvailableGrants(data: EnergyData): Promise<Grant[]>;

  // Improvements
  getRecommendations(data: EnergyData): Recommendation[];

  // Contractors (affiliate links)
  getContractorSearchUrl(postcode: string, improvementType: string): string;

  // Validation
  validatePostcode(postcode: string): boolean;
  formatPostcode(postcode: string): string;
}