/**
 * U-Value Lookup Tables for UK Construction Types
 *
 * Provides typical U-values for different building elements based on construction type.
 * Values based on SAP 2012 methodology and typical UK construction practices.
 */

export interface UValueTables {
  walls: { [key: string]: number };
  roofs: { [key: string]: number };
  floors: { [key: string]: number };
  windows: { [key: string]: number };
  doors: { [key: string]: number };
}

/**
 * Typical U-values for UK construction (W/m²K)
 * Based on SAP 2012 Appendix K and typical construction details
 */
export const UK_U_VALUES: UValueTables = {
  walls: {
    // Solid walls (uninsulated)
    'solid_brick_225mm': 2.1,
    'solid_brick_325mm': 1.7,
    'solid_stone': 1.7,
    'solid_concrete': 2.0,

    // Cavity walls
    'cavity_unfilled_50mm': 1.6,
    'cavity_unfilled_75mm': 1.5,
    'cavity_filled_50mm': 0.55,
    'cavity_filled_75mm': 0.45,
    'cavity_filled_100mm': 0.35,

    // Insulated walls
    'external_insulation_50mm': 0.3,
    'external_insulation_100mm': 0.2,
    'internal_insulation_50mm': 0.4,
    'timber_frame': 0.6,

    // System build
    'system_build_no_insulation': 1.0,
    'system_build_insulated': 0.5,

    // Age-based defaults (simplified)
    'pre_1919': 2.1,          // Solid brick, uninsulated
    '1919_1944': 1.6,         // Early cavity, unfilled
    '1945_1964': 1.5,         // Cavity unfilled
    '1965_1975': 1.0,         // Some insulation
    '1976_1982': 0.6,         // Building regs improved
    '1983_1995': 0.5,         // Cavity insulation common
    '1996_2002': 0.45,        // Better standards
    '2003_2006': 0.35,        // Part L 2002
    '2007_2011': 0.28,        // Part L 2006
    '2012_onwards': 0.18      // Part L 2010/2013
  },

  roofs: {
    // Pitched roofs
    'uninsulated': 2.3,       // No insulation
    '25mm_quilt': 1.5,
    '50mm_quilt': 0.8,
    '75mm_quilt': 0.6,
    '100mm_mineral_wool': 0.4,
    '150mm_mineral_wool': 0.25,
    '200mm_mineral_wool': 0.2,
    '250mm_mineral_wool': 0.16,
    '300mm_mineral_wool': 0.13,

    // Flat roofs
    'flat_uninsulated': 2.0,
    'flat_insulated_50mm': 0.9,
    'flat_insulated_100mm': 0.5,
    'flat_insulated_150mm': 0.35,

    // Thatched roofs
    'thatched': 0.35,

    // Age-based defaults
    'pre_1919': 2.3,          // No insulation
    '1919_1975': 1.5,         // Minimal insulation
    '1976_1995': 0.6,         // 50-75mm typical
    '1996_2002': 0.4,         // 100mm typical
    '2003_onwards': 0.25      // 150mm+ typical
  },

  floors: {
    // Suspended timber
    'suspended_timber_uninsulated': 0.7,  // Typical with void below
    'suspended_timber_100mm_wool': 0.25,
    'suspended_timber_150mm_wool': 0.22,
    'suspended_timber_200mm_wool': 0.18,

    // Solid floors (ground contact - lower U-value due to ground temp)
    'solid_concrete_uninsulated': 0.7,     // Ground contact benefit
    'solid_concrete_50mm_insulation': 0.45,
    'solid_concrete_100mm_insulation': 0.25,
    'solid_concrete_150mm_insulation': 0.18,

    // Ground floors (exposed perimeter consideration)
    'ground_floor_uninsulated': 0.7,       // Typical solid floor
    'ground_floor_50mm_insulation': 0.45,
    'ground_floor_100mm_insulation': 0.25,
    'ground_floor_150mm_insulation': 0.18,

    // Age-based defaults
    'pre_1919': 0.7,          // Suspended timber or solid, uninsulated
    '1919_1964': 0.7,         // Similar
    '1965_1975': 0.7,         // Still mostly uninsulated
    '1976_1982': 0.6,         // Some improvement
    '1983_1995': 0.45,        // Building regs
    '1996_onwards': 0.25      // Better insulation
  },

  windows: {
    // Single glazing
    'single_glazed': 4.8,
    'single_glazed_thick': 4.7,

    // Double glazing
    'double_glazed_old': 3.1,     // Pre-2002, air gap
    'double_glazed_air': 2.8,      // Standard air gap
    'double_glazed_argon': 2.0,    // Argon filled
    'double_glazed_low_e': 1.6,    // Low-E coating

    // Triple glazing
    'triple_glazed': 1.8,
    'triple_glazed_low_e': 1.2,

    // Secondary glazing
    'secondary_glazing': 2.4,

    // Age-based defaults
    'pre_2002': 4.8,              // Single glazing
    '2002_2010': 2.0,             // Part L 2002 (U≤2.0)
    '2011_onwards': 1.6           // Part L 2010 (U≤1.6)
  },

  doors: {
    'solid_wood': 2.0,
    'insulated_door': 1.5,
    'double_glazed_door': 1.0
  }
};

/**
 * Get U-value for wall type
 * @param description EPC wall description
 * @returns U-value in W/m²K
 */
export function getWallUValue(description: string): number {
  const desc = description.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  // Check for specific patterns
  if (desc.includes('cavity') && desc.includes('filled')) {
    if (desc.includes('100mm') || desc.includes('4 inch')) return 0.35;
    if (desc.includes('75mm') || desc.includes('3 inch')) return 0.4;
    return 0.5;
  }

  if (desc.includes('cavity') && desc.includes('unfilled')) {
    if (desc.includes('100mm') || desc.includes('4 inch')) return 0.6;
    return 0.8;
  }

  if (desc.includes('solid brick') || desc.includes('solid stone')) {
    return desc.includes('325mm') ? 0.8 : 1.0;
  }

  if (desc.includes('timber frame')) return 0.6;
  if (desc.includes('external insulation') || desc.includes('insulated externally')) return 0.3;
  if (desc.includes('internal insulation')) return 0.4;

  // Age-based fallback
  if (desc.includes('pre 1919')) return 1.2;
  if (desc.includes('1919') || desc.includes('1920') || desc.includes('1930') || desc.includes('1940')) return 1.0;
  if (desc.includes('1950') || desc.includes('1960')) return 0.8;
  if (desc.includes('1970')) return 0.6;
  if (desc.includes('1980')) return 0.4;
  if (desc.includes('1990')) return 0.35;
  if (desc.includes('2000') || desc.includes('2010')) return 0.25;

  // Default to cavity filled
  return 0.5;
}

/**
 * Get U-value for roof type
 * @param description EPC roof description
 * @returns U-value in W/m²K
 */
export function getRoofUValue(description: string): number {
  const desc = description.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (desc.includes('300mm') || desc.includes('12 inch')) return 0.15;
  if (desc.includes('250mm') || desc.includes('10 inch')) return 0.18;
  if (desc.includes('200mm') || desc.includes('8 inch')) return 0.2;
  if (desc.includes('150mm') || desc.includes('6 inch')) return 0.25;
  if (desc.includes('100mm') || desc.includes('4 inch')) return 0.3;
  if (desc.includes('50mm') || desc.includes('2 inch')) return 0.6;
  if (desc.includes('uninsulated') || desc.includes('no insulation')) return 1.0;

  // Age-based fallback
  if (desc.includes('pre 1919')) return 1.0;
  if (desc.includes('1919') || desc.includes('1975')) return 0.6;
  if (desc.includes('1976') || desc.includes('1995')) return 0.4;
  if (desc.includes('1996') || desc.includes('2002')) return 0.3;

  return 0.3; // Default insulated
}

/**
 * Get U-value for floor type
 * @param description EPC floor description
 * @returns U-value in W/m²K
 */
export function getFloorUValue(description: string): number {
  const desc = description.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (desc.includes('suspended timber')) {
    if (desc.includes('200mm')) return 0.3;
    if (desc.includes('150mm')) return 0.4;
    if (desc.includes('100mm')) return 0.5;
    return 0.8;
  }

  if (desc.includes('solid concrete') || desc.includes('ground floor')) {
    if (desc.includes('150mm') || desc.includes('6 inch')) return 0.3;
    if (desc.includes('100mm') || desc.includes('4 inch')) return 0.5;
    if (desc.includes('50mm') || desc.includes('2 inch')) return 0.8;
    return 1.2;
  }

  // Age-based fallback
  if (desc.includes('pre 1919')) return 1.0;
  if (desc.includes('1919') || desc.includes('1964')) return 0.8;
  if (desc.includes('1965') || desc.includes('1975')) return 0.6;

  return 0.5; // Default insulated
}

/**
 * Get U-value for window type
 * @param description EPC window description
 * @returns U-value in W/m²K
 */
export function getWindowUValue(description: string): number {
  const desc = description.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (desc.includes('triple')) return 1.5;
  if (desc.includes('double')) {
    if (desc.includes('low e') || desc.includes('low-e')) return 2.0;
    if (desc.includes('argon')) return 2.5;
    return 2.8;
  }
  if (desc.includes('single')) return 4.8;
  if (desc.includes('secondary')) return 2.5;

  // Age-based fallback
  if (desc.includes('pre 2002')) return 4.8;
  if (desc.includes('2002') || desc.includes('2010')) return 2.0;

  return 2.0; // Default double glazing
}

/**
 * Get thermal mass value (k-value) for element type
 * @param elementType Element type
 * @param construction Construction description
 * @returns k-value in kJ/m²K
 */
export function getThermalMass(elementType: string, construction: string): number {
  const type = elementType.toLowerCase();
  const constr = construction.toLowerCase();

  if (type === 'wall') {
    if (constr.includes('brick') || constr.includes('stone') || constr.includes('concrete')) return 200;
    if (constr.includes('timber')) return 50;
    return 100;
  }

  if (type === 'floor') {
    if (constr.includes('concrete') || constr.includes('solid')) return 300;
    if (constr.includes('timber')) return 50;
    return 100;
  }

  if (type === 'roof') {
    if (constr.includes('concrete')) return 200;
    return 50; // Light construction
  }

  return 100; // Default
}

/**
 * Calculate effective U-value for element with thermal bridges
 * @param baseU Base U-value
 * @param bridgeLinearThermalTransmittance Linear thermal transmittance (Ψ) in W/mK
 * @param elementLength Element length in m
 * @param elementArea Element area in m²
 * @returns Effective U-value
 */
export function calculateEffectiveUValue(
  baseU: number,
  bridgeLinearThermalTransmittance: number,
  elementLength: number,
  elementArea: number
): number {
  // SAP formula: U_eff = U_base + (Ψ × L) / A
  return baseU + (bridgeLinearThermalTransmittance * elementLength) / elementArea;
}