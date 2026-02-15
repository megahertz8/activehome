import { getAgileOutgoingTariffs, getCosyOctopusRates, getStandardVariableRates, TariffRate } from './octopus-api';

export type SystemType = 'solar' | 'hp' | 'led' | 'insulation' | 'draught_proofing' | 'cylinder_insulation' | 'smart_thermostat' | 'double_glazing';

export interface PaybackData {
  systemType: SystemType;
  paybackYears: number;
  annualSavings: number;
  initialCost: number;
  grantAmount?: number;
  grantName?: string;
  netCost?: number;
  currentTariff?: string;
  optimalTariff?: string;
  annualSavingsFromSwitch?: number;
  switchRecommendation?: string;
  description?: string;
  emoji?: string;
}

// Average UK electricity consumption (kWh/year)
const AVG_ANNUAL_CONSUMPTION = 2900;

// Average solar generation (kWh/year) - depends on location, but we'll use a UK average
const AVG_SOLAR_GENERATION = 2500;

// Heat pump efficiency and usage
// SCOP range: 2.5 (poorly installed) to 4.5+ (well-designed low-temp system)
// Default 3.5 = realistic UK average (Urban Plumbers case study achieved 4.7 SCOP)
const DEFAULT_HEAT_PUMP_SCOP = 3.5;
const AVG_HEATING_DEMAND = 12000; // kWh thermal per year

// BUS Grant (Boiler Upgrade Scheme) — £7,500 off heat pump installation
const BUS_GRANT_AMOUNT = 7500;

// LED lighting: typical UK home has 30-40 light points
// Old halogen/incandescent: ~2,100 kWh/yr, LED equivalent: ~420 kWh/yr
// Source: Energy Saving Trust, validated against video digest research
const LED_OLD_CONSUMPTION = 2100; // kWh/yr (30 bulbs × 60W avg × 3.3hrs/day × 365)
const LED_NEW_CONSUMPTION = 420;  // kWh/yr (30 bulbs × 10W avg × 3.3hrs/day × 365)
const LED_SAVINGS_KWH = LED_OLD_CONSUMPTION - LED_NEW_CONSUMPTION; // 1,680 kWh/yr

function calculateAverageRate(rates: TariffRate[]): number {
  if (!rates || rates.length === 0) return 0;

  // For Agile/Variable rates, calculate weighted average
  const now = new Date();
  const currentRates = rates.filter(rate =>
    new Date(rate.valid_from) <= now && new Date(rate.valid_to) >= now
  );

  if (currentRates.length === 0) {
    // Use most recent rates
    const sorted = rates.sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime());
    return sorted[0]?.value_inc_vat || 0;
  }

  // Simple average for now - in production, you'd weight by time
  const sum = currentRates.reduce((acc, rate) => acc + rate.value_inc_vat, 0);
  return sum / currentRates.length;
}

export async function calculatePayback(postcode: string, systemType: SystemType): Promise<PaybackData> {
  try {
    switch (systemType) {
      case 'solar':
        return await calculateSolarPayback(postcode);
      case 'hp':
        return await calculateHeatPumpPayback(postcode);
      case 'led':
        return await calculateLEDPayback(postcode);
      case 'insulation':
        return await calculateInsulationPayback(postcode);
      case 'draught_proofing':
        return await calculateDraughtProofingPayback(postcode);
      case 'cylinder_insulation':
        return await calculateCylinderInsulationPayback(postcode);
      case 'smart_thermostat':
        return await calculateSmartThermostatPayback(postcode);
      case 'double_glazing':
        return await calculateDoubleGlazingPayback(postcode);
      default:
        return getFallbackPayback(systemType);
    }
  } catch (error) {
    console.error('Error calculating payback:', error);
    // Fallback to mock data if API fails
    return getFallbackPayback(systemType);
  }
}

async function calculateSolarPayback(postcode: string): Promise<PaybackData> {
  // Get Agile Outgoing export tariffs
  const exportRates = await getAgileOutgoingTariffs(postcode);
  const avgExportRate = calculateAverageRate(exportRates);

  // Get current standard variable rates for comparison
  const { unitRates: currentUnitRates } = await getStandardVariableRates(postcode);
  const avgCurrentRate = calculateAverageRate(currentUnitRates);

  // Calculate annual revenue from exports
  const annualExportRevenue = AVG_SOLAR_GENERATION * avgExportRate;

  // Assume some self-consumption savings (export what's not used)
  const selfConsumptionSavings = (AVG_SOLAR_GENERATION * 0.7) * avgCurrentRate; // 70% self-consumed

  const totalAnnualSavings = annualExportRevenue + selfConsumptionSavings;

  // Typical solar installation cost in UK
  const initialCost = 8000; // £8,000 average

  const paybackYears = initialCost / totalAnnualSavings;

  return {
    systemType: 'solar',
    paybackYears: Math.round(paybackYears * 10) / 10,
    annualSavings: Math.round(totalAnnualSavings),
    initialCost,
    currentTariff: 'Standard Variable',
    optimalTariff: 'Agile Outgoing',
    annualSavingsFromSwitch: Math.round(AVG_ANNUAL_CONSUMPTION * (avgCurrentRate - avgExportRate)),
    switchRecommendation: avgExportRate < avgCurrentRate ? 'Switch to Agile Outgoing for better export rates' : 'Current tariff is optimal for solar',
    description: 'Generate clean electricity from sunlight',
    emoji: '☀️'
  };
}

async function calculateHeatPumpPayback(postcode: string, scop: number = DEFAULT_HEAT_PUMP_SCOP): Promise<PaybackData> {
  // Electricity needed = thermal demand / SCOP
  // SCOP 2.5 = 4,800 kWh elec, SCOP 4.5 = 2,667 kWh — 80% cost difference!
  const electricityForHeating = AVG_HEATING_DEMAND / scop;

  // Get Cosy Octopus rates (optimised for heat pumps)
  const { unitRates: cosyUnitRates, standingCharges: cosyStanding } = await getCosyOctopusRates(postcode);

  // Get Standard Variable rates (what they're currently paying for gas heating)
  const { unitRates: stdUnitRates, standingCharges: stdStanding } = await getStandardVariableRates(postcode);

  const avgCosyRate = calculateAverageRate(cosyUnitRates);
  const avgStdRate = calculateAverageRate(stdUnitRates);
  const avgCosyStanding = calculateAverageRate(cosyStanding);
  const avgStdStanding = calculateAverageRate(stdStanding);

  // Annual cost on heat pump with Cosy Octopus vs current gas heating
  const annualConsumptionSavings = electricityForHeating * (avgStdRate - avgCosyRate);
  const annualStandingSavings = 365 * (avgStdStanding - avgCosyStanding);
  const totalAnnualSavings = annualConsumptionSavings + annualStandingSavings;

  // Typical heat pump installation cost in UK
  const initialCost = 12000; // £12,000 average (ASHP)

  // BUS Grant: £7,500 off for eligible homes (replacing fossil fuel boiler)
  const netCost = initialCost - BUS_GRANT_AMOUNT;

  // Payback based on NET cost after grant
  const paybackYears = netCost / totalAnnualSavings;

  return {
    systemType: 'hp',
    paybackYears: Math.round(paybackYears * 10) / 10,
    annualSavings: Math.round(totalAnnualSavings),
    initialCost,
    grantAmount: BUS_GRANT_AMOUNT,
    grantName: 'Boiler Upgrade Scheme (BUS)',
    netCost,
    currentTariff: 'Standard Variable',
    optimalTariff: 'Cosy Octopus',
    annualSavingsFromSwitch: Math.round(totalAnnualSavings),
    switchRecommendation: `With SCOP ${scop}, Cosy Octopus saves the most. BUS grant reduces cost to £${netCost.toLocaleString()}.`,
    description: `Air source heat pump (SCOP ${scop})`,
    emoji: '🔥'
  };
}

async function calculateLEDPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Real savings: 1,680 kWh/yr (not 500!) — typical home with 30 light points
  // Old halogen/incandescent → LED = ~80% reduction in lighting energy
  const annualSavings = LED_SAVINGS_KWH * avgRate;
  const initialCost = 200; // £200 for 30 LED bulbs
  
  return {
    systemType: 'led',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Replace all bulbs with LED — saves ~1,680 kWh/yr',
    emoji: '💡'
  };
}

async function calculateInsulationPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Assume 20% heating demand reduction
  const heatingReduction = AVG_HEATING_DEMAND * 0.20;
  const annualSavings = heatingReduction * avgRate;
  const initialCost = 1500; // £1,500 for loft/cavity wall insulation
  
  return {
    systemType: 'insulation',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Loft and cavity wall insulation',
    emoji: '🧱'
  };
}

async function calculateDraughtProofingPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Assume 5% heating demand reduction
  const heatingReduction = AVG_HEATING_DEMAND * 0.05;
  const annualSavings = heatingReduction * avgRate;
  const initialCost = 300; // £300 for draught-proofing
  
  return {
    systemType: 'draught_proofing',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Seal gaps around doors and windows',
    emoji: '🌬️'
  };
}

async function calculateCylinderInsulationPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Fixed savings estimate
  const annualSavings = 115; // £80-150/year average
  const initialCost = 100; // £100 for cylinder jacket
  
  return {
    systemType: 'cylinder_insulation',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Hot water cylinder insulation jacket',
    emoji: '🚿'
  };
}

async function calculateSmartThermostatPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Assume 10% heating demand reduction
  const heatingReduction = AVG_HEATING_DEMAND * 0.10;
  const annualSavings = heatingReduction * avgRate;
  const initialCost = 200; // £200 for smart thermostat
  
  return {
    systemType: 'smart_thermostat',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Smart heating control and scheduling',
    emoji: '🌡️'
  };
}

async function calculateDoubleGlazingPayback(postcode: string): Promise<PaybackData> {
  const { unitRates } = await getStandardVariableRates(postcode);
  const avgRate = calculateAverageRate(unitRates);
  
  // Assume 12.5% heating demand reduction (10-15% average)
  const heatingReduction = AVG_HEATING_DEMAND * 0.125;
  const annualSavings = heatingReduction * avgRate;
  const initialCost = 5000; // £5,000 for double glazing upgrade
  
  return {
    systemType: 'double_glazing',
    paybackYears: Math.round((initialCost / annualSavings) * 10) / 10,
    annualSavings: Math.round(annualSavings),
    initialCost,
    description: 'Replace single glazing with double glazing',
    emoji: '🪟'
  };
}

export async function getAllECMs(postcode: string): Promise<PaybackData[]> {
  try {
    const ecms = await Promise.all([
      calculateSolarPayback(postcode),
      calculateHeatPumpPayback(postcode),
      calculateLEDPayback(postcode),
      calculateInsulationPayback(postcode),
      calculateDraughtProofingPayback(postcode),
      calculateCylinderInsulationPayback(postcode),
      calculateSmartThermostatPayback(postcode),
      calculateDoubleGlazingPayback(postcode),
    ]);
    
    // Sort by payback period (shortest first)
    return ecms.sort((a, b) => a.paybackYears - b.paybackYears);
  } catch (error) {
    console.error('Error calculating ECMs:', error);
    // Return fallback data for all ECMs
    return [
      { systemType: 'led', paybackYears: 0.4, annualSavings: 494, initialCost: 200, description: 'LED lighting retrofit — saves ~1,680 kWh/yr', emoji: '💡' },
      { systemType: 'cylinder_insulation', paybackYears: 0.9, annualSavings: 115, initialCost: 100, description: 'Hot water cylinder jacket', emoji: '🚿' },
      { systemType: 'draught_proofing', paybackYears: 2.5, annualSavings: 120, initialCost: 300, description: 'Draught-proofing', emoji: '🌬️' },
      { systemType: 'smart_thermostat', paybackYears: 1.7, annualSavings: 120, initialCost: 200, description: 'Smart thermostat', emoji: '🌡️' },
      { systemType: 'insulation', paybackYears: 6.3, annualSavings: 240, initialCost: 1500, description: 'Loft/cavity insulation', emoji: '🧱' },
      { systemType: 'hp', paybackYears: 3.0, annualSavings: 1500, initialCost: 12000, grantAmount: 7500, grantName: 'BUS', netCost: 4500, description: 'Heat pump (SCOP 3.5, after BUS grant)', emoji: '🔥' },
      { systemType: 'solar', paybackYears: 8, annualSavings: 1000, initialCost: 8000, description: 'Solar panels', emoji: '☀️' },
      { systemType: 'double_glazing', paybackYears: 33.3, annualSavings: 150, initialCost: 5000, description: 'Double glazing', emoji: '🪟' },
    ];
  }
}

function getFallbackPayback(systemType: SystemType): PaybackData {
  // Fallback mock data if API fails
  const paybackYears = systemType === 'solar' ? 8 : 6;
  const annualSavings = systemType === 'solar' ? 1000 : 2000;
  const initialCost = paybackYears * annualSavings;

  return {
    systemType,
    paybackYears,
    annualSavings,
    initialCost,
  };
}