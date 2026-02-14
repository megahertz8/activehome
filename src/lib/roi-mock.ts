// Mock data for BOM/CSIRO based ROI calculations

export type SystemType = 'solar' | 'hp';

export interface PaybackData {
  systemType: SystemType;
  paybackYears: number;
  annualSavings: number;
  initialCost: number;
}

// Mock BOM/CSIRO data based on postcode
// Northern AU: better solar, Southern: better HP
const mockData: Record<string, { solar: number; hp: number }> = {
  '2000': { solar: 6, hp: 8 }, // Sydney
  '3000': { solar: 7, hp: 7 }, // Melbourne
  '4000': { solar: 5, hp: 9 }, // Brisbane
  '5000': { solar: 8, hp: 6 }, // Adelaide
  '6000': { solar: 4, hp: 10 }, // Perth
  default: { solar: 7, hp: 7 },
};

export function calculatePayback(postcode: string, systemType: SystemType): PaybackData {
  const data = mockData[postcode] || mockData.default;
  const paybackYears = data[systemType];
  const annualSavings = systemType === 'solar' ? 2000 : 1500; // Mock savings
  const initialCost = paybackYears * annualSavings;

  return {
    systemType,
    paybackYears,
    annualSavings,
    initialCost,
  };
}