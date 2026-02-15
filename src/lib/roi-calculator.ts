import { getAgileOutgoingTariffs, getCosyOctopusRates, getStandardVariableRates, TariffRate } from './octopus-api';

export type SystemType = 'solar' | 'hp';

export interface PaybackData {
  systemType: SystemType;
  paybackYears: number;
  annualSavings: number;
  initialCost: number;
  currentTariff?: string;
  optimalTariff?: string;
  annualSavingsFromSwitch?: number;
  switchRecommendation?: string;
}

// Average UK electricity consumption (kWh/year)
const AVG_ANNUAL_CONSUMPTION = 2900;

// Average solar generation (kWh/year) - depends on location, but we'll use a UK average
const AVG_SOLAR_GENERATION = 2500;

// Heat pump efficiency and usage
const HEAT_PUMP_COP = 3.0; // Coefficient of Performance
const AVG_HEATING_DEMAND = 12000; // kWh thermal per year
const ELECTRICITY_FOR_HEATING = AVG_HEATING_DEMAND / HEAT_PUMP_COP;

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
    if (systemType === 'solar') {
      return await calculateSolarPayback(postcode);
    } else {
      return await calculateHeatPumpPayback(postcode);
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
    switchRecommendation: avgExportRate < avgCurrentRate ? 'Switch to Agile Outgoing for better export rates' : 'Current tariff is optimal for solar'
  };
}

async function calculateHeatPumpPayback(postcode: string): Promise<PaybackData> {
  // Get Cosy Octopus rates
  const { unitRates: cosyUnitRates, standingCharges: cosyStanding } = await getCosyOctopusRates(postcode);

  // Get Standard Variable rates
  const { unitRates: stdUnitRates, standingCharges: stdStanding } = await getStandardVariableRates(postcode);

  const avgCosyRate = calculateAverageRate(cosyUnitRates);
  const avgStdRate = calculateAverageRate(stdUnitRates);
  const avgCosyStanding = calculateAverageRate(cosyStanding);
  const avgStdStanding = calculateAverageRate(stdStanding);

  // Calculate annual savings from switching to Cosy Octopus
  const annualConsumptionSavings = ELECTRICITY_FOR_HEATING * (avgStdRate - avgCosyRate);
  const annualStandingSavings = 365 * (avgStdStanding - avgCosyStanding);
  const totalAnnualSavings = annualConsumptionSavings + annualStandingSavings;

  // Typical heat pump installation cost in UK
  const initialCost = 12000; // £12,000 average

  const paybackYears = initialCost / totalAnnualSavings;

  return {
    systemType: 'hp',
    paybackYears: Math.round(paybackYears * 10) / 10,
    annualSavings: Math.round(totalAnnualSavings),
    initialCost,
    currentTariff: 'Standard Variable',
    optimalTariff: 'Cosy Octopus',
    annualSavingsFromSwitch: Math.round(totalAnnualSavings),
    switchRecommendation: totalAnnualSavings > 0 ? 'Switch to Cosy Octopus for heat pump savings' : 'Current tariff is optimal'
  };
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