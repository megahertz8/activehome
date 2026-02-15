/**
 * Enhanced Energy Calculation API
 *
 * Integrates OpenBEM SAP calculations with EPC data for detailed energy analysis.
 */

import { calculateEnergyDemand, calculateUpgradeSavings, BuildingData, EnergyResults } from './openbem';
import { epcToOpenBEM, EPCRecord } from './epc-to-openbem';

// U-value lookup tables
export const U_VALUES = {
  walls: {
    'solid_brick': 1.0,
    'cavity_unfilled': 0.8,
    'cavity_filled': 0.5,
    'external_insulation': 0.3,
    'timber_frame': 0.6
  },
  roofs: {
    'uninsulated': 1.0,
    '100mm': 0.3,
    '200mm': 0.2,
    '300mm': 0.15
  },
  floors: {
    'suspended_timber': 0.5,
    'solid_concrete': 0.8,
    'insulated': 0.25
  },
  windows: {
    'single': 4.8,
    'double_old': 2.8,
    'double_new': 2.0,
    'triple': 1.5
  }
};

// EUI Benchmarks (kWh/m²/year) by property type
const EUI_BENCHMARKS: Record<string, number> = {
  'detached': 250,
  'semi-detached': 200,
  'terraced': 180,
  'mid-terrace': 175,
  'end-terrace': 190,
  'flat': 150,
  'bungalow': 220,
  'maisonette': 160,
};

export interface EnhancedEnergyResults extends EnergyResults {
  epc_record: EPCRecord;
  heat_loss_breakdown: {
    fabric: number;
    ventilation: number;
    total: number;
  };
  upgrade_recommendations: UpgradeRecommendation[];
  savings_potential: {
    space_heating_kwh: number;
    water_heating_kwh: number;
    total_cost_savings: number;
  };
  eui_kwh_m2: number;
  benchmark_median: number;
  vs_median_percent: number;
  property_type_benchmark: string;
}

export interface UpgradeRecommendation {
  type: 'wall_insulation' | 'roof_insulation' | 'floor_insulation' | 'window_upgrade' | 'ventilation_upgrade';
  description: string;
  cost_estimate: number;
  savings_kwh_year: number;
  payback_years: number;
}

/**
 * Calculate enhanced energy analysis for an EPC record
 * @param epc EPC record
 * @returns Detailed energy analysis
 */
export async function calculateEnhancedEnergy(epc: EPCRecord): Promise<EnhancedEnergyResults> {
  // Convert EPC to OpenBEM format
  const buildingData = epcToOpenBEM(epc);

  // Run SAP calculation
  const results = calculateEnergyDemand(buildingData);

  // Calculate heat loss breakdown
  const heatLossBreakdown = {
    fabric: results.fabric.total_heat_loss_WK,
    ventilation: results.ventilation.average_WK,
    total: results.fabric.total_heat_loss_WK + results.ventilation.average_WK
  };

  // Generate upgrade recommendations
  const upgrades = generateUpgradeRecommendations(epc, buildingData);

  // Calculate savings potential
  let totalSavings = 0;
  for (const upgrade of upgrades) {
    totalSavings += upgrade.savings_kwh_year;
  }

  // Estimate cost savings (assuming gas heating at £0.08/kWh)
  const costSavings = totalSavings * 0.08;

  // Calculate EUI (Energy Use Intensity)
  const totalEnergyDemand = Object.values(results.energy_requirements).reduce(
    (sum, req) => sum + (req?.quantity || 0), 
    0
  );
  
  // Get total floor area from first floor entry (or use EPC value)
  const totalFloorArea = buildingData.TFA || 
    Object.values(buildingData.floors)[0]?.area || 
    parseFloat(epc.total_floor_area || '100');
  
  const eui = totalEnergyDemand / totalFloorArea;
  
  // Get benchmark for property type
  const propertyType = (epc.property_type || 'detached').toLowerCase();
  const benchmark = EUI_BENCHMARKS[propertyType] || 
    EUI_BENCHMARKS['semi-detached'] || 200;
  
  const vsMedianPercent = ((eui - benchmark) / benchmark) * 100;

  const enhanced: EnhancedEnergyResults = {
    ...results,
    epc_record: epc,
    heat_loss_breakdown: heatLossBreakdown,
    upgrade_recommendations: upgrades,
    savings_potential: {
      space_heating_kwh: totalSavings,
      water_heating_kwh: 0, // Could be extended
      total_cost_savings: costSavings
    },
    eui_kwh_m2: Math.round(eui),
    benchmark_median: benchmark,
    vs_median_percent: Math.round(vsMedianPercent),
    property_type_benchmark: propertyType
  };

  return enhanced;
}

/**
 * Generate upgrade recommendations based on current fabric
 * @param epc EPC record
 * @param current Current building data
 * @returns Array of upgrade recommendations
 */
function generateUpgradeRecommendations(epc: EPCRecord, current: BuildingData): UpgradeRecommendation[] {
  const recommendations: UpgradeRecommendation[] = [];

  // Wall insulation recommendation
  const currentWallU = getCurrentUValue(epc.walls_description || '', U_VALUES.walls);
  if (currentWallU > 0.5) {
    const improvedWallU = 0.3; // External insulation
    const savings = estimateSavingsFromUValueChange(current, 'wall', currentWallU, improvedWallU);
    recommendations.push({
      type: 'wall_insulation',
      description: 'Add external wall insulation',
      cost_estimate: estimateWallInsulationCost(current.fabric.elements['walls']?.area || 0),
      savings_kwh_year: savings,
      payback_years: estimateWallInsulationCost(current.fabric.elements['walls']?.area || 0) / (savings * 0.08)
    });
  }

  // Roof insulation recommendation
  const currentRoofU = getCurrentUValue(epc.roof_description || '', U_VALUES.roofs);
  if (currentRoofU > 0.2) {
    const improvedRoofU = 0.15; // 300mm insulation
    const savings = estimateSavingsFromUValueChange(current, 'roof', currentRoofU, improvedRoofU);
    recommendations.push({
      type: 'roof_insulation',
      description: 'Upgrade roof insulation to 300mm',
      cost_estimate: estimateRoofInsulationCost(current.fabric.elements['roof']?.area || 0),
      savings_kwh_year: savings,
      payback_years: estimateRoofInsulationCost(current.fabric.elements['roof']?.area || 0) / (savings * 0.08)
    });
  }

  // Window upgrade recommendation
  const currentWindowU = getCurrentUValue(epc.windows_description || '', U_VALUES.windows);
  if (currentWindowU > 2.0) {
    const improvedWindowU = 1.5; // Triple glazing
    const savings = estimateSavingsFromUValueChange(current, 'window', currentWindowU, improvedWindowU);
    recommendations.push({
      type: 'window_upgrade',
      description: 'Replace windows with triple glazing',
      cost_estimate: estimateWindowUpgradeCost(current.fabric.elements['windows']?.area || 0),
      savings_kwh_year: savings,
      payback_years: estimateWindowUpgradeCost(current.fabric.elements['windows']?.area || 0) / (savings * 0.08)
    });
  }

  // Ventilation upgrade recommendation
  if (current.ventilation.ventilation_type === 'd' && !current.ventilation.air_permeability_test) {
    recommendations.push({
      type: 'ventilation_upgrade',
      description: 'Install MVHR system for better air quality and efficiency',
      cost_estimate: 8000, // Typical cost
      savings_kwh_year: 500, // Estimated annual savings
      payback_years: 16
    });
  }

  // Sort by payback period
  return recommendations.sort((a, b) => a.payback_years - b.payback_years);
}

/**
 * Get current U-value from description
 * @param description Element description
 * @param uValueMap U-value mapping
 * @returns Current U-value
 */
function getCurrentUValue(description: string, uValueMap: { [key: string]: number }): number {
  const desc = description.toLowerCase();
  for (const [key, value] of Object.entries(uValueMap)) {
    if (desc.includes(key.replace('_', ' '))) {
      return value;
    }
  }
  return Math.max(...Object.values(uValueMap)); // Return worst case
}

/**
 * Estimate savings from U-value change
 * @param current Current building data
 * @param elementType Element type
 * @param currentU Current U-value
 * @param improvedU Improved U-value
 * @returns Annual kWh savings
 */
function estimateSavingsFromUValueChange(
  current: BuildingData,
  elementType: string,
  currentU: number,
  improvedU: number
): number {
  // Simple estimation: savings proportional to U-value reduction
  const reduction = currentU - improvedU;
  const element = Object.values(current.fabric.elements).find(e => e.type === elementType);
  if (!element) return 0;

  // Average heat loss per degree day (rough estimate)
  const degreeDays = 2500; // UK average
  const savings = element.area * reduction * degreeDays * 0.024;

  return Math.max(0, savings);
}

/**
 * Estimate wall insulation cost
 * @param area Wall area in m²
 * @returns Cost estimate
 */
function estimateWallInsulationCost(area: number): number {
  return area * 150; // £150/m² for external insulation
}

/**
 * Estimate roof insulation cost
 * @param area Roof area in m²
 * @returns Cost estimate
 */
function estimateRoofInsulationCost(area: number): number {
  return area * 50; // £50/m² for roof insulation
}

/**
 * Estimate window upgrade cost
 * @param area Window area in m²
 * @returns Cost estimate
 */
function estimateWindowUpgradeCost(area: number): number {
  return area * 800; // £800/m² for triple glazing
}

/**
 * Compare current vs potential ratings
 * @param current Current energy results
 * @param potential Potential energy results
 * @returns Comparison data
 */
export function compareEnergyRatings(current: EnergyResults, potential: EnergyResults) {
  const spaceHeatingSavings = current.space_heating.annual_heating_demand - potential.space_heating.annual_heating_demand;
  const waterHeatingSavings = current.energy_requirements.waterheating?.quantity || 0 - (potential.energy_requirements.waterheating?.quantity || 0);

  return {
    space_heating_savings_kwh: Math.max(0, spaceHeatingSavings),
    water_heating_savings_kwh: Math.max(0, waterHeatingSavings),
    total_savings_kwh: Math.max(0, spaceHeatingSavings + waterHeatingSavings),
    efficiency_improvement_percent: ((spaceHeatingSavings + waterHeatingSavings) / (current.space_heating.annual_heating_demand + (current.energy_requirements.waterheating?.quantity || 0))) * 100
  };
}