/**
 * EPC to OpenBEM Data Mapper
 *
 * Converts EPC database records into OpenBEM building parameters.
 * Uses reasonable defaults where EPC data is incomplete.
 */

import { BuildingData } from './openbem';

// EPC record interface (simplified)
export interface EPCRecord {
  uprn?: string;
  address?: string;
  posttown?: string;
  postcode?: string;
  built_form?: string;
  property_type?: string;
  inspection_date?: string;
  local_authority?: string;
  constituency?: string;
  county?: string;
  lodgement_date?: string;
  transaction_type?: string;
  environment_impact_current?: number;
  environment_impact_potential?: number;
  energy_consumption_current?: number;
  energy_consumption_potential?: number;
  co2_emissions_current?: number;
  co2_emissions_potential?: number;
  co2_emiss_curr_per_floor_area?: number;
  lighting_cost_current?: number;
  lighting_cost_potential?: number;
  heating_cost_current?: number;
  heating_cost_potential?: number;
  hot_water_cost_current?: number;
  hot_water_cost_potential?: number;
  total_floor_area?: number;
  energy_tariff?: string;
  mains_gas_flag?: string;
  floor_level?: string;
  flat_top_storey?: string;
  flat_storey_count?: number;
  main_heating_controls?: string;
  multi_glaze_proportion?: number;
  glazed_type?: string;
  glazed_area?: string;
  extension_count?: number;
  number_habitable_rooms?: number;
  number_heated_rooms?: number;
  low_energy_lighting?: number;
  zero_carbon_home_eligible?: string;
  floor_description?: string;
  floor_energy_eff?: string;
  floor_env_eff?: string;
  walls_description?: string;
  walls_energy_eff?: string;
  walls_env_eff?: string;
  secondary_systems_heat_loss?: string;
  roof_description?: string;
  roof_energy_eff?: string;
  roof_env_eff?: string;
  mainheat_description?: string;
  mainheat_energy_eff?: string;
  mainheat_env_eff?: string;
  main_fuel?: string;
  mainheatcont_description?: string;
  mainheatcont_energy_eff?: string;
  mainheatcont_env_eff?: string;
  hotwater_description?: string;
  hotwater_energy_eff?: string;
  hotwater_env_eff?: string;
  lighting_description?: string;
  lighting_energy_eff?: string;
  lighting_env_eff?: string;
  air_tightness_description?: string;
  air_tightness_energy_eff?: string;
  air_tightness_env_eff?: string;
  ventilation_description?: string;
  ventilation_energy_eff?: string;
  ventilation_env_eff?: string;
  windows_description?: string;
  windows_energy_eff?: string;
  windows_env_eff?: string;
  current_energy_rating?: string;
  potential_energy_rating?: string;
  current_energy_efficiency?: number;
  potential_energy_efficiency?: number;
  renewables_description?: string;
  renewables_energy_eff?: string;
  renewables_env_eff?: string;
  co2_emiss_potential_per_floor_area?: number;
  total_cost_current?: number;
  total_cost_potential?: number;
  solar_hot_water_flag?: string;
  mechanical_ventilation?: string;
  constituency_label?: string;
  photo_supply?: number;
  construction_age_band?: string;
  lodgement_datetime?: string;
  tenure?: string;
  fixed_lighting_outlets_count?: number;
  low_energy_fixed_lighting_outlets_count?: number;
  ups?: string;
}

/**
 * Map EPC record to OpenBEM BuildingData
 * @param epc EPC record
 * @returns OpenBEM building parameters
 */
export function epcToOpenBEM(epc: EPCRecord): BuildingData {
  const region = getRegionFromPostcode(epc.postcode || '');
  const floorArea = epc.total_floor_area || 80; // Default 80m²
  const numRooms = epc.number_habitable_rooms || 4;
  const numFloors = Math.max(1, Math.ceil(numRooms / 3)); // Estimate floors

  // Estimate floor heights (2.5m typical)
  const floorHeight = 2.5;
  const volume = floorArea * floorHeight;

  const data: BuildingData = {
    region: region,
    altitude: 0, // Default sea level
    use_custom_occupancy: false,
    custom_occupancy: Math.max(1, Math.floor(numRooms / 2)), // Estimate occupancy
    floors: {},
    fabric: {
      elements: {}
    },
    ventilation: {
      number_of_chimneys: 0,
      number_of_openflues: 0,
      number_of_intermittentfans: 0,
      number_of_passivevents: 0,
      number_of_fluelessgasfires: 0,
      air_permeability_test: false,
      air_permeability_value: 0,
      dwelling_construction: 'masonry',
      suspended_wooden_floor: 'sealed',
      draught_lobby: true,
      percentage_draught_proofed: 50,
      number_of_sides_sheltered: 2,
      ventilation_type: 'd',
      system_air_change_rate: 0,
      balanced_heat_recovery_efficiency: 100
    },
    use_LAC: true,
    LAC: {
      LLE: 0.5, // Assume some low energy lighting
      L: 1,
      reduced_internal_heat_gains: false
    },
    use_water_heating: true,
    water_heating: {
      low_water_use_design: false,
      instantaneous_hotwater: false,
      solar_water_heating: epc.solar_hot_water_flag === 'Y',
      pipework_insulated_fraction: 0.5,
      declared_loss_factor_known: false,
      manufacturer_loss_factor: 0,
      storage_volume: 0,
      temperature_factor_a: 0,
      loss_factor_b: 0,
      volume_factor_b: 0,
      temperature_factor_b: 0,
      community_heating: false,
      hot_water_store_in_dwelling: true,
      contains_dedicated_solar_storage_or_WWHRS: false,
      hot_water_control_type: 'cylinder_thermostat_with_timer',
      combi_loss: [0,0,0,0,0,0,0,0,0,0,0,0]
    },
    use_SHW: epc.solar_hot_water_flag === 'Y',
    SHW: {
      A: 2, // 2m² collector area
      n0: 0.599,
      a1: 2.772,
      a2: 0.009,
      inclination: 35,
      orientation: 4, // South
      overshading: 1,
      Vs: 0,
      combined_cylinder_volume: 0
    },
    temperature: {
      responsiveness: 1,
      target: 21,
      control_type: 1,
      living_area: floorArea
    },
    space_heating: {
      use_utilfactor_forgains: true
    }
  };

  // Build floors
  for (let i = 0; i < numFloors; i++) {
    data.floors[`floor_${i}`] = {
      area: floorArea / numFloors,
      height: floorHeight
    };
  }

  // Build fabric elements
  const uValues = getUValuesFromEPC(epc);

  // Floor
  data.fabric.elements['floor'] = {
    type: 'floor',
    name: 'Ground floor',
    subtractfrom: '',
    area: floorArea,
    uvalue: uValues.floor,
    kvalue: 100 // Typical thermal mass
  };

  // Walls
  const wallArea = estimateWallArea(floorArea, numFloors, floorHeight);
  data.fabric.elements['walls'] = {
    type: 'wall',
    name: 'External walls',
    subtractfrom: '',
    area: wallArea,
    uvalue: uValues.wall,
    kvalue: 200
  };

  // Roof
  data.fabric.elements['roof'] = {
    type: 'roof',
    name: 'Roof',
    subtractfrom: '',
    area: floorArea,
    uvalue: uValues.roof,
    kvalue: 50
  };

  // Windows
  const windowArea = estimateWindowArea(floorArea);
  data.fabric.elements['windows'] = {
    type: 'window',
    name: 'Windows',
    subtractfrom: 'walls',
    area: windowArea,
    uvalue: uValues.window,
    orientation: 4, // South facing
    overshading: 1, // Average
    g: 0.7, // Solar gain factor
    ff: 0.7, // Frame factor
    kvalue: 0
  };

  // Update ventilation based on EPC
  if (epc.mechanical_ventilation) {
    if (epc.mechanical_ventilation.includes('MVHR')) {
      data.ventilation.ventilation_type = 'a';
      data.ventilation.system_air_change_rate = 1.0;
      data.ventilation.balanced_heat_recovery_efficiency = 80;
    }
  }

  return data;
}

/**
 * Get region from postcode (simplified)
 * @param postcode UK postcode
 * @returns Region index (0-21)
 */
function getRegionFromPostcode(postcode: string): number {
  // Simplified region mapping - in practice would use proper postcode to region lookup
  // For now, return Thames (region 0) as default
  return 0;
}

/**
 * Estimate U-values from EPC descriptions
 * @param epc EPC record
 * @returns U-values for different elements
 */
function getUValuesFromEPC(epc: EPCRecord): { floor: number; wall: number; roof: number; window: number } {
  // Default U-values (typical for average UK housing stock)
  let floor = 0.7;
  let wall = 1.6;
  let roof = 0.6;
  let window = 3.1;

  // Parse wall description
  if (epc.walls_description) {
    const desc = epc.walls_description.toLowerCase();
    if (desc.includes('cavity') && desc.includes('filled')) wall = 0.55;
    else if (desc.includes('cavity') && desc.includes('unfilled')) wall = 1.6;
    else if (desc.includes('solid brick') || desc.includes('solid wall')) wall = 2.1;
    else if (desc.includes('solid stone')) wall = 1.7;
    else if (desc.includes('external insulation') || desc.includes('insulated externally')) wall = 0.3;
    else if (desc.includes('internal insulation')) wall = 0.45;
    else if (desc.includes('as built, no insulation')) wall = 2.1;
    else if (desc.includes('timber frame')) wall = 0.6;
  }

  // Use construction age band if available
  if (epc.construction_age_band) {
    const age = epc.construction_age_band.toLowerCase();
    if (!epc.walls_description || epc.walls_description.toLowerCase().includes('as built')) {
      if (age.includes('before 1900') || age.includes('1900-1929')) wall = 2.1;
      else if (age.includes('1930-1949')) wall = 1.6;
      else if (age.includes('1950-1966')) wall = 1.5;
      else if (age.includes('1967-1975')) wall = 1.0;
      else if (age.includes('1976-1982')) wall = 0.6;
      else if (age.includes('1983-1990')) wall = 0.5;
      else if (age.includes('1991-1995')) wall = 0.45;
      else if (age.includes('1996-2002')) wall = 0.45;
      else if (age.includes('2003-2006')) wall = 0.35;
      else if (age.includes('2007') || age.includes('2008') || age.includes('2009') || age.includes('2010') || age.includes('2011')) wall = 0.28;
      else if (age.includes('2012')) wall = 0.18;
    }
  }

  // Parse roof description
  if (epc.roof_description) {
    const desc = epc.roof_description.toLowerCase();
    if (desc.includes('300mm') || desc.includes('12 inch')) roof = 0.13;
    else if (desc.includes('270mm') || desc.includes('11 inch')) roof = 0.15;
    else if (desc.includes('250mm') || desc.includes('10 inch')) roof = 0.16;
    else if (desc.includes('200mm') || desc.includes('8 inch')) roof = 0.2;
    else if (desc.includes('150mm') || desc.includes('6 inch')) roof = 0.25;
    else if (desc.includes('100mm') || desc.includes('4 inch')) roof = 0.4;
    else if (desc.includes('50mm') || desc.includes('2 inch')) roof = 0.8;
    else if (desc.includes('uninsulated') || desc.includes('no insulation')) roof = 2.3;
  }

  // Parse floor description
  if (epc.floor_description) {
    const desc = epc.floor_description.toLowerCase();
    if (desc.includes('suspended timber') && desc.includes('insulated')) floor = 0.25;
    else if (desc.includes('suspended timber')) floor = 0.7;
    else if (desc.includes('solid') && desc.includes('insulated')) floor = 0.25;
    else if (desc.includes('solid')) floor = 0.7;
  }

  // Parse window description
  if (epc.windows_description) {
    const desc = epc.windows_description.toLowerCase();
    if (desc.includes('triple')) window = 1.2;
    else if (desc.includes('double') && (desc.includes('low-e') || desc.includes('low e'))) window = 1.6;
    else if (desc.includes('double') && desc.includes('argon')) window = 2.0;
    else if (desc.includes('double')) window = 2.8;
    else if (desc.includes('single')) window = 4.8;
    else if (desc.includes('secondary')) window = 2.4;
  }

  return { floor, wall, roof, window };
}

/**
 * Estimate wall area
 * @param floorArea Total floor area
 * @param numFloors Number of floors
 * @param floorHeight Floor height
 * @returns Estimated wall area
 */
function estimateWallArea(floorArea: number, numFloors: number, floorHeight: number): number {
  // Simple estimation: assume square footprint, wall area = perimeter * height * numFloors
  const sideLength = Math.sqrt(floorArea);
  const perimeter = 4 * sideLength;
  return perimeter * floorHeight * numFloors * 0.7; // 70% external walls
}

/**
 * Estimate window area
 * @param floorArea Total floor area
 * @returns Estimated window area
 */
function estimateWindowArea(floorArea: number): number {
  // Typically 10-20% of floor area for windows
  return floorArea * 0.15;
}