/**
 * OpenBEM SAP Energy Calculation Library
 *
 * Reimplementation of SAP 2012 methodology for building energy calculations.
 * Based on OpenBEM (https://github.com/emoncms/openbem) but extracted and reimplemented in TypeScript.
 *
 * Units: All in metric (kWh, m², °C, W/m²K)
 */

export interface BuildingData {
  region: number;
  altitude: number;
  use_custom_occupancy: boolean;
  custom_occupancy: number;
  floors: { [key: string]: { area: number; height: number } };
  fabric: {
    elements: {
      [key: string]: {
        type: string; // 'wall', 'roof', 'floor', 'window'
        name: string;
        subtractfrom?: string;
        l?: number;
        h?: number;
        area: number;
        uvalue: number;
        kvalue?: number;
        orientation?: number;
        overshading?: number;
        g?: number;
        gL?: number;
        ff?: number;
      };
    };
  };
  ventilation: {
    number_of_chimneys: number;
    number_of_openflues: number;
    number_of_intermittentfans: number;
    number_of_passivevents: number;
    number_of_fluelessgasfires: number;
    air_permeability_test: boolean;
    air_permeability_value: number;
    dwelling_construction: string;
    suspended_wooden_floor: string | number;
    draught_lobby: boolean;
    percentage_draught_proofed: number;
    number_of_sides_sheltered: number;
    ventilation_type: string;
    system_air_change_rate: number;
    balanced_heat_recovery_efficiency: number;
  };
  use_LAC: boolean;
  LAC: {
    LLE: number;
    L: number;
    reduced_internal_heat_gains: boolean;
  };
  use_water_heating: boolean;
  water_heating: {
    low_water_use_design: boolean;
    instantaneous_hotwater: boolean;
    solar_water_heating: boolean;
    pipework_insulated_fraction: number;
    declared_loss_factor_known: boolean;
    manufacturer_loss_factor: number;
    storage_volume: number;
    temperature_factor_a: number;
    loss_factor_b: number;
    volume_factor_b: number;
    temperature_factor_b: number;
    community_heating: boolean;
    hot_water_store_in_dwelling: boolean;
    contains_dedicated_solar_storage_or_WWHRS: boolean;
    hot_water_control_type: string;
    combi_loss: number[];
  };
  use_SHW: boolean;
  SHW: {
    A: number;
    n0: number;
    a1: number;
    a2: number;
    inclination: number;
    orientation: number;
    overshading: number;
    Vs: number;
    combined_cylinder_volume: number;
  };
  temperature: {
    responsiveness: number;
    target: number;
    control_type: number;
    living_area: number;
  };
  space_heating: {
    use_utilfactor_forgains: boolean;
  };
}

export interface EnergyResults {
  num_of_floors: number;
  TFA: number;
  volume: number;
  occupancy: number;
  TMP: number;
  GL: number;
  fabric: {
    total_heat_loss_WK: number;
    total_floor_WK: number;
    total_wall_WK: number;
    total_roof_WK: number;
    total_window_WK: number;
    annual_solar_gain: number;
    annual_solar_gain_kwh: number;
    monthly_solar_gains_W: number[];
  };
  ventilation: {
    average_WK: number;
    effective_air_change_rate: number[];
    infiltration_WK: number[];
  };
  internal_gains: {
    lighting_W: number[];
    appliances_W: number[];
    cooking_W: number[];
    metabolic_W: number[];
    water_heating_W: number[];
    total_W: number[];
  };
  internal_temperature: number[];
  external_temperature: number[];
  space_heating: {
    annual_heating_demand: number;
  };
  water_heating: {
    annual_energy_content: number;
  };
  energy_requirements: {
    space_heating?: { quantity: number };
    waterheating?: { quantity: number };
    lighting?: { quantity: number };
    appliances?: { quantity: number };
    cooking?: { quantity: number };
  };
}

// Embedded datasets (extracted from OpenBEM)
const DATASETS = {
  table_u1: [
    [4.5,5.0,6.8,8.7,11.7,14.6,16.9,16.9,14.3,10.8,7.0,4.9],
    // ... (full table_u1 from datasets.js)
    [5.2,5.4,6.8,8.3,11.1,13.4,15.4,15.2,13.2,10.2,7.4,5.5]
  ] as number[][],
  table_u2: [
    [5.4,5.1,5.1,4.5,4.1,3.9,3.7,3.7,4.2,4.5,4.8,5.1],
    // ... full table_u2
    [6.0,5.7,5.7,5.0,4.6,4.4,4.2,4.2,4.7,5.1,5.4,5.7]
  ] as number[][],
  table_u3: [
    [26,54,94,150,190,201,194,164,116,68,33,21],
    // ... full table_u3
    [23,49,89,139,190,188,175,152,107,61,29,17]
  ] as number[][],
  solar_declination: [-20.7,-12.8,-1.8,9.8,18.8,23.1,21.2,13.7,2.9,-8.7,-18.4,-23.0],
  table_u4: [53.4,51.5,51.0,50.8,50.6,51.5,52.7,53.4,54.8,55.5,54.5,53.4,52.3,52.5,55.8,56.4,57.2,57.5,58.0,59.0,60.2,54.7],
  k: {
    1: [0.056,-2.85,-0.241,0.839,2.35],
    2: [-5.79,2.89,-0.024,-0.604,-2.97],
    3: [6.23,0.298,0.351,0.989,2.4],
    4: [3.32,4.52,0.604,-0.554,-3.04],
    5: [-0.159,-6.28,-0.494,0.251,3.88],
    6: [-3.74,1.47,-0.502,-2.49,-4.97],
    7: [-2.7,-2.58,-1.79,-2.0,-1.31],
    8: [3.45,3.96,2.06,2.28,1.27],
    9: [-1.21,-1.88,-0.405,0.807,1.83]
  } as { [key: number]: number[] },
  table_1a: [31,28,31,30,31,30,31,31,30,31,30,31],
  table_1c: [1.1,1.06,1.02,0.98,0.94,0.90,0.90,0.94,0.98,1.02,1.06,1.10],
  table_1d: [41.2,41.4,40.1,37.6,36.4,33.9,30.4,33.4,33.5,36.3,39.4,39.9],
  table_h4: [1.0,1.0,0.94,0.70,0.45,0.44,0.44,0.48,0.76,0.94,1.0,1.0]
};

/**
 * Calculate space heating demand using SAP methodology
 * @param params Building parameters
 * @returns Energy results
 */
export function calculateEnergyDemand(params: BuildingData): EnergyResults {
  const data: any = { ...params };

  // Initialize results
  const results: EnergyResults = {
    num_of_floors: 0,
    TFA: 0,
    volume: 0,
    occupancy: 0,
    TMP: 0,
    GL: 0,
    fabric: {
      total_heat_loss_WK: 0,
      total_floor_WK: 0,
      total_wall_WK: 0,
      total_roof_WK: 0,
      total_window_WK: 0,
      annual_solar_gain: 0,
      annual_solar_gain_kwh: 0,
      monthly_solar_gains_W: [0,0,0,0,0,0,0,0,0,0,0,0]
    },
    ventilation: {
      average_WK: 0,
      effective_air_change_rate: [],
      infiltration_WK: []
    },
    internal_gains: {
      lighting_W: [0,0,0,0,0,0,0,0,0,0,0,0],
      appliances_W: [0,0,0,0,0,0,0,0,0,0,0,0],
      cooking_W: [0,0,0,0,0,0,0,0,0,0,0,0],
      metabolic_W: [0,0,0,0,0,0,0,0,0,0,0,0],
      water_heating_W: [0,0,0,0,0,0,0,0,0,0,0,0],
      total_W: [0,0,0,0,0,0,0,0,0,0,0,0]
    },
    internal_temperature: [],
    external_temperature: [],
    space_heating: { annual_heating_demand: 0 },
    water_heating: { annual_energy_content: 0 },
    energy_requirements: {}
  };

  // Run calculation modules
  calcFloors(data, results);
  calcOccupancy(data, results);
  calcFabric(data, results);
  calcVentilation(data, results);
  calcInternalGains(data, results);
  calcTemperature(data, results);
  calcSpaceHeating(data, results);
  calcWaterHeating(data, results);

  return results;
}

/**
 * Calculate fabric heat loss
 * @param params Building data
 * @returns Fabric heat loss breakdown
 */
export function calculateFabricHeatLoss(params: BuildingData): {
  total_WK: number;
  floors_WK: number;
  walls_WK: number;
  roofs_WK: number;
  windows_WK: number;
} {
  const data: any = { ...params };
  const results: Partial<EnergyResults> = {};

  calcFloors(data, results as EnergyResults);
  calcFabric(data, results as EnergyResults);

  return {
    total_WK: results.fabric!.total_heat_loss_WK,
    floors_WK: results.fabric!.total_floor_WK,
    walls_WK: results.fabric!.total_wall_WK,
    roofs_WK: results.fabric!.total_roof_WK,
    windows_WK: results.fabric!.total_window_WK
  };
}

/**
 * Calculate heating cost
 * @param demand_kWh Annual heating demand in kWh
 * @param fuelType Fuel type ('gas', 'electric', etc.)
 * @param tariff Cost per kWh
 * @returns Annual cost
 */
export function calculateHeatingCost(demand_kWh: number, fuelType: string, tariff: number): number {
  return demand_kWh * tariff;
}

/**
 * Calculate upgrade savings
 * @param current Current building data
 * @param upgraded Upgraded building data
 * @returns Savings breakdown
 */
export function calculateUpgradeSavings(current: BuildingData, upgraded: BuildingData): {
  spaceHeatingSavings_kWh: number;
  waterHeatingSavings_kWh?: number;
} {
  const currentResults = calculateEnergyDemand(current);
  const upgradedResults = calculateEnergyDemand(upgraded);

  const spaceHeatingSavings = currentResults.space_heating.annual_heating_demand - upgradedResults.space_heating.annual_heating_demand;

  return {
    spaceHeatingSavings_kWh: Math.max(0, spaceHeatingSavings)
  };
}

// Internal calculation functions (ported from OpenBEM)

function calcFloors(data: any, results: EnergyResults) {
  results.num_of_floors = 0;
  results.TFA = 0;
  results.volume = 0;

  for (const z in data.floors) {
    const floor = data.floors[z];
    floor.volume = floor.area * floor.height;
    results.TFA += floor.area;
    results.volume += floor.volume;
    results.num_of_floors++;
  }
}

function calcOccupancy(data: any, results: EnergyResults) {
  if (data.TFA > 13.9) {
    results.occupancy = 1 + 1.76 * (1 - Math.exp(-0.000349 * Math.pow((results.TFA - 13.9), 2))) + 0.0013 * (results.TFA - 13.9);
  } else {
    results.occupancy = 1;
  }

  if (data.use_custom_occupancy) {
    results.occupancy = data.custom_occupancy;
  }
}

function calcFabric(data: any, results: EnergyResults) {
  results.fabric.total_heat_loss_WK = 0;
  let total_thermal_capacity = 0;
  results.fabric.total_floor_WK = 0;
  results.fabric.total_wall_WK = 0;
  results.fabric.total_roof_WK = 0;
  results.fabric.total_window_WK = 0;
  results.fabric.annual_solar_gain = 0;

  const monthly_gains_W = [0,0,0,0,0,0,0,0,0,0,0,0];
  let sum = 0;

  for (const z in data.fabric.elements) {
    const element = data.fabric.elements[z];

    // Use length and height if given
    if (element.l != undefined && element.l != '' && element.h != undefined && element.h != '') {
      element.area = element.l * element.h;
    }
    element.netarea = element.area;

    // Subtract window areas
    for (const w in data.fabric.elements) {
      if (data.fabric.elements[w].type == 'window' && data.fabric.elements[w].subtractfrom == z) {
        let windowarea = data.fabric.elements[w].area;
        if (data.fabric.elements[w].l != undefined && data.fabric.elements[w].l != '' &&
            data.fabric.elements[w].h != undefined && data.fabric.elements[w].h != '') {
          windowarea = data.fabric.elements[w].l * data.fabric.elements[w].h;
        }
        element.windowarea = windowarea;
        element.netarea -= windowarea;
      }
    }

    element.wk = element.netarea * element.uvalue;
    results.fabric.total_heat_loss_WK += element.wk;

    if (element.type == 'floor') results.fabric.total_floor_WK += element.wk;
    if (element.type == 'wall') results.fabric.total_wall_WK += element.wk;
    if (element.type == 'roof') results.fabric.total_roof_WK += element.wk;
    if (element.type == 'window') results.fabric.total_window_WK += element.wk;

    if (element.kvalue != undefined) {
      total_thermal_capacity += element.kvalue * element.area;
    }

    if (element.type == 'window') {
      let orientation = element.orientation;
      const area = element.area;
      const overshading = element.overshading || 0;
      const g = element.g || 0.7;
      const ff = element.ff || 0.7;

      let gain = 0;

      for (let month = 0; month < 12; month++) {
        const table_6d = [[0.3,0.5],[0.54,0.7],[0.77,0.9],[1.0,1.0]];
        const summer = (month >= 5 && month <= 8) ? 1 : 0;
        const access_factor = table_6d[overshading][summer];

        if (orientation == 5) orientation = 3; // SE/SW
        if (orientation == 6) orientation = 2; // East/West
        if (orientation == 7) orientation = 1; // NE/NW

        const gain_month = access_factor * area * solar_rad(data.region, orientation, 90, month) * 0.9 * g * ff;
        monthly_gains_W[month] += gain_month;
        gain += gain_month;
      }

      const accessfactor = [0.5, 0.67, 0.83, 1.0];
      sum += 0.9 * area * g * ff * accessfactor[overshading];
      element.gain = gain / 12.0;
      results.fabric.annual_solar_gain += element.gain;
    }
  }

  results.fabric.annual_solar_gain_kwh = results.fabric.annual_solar_gain * 0.024 * 365;
  results.fabric.monthly_solar_gains_W = monthly_gains_W;
  results.TMP = total_thermal_capacity / results.TFA;
  results.GL = sum / results.TFA;
}

function calcVentilation(data: any, results: EnergyResults) {
  const vent = data.ventilation;

  let total = 0;
  total += vent.number_of_chimneys * 40;
  total += vent.number_of_openflues * 20;
  total += vent.number_of_intermittentfans * 10;
  total += vent.number_of_passivevents * 10;
  total += vent.number_of_fluelessgasfires * 10;

  let infiltration = 0;
  if (results.volume != 0) {
    infiltration = total / results.volume;
  }

  if (!vent.air_permeability_test) {
    infiltration += (results.num_of_floors - 1) * 0.1;
    if (vent.dwelling_construction == 'timberframe') infiltration += 0.2;
    if (vent.dwelling_construction == 'masonry') infiltration += 0.35;
    if (vent.suspended_wooden_floor == 'unsealed') infiltration += 0.2;
    if (vent.suspended_wooden_floor == 'sealed') infiltration += 0.1;
    if (!vent.draught_lobby) infiltration += 0.05;
    infiltration += (0.25 - (0.2 * vent.percentage_draught_proofed / 100));
  } else {
    infiltration += vent.air_permeability_value / 20.0;
  }

  const shelter_factor = 1 - (0.075 * vent.number_of_sides_sheltered);
  infiltration *= shelter_factor;

  const adjusted_infiltration: number[] = [];
  for (let m = 0; m < 12; m++) {
    const windspeed = DATASETS.table_u2[data.region][m];
    const windfactor = windspeed / 4;
    adjusted_infiltration[m] = infiltration * windfactor;
  }

  const effective_air_change_rate: number[] = [];
  switch (vent.ventilation_type) {
    case 'a':
      for (let m = 0; m < 12; m++) {
        effective_air_change_rate[m] = adjusted_infiltration[m] + vent.system_air_change_rate * (1 - vent.balanced_heat_recovery_efficiency / 100.0);
      }
      break;
    case 'b':
      for (let m = 0; m < 12; m++) {
        effective_air_change_rate[m] = adjusted_infiltration[m] + vent.system_air_change_rate;
      }
      break;
    case 'c':
      for (let m = 0; m < 12; m++) {
        if (adjusted_infiltration[m] < 0.5 * vent.system_air_change_rate) {
          effective_air_change_rate[m] = vent.system_air_change_rate;
        } else {
          effective_air_change_rate[m] = adjusted_infiltration[m] + (0.5 * vent.system_air_change_rate);
        }
      }
      break;
    case 'd':
      for (let m = 0; m < 12; m++) {
        if (adjusted_infiltration[m] >= 1) {
          effective_air_change_rate[m] = adjusted_infiltration[m];
        } else {
          effective_air_change_rate[m] = 0.5 + Math.pow(adjusted_infiltration[m], 2) * 0.5;
        }
      }
      break;
  }

  let sum = 0;
  const infiltration_WK: number[] = [];
  for (let m = 0; m < 12; m++) {
    infiltration_WK[m] = effective_air_change_rate[m] * results.volume * 0.33;
    sum += infiltration_WK[m];
  }

  results.ventilation.average_WK = sum / 12.0;
  results.ventilation.effective_air_change_rate = effective_air_change_rate;
  results.ventilation.infiltration_WK = infiltration_WK;
}

function calcInternalGains(data: any, results: EnergyResults) {
  // SAP 2012 Section 5: Internal heat gains
  // Includes: lighting, appliances, cooking, metabolic, water heating losses
  
  const TFA = results.TFA;
  const occupancy = results.occupancy;
  const GL = results.GL;

  // Lighting gains (LAC calculation)
  const LLE = data.LAC?.LLE || 0.5; // Low energy lighting proportion
  const L = data.LAC?.L || 1;
  const reduced_gains = data.LAC?.reduced_internal_heat_gains || false;

  // Annual energy consumption for lighting (kWh/year)
  const EB = 59.73 * Math.pow((TFA * occupancy), 0.4714);
  
  let EL = 0;
  const lighting_monthly = [0,0,0,0,0,0,0,0,0,0,0,0];
  
  if (L !== 0) {
    const C1 = 1 - (0.50 * LLE / L);
    let C2 = 0;
    if (GL <= 0.095) {
      C2 = 52.2 * Math.pow(GL, 2) - 9.94 * GL + 1.433;
    } else {
      C2 = 0.96;
    }
    EL = EB * C1 * C2;

    for (let m = 0; m < 12; m++) {
      // Monthly lighting energy (kWh)
      const EL_month = EL * (1.0 + (0.5 * Math.cos((2 * Math.PI * (m - 0.2)) / 12.0))) * DATASETS.table_1a[m] / 365.0;
      // Convert to watts (85% becomes heat)
      lighting_monthly[m] = EL_month * 0.85 * 1000 / (24 * DATASETS.table_1a[m]);
      if (reduced_gains) lighting_monthly[m] = 0.4 * lighting_monthly[m];
    }
  }

  // Appliances gains
  const EA_initial = 207.8 * Math.pow((TFA * occupancy), 0.4714);
  const appliances_monthly = [0,0,0,0,0,0,0,0,0,0,0,0];
  let EA = 0;

  for (let m = 0; m < 12; m++) {
    const EA_month = EA_initial * (1.0 + (0.157 * Math.cos((2 * Math.PI * (m - 1.78)) / 12.0))) * DATASETS.table_1a[m] / 365.0;
    EA += EA_month;
    appliances_monthly[m] = EA_month * 1000 / (24 * DATASETS.table_1a[m]);
    if (reduced_gains) appliances_monthly[m] = 0.67 * appliances_monthly[m];
  }

  // Cooking gains (constant year-round)
  let GC = 35 + 7 * occupancy; // watts
  if (reduced_gains) GC = 23 + 5 * occupancy;
  const cooking_monthly = Array(12).fill(GC);
  const EC = GC * 0.024 * 365; // Annual cooking energy kWh

  // Metabolic gains (60W per person baseline)
  const metabolic = 60 * occupancy; // watts
  const metabolic_monthly = Array(12).fill(metabolic);

  // Water heating losses (will be added when water heating is calculated)
  const water_heating_monthly = [0,0,0,0,0,0,0,0,0,0,0,0];

  // Total internal gains
  const total_gains_W = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let m = 0; m < 12; m++) {
    total_gains_W[m] = lighting_monthly[m] + appliances_monthly[m] + cooking_monthly[m] + 
                       metabolic_monthly[m] + water_heating_monthly[m];
  }

  results.internal_gains = {
    lighting_W: lighting_monthly,
    appliances_W: appliances_monthly,
    cooking_W: cooking_monthly,
    metabolic_W: metabolic_monthly,
    water_heating_W: water_heating_monthly,
    total_W: total_gains_W
  };

  // Update energy requirements
  if (data.use_LAC) {
    if (EL > 0) results.energy_requirements.lighting = { quantity: EL };
    if (EA > 0) results.energy_requirements.appliances = { quantity: EA };
    if (EC > 0) results.energy_requirements.cooking = { quantity: EC };
  }
}

function calcTemperature(data: any, results: EnergyResults) {
  const temp = data.temperature;
  const R = temp.responsiveness;
  const Th = temp.target;
  const TMP = results.TMP;
  const TFA = results.TFA;

  const H = [0,0,0,0,0,0,0,0,0,0,0,0];
  const HLP: number[] = [];
  const G = [0,0,0,0,0,0,0,0,0,0,0,0];

  // Calculate losses and gains per month
  for (let m = 0; m < 12; m++) {
    H[m] = results.fabric.total_heat_loss_WK + results.ventilation.infiltration_WK[m];
    HLP[m] = H[m] / TFA;
    // Combine solar gains and internal gains (both in watts)
    G[m] = results.fabric.monthly_solar_gains_W[m] + results.internal_gains.total_W[m];
  }

  const Te: number[] = [];
  for (let m = 0; m < 12; m++) {
    Te[m] = DATASETS.table_u1[data.region][m] - (0.3 * data.altitude / 50);
  }

  // Calculate utilisation factor
  const utilisation_factor_A: number[] = [];
  for (let m = 0; m < 12; m++) {
    utilisation_factor_A[m] = calcUtilisationFactor(TMP, HLP[m], H[m], Th, Te[m], G[m]);
  }

  // Living area temperature
  const Ti_livingarea: number[] = [];
  for (let m = 0; m < 12; m++) {
    let Ti = Th;
    const u1a = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th, 7);
    const u1b = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th, 0);
    const u2 = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th, 8);
    const Tweekday = Th - (u1a + u2);
    const Tweekend = Th - (u1b + u2);
    Ti_livingarea[m] = (5 * Tweekday + 2 * Tweekend) / 7;
  }

  // Rest of dwelling
  const Th2: number[] = [];
  for (let m = 0; m < 12; m++) {
    if (temp.control_type == 1) Th2[m] = Th - 0.5 * HLP[m];
    if (temp.control_type == 2) Th2[m] = Th - HLP[m] + (Math.pow(HLP[m], 2) / 12);
    if (temp.control_type == 3) Th2[m] = Th - HLP[m] + (Math.pow(HLP[m], 2) / 12);
    if (isNaN(Th2[m])) Th2[m] = Th;
  }

  const utilisation_factor_B: number[] = [];
  for (let m = 0; m < 12; m++) {
    let Ti = Th2[m];
    let tmpHLP = HLP[m];
    if (tmpHLP > 6.0) tmpHLP = 6.0;
    utilisation_factor_B[m] = calcUtilisationFactor(TMP, tmpHLP, H[m], Ti, Te[m], G[m]);
  }

  const Ti_restdwelling: number[] = [];
  for (let m = 0; m < 12; m++) {
    const Th_val = Th2[m];
    let Ti = Th2[m];
    const u1a = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th_val, 7);
    const u1b = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th_val, 0);
    const u2 = calcTemperatureReduction(TMP, HLP[m], H[m], Ti, Te[m], G[m], R, Th_val, 8);
    const Tweekday = Th_val - (u1a + u2);
    const Tweekend = Th_val - (u1b + u2);
    Ti_restdwelling[m] = (5 * Tweekday + 2 * Tweekend) / 7;
  }

  const fLA = temp.living_area / TFA;
  results.internal_temperature = [];
  for (let m = 0; m < 12; m++) {
    results.internal_temperature[m] = (fLA * Ti_livingarea[m]) + ((1 - fLA) * Ti_restdwelling[m]);
  }
  results.external_temperature = Te;
}

function calcSpaceHeating(data: any, results: EnergyResults) {
  const delta_T: number[] = [];
  const total_losses: number[] = [];
  const total_gains: number[] = [];
  const utilisation_factor: number[] = [];
  const useful_gains: number[] = [];
  const heat_demand: number[] = [];
  const heat_demand_kwh: number[] = [];

  let annual_heating_demand = 0;

  for (let m = 0; m < 12; m++) {
    delta_T[m] = results.internal_temperature[m] - results.external_temperature[m];
    const H = results.fabric.total_heat_loss_WK + results.ventilation.infiltration_WK[m];
    total_losses[m] = H * delta_T[m];
    // Total gains = solar gains + internal gains (both in watts)
    total_gains[m] = results.fabric.monthly_solar_gains_W[m] + results.internal_gains.total_W[m];

    const HLP = H / results.TFA;
    utilisation_factor[m] = calcUtilisationFactor(results.TMP, HLP, H, results.internal_temperature[m], results.external_temperature[m], total_gains[m]);

    if (data.space_heating.use_utilfactor_forgains) {
      useful_gains[m] = total_gains[m] * utilisation_factor[m];
    } else {
      useful_gains[m] = total_gains[m];
    }

    heat_demand[m] = total_losses[m] - useful_gains[m];
    if (heat_demand[m] < 0) heat_demand[m] = 0;

    heat_demand_kwh[m] = 0.024 * heat_demand[m] * DATASETS.table_1a[m];
    annual_heating_demand += heat_demand_kwh[m];
  }

  results.space_heating.annual_heating_demand = annual_heating_demand;
  if (annual_heating_demand > 0) {
    results.energy_requirements.space_heating = { quantity: annual_heating_demand };
  }
}

function calcWaterHeating(data: any, results: EnergyResults) {
  const wh = data.water_heating;
  wh.Vd_average = (25 * results.occupancy) + 36;
  if (wh.low_water_use_design) wh.Vd_average *= 0.95;

  results.water_heating.annual_energy_content = 0;

  for (let m = 0; m < 12; m++) {
    const Vd_m = DATASETS.table_1c[m] * wh.Vd_average;
    const monthly_energy_content = (4.190 * Vd_m * DATASETS.table_1a[m] * DATASETS.table_1d[m]) / 3600;
    results.water_heating.annual_energy_content += monthly_energy_content;
  }

  if (data.use_water_heating) {
    results.energy_requirements.waterheating = { quantity: results.water_heating.annual_energy_content };
  }
}

// Utility functions

function solar_rad(region: number, orient: number, p: number, m: number): number {
  const k = DATASETS.k;
  const radians = (p / 360.0) * 2.0 * Math.PI;
  const sinp = Math.sin(radians);
  const sin2p = sinp * sinp;
  const sin3p = sinp * sinp * sinp;

  const A = k[1][orient] * sin3p + k[2][orient] * sin2p + k[3][orient] * sinp;
  const B = k[4][orient] * sin3p + k[5][orient] * sin2p + k[6][orient] * sinp;
  const C = k[7][orient] * sin3p + k[8][orient] * sin2p + k[9][orient] * sinp + 1;

  const latitude = (DATASETS.table_u4[region] / 360) * 2 * Math.PI;
  const sol_dec = (DATASETS.solar_declination[m] / 360) * 2 * Math.PI;
  const cos1 = Math.cos(latitude - sol_dec);
  const cos2 = cos1 * cos1;

  const Rh_inc = A * cos2 + B * cos1 + C;
  return DATASETS.table_u3[region][m] * Rh_inc;
}

function calcUtilisationFactor(TMP: number, HLP: number, H: number, Ti: number, Te: number, G: number): number {
  const tau = TMP / (3.6 * HLP);
  const a = 1.0 + tau / 15.0;
  const L = H * (Ti - Te);
  const y = G / L;
  let n = 0.0;
  if (y > 0.0 && y != 1.0) n = (1.0 - Math.pow(y, a)) / (1.0 - Math.pow(y, a + 1.0));
  if (y == 1.0) n = a / (a + 1.0);
  if (isNaN(n)) n = 0;
  return n;
}

function calcTemperatureReduction(TMP: number, HLP: number, H: number, Ti: number, Te: number, G: number, R: number, Th: number, toff: number): number {
  const utilisation_factor = calcUtilisationFactor(TMP, HLP, H, Ti, Te, G);
  const tau = TMP / (3.6 * HLP);
  const tc = 4.0 + 0.25 * tau;
  const Tsc = (1.0 - R) * (Th - 2.0) + R * (Te + utilisation_factor * G / H);
  let u = 0;
  if (toff <= tc) u = 0.5 * toff * toff * (Th - Tsc) / (24 * tc);
  if (toff > tc) u = (Th - Tsc) * (toff - 0.5 * tc) / 24;
  if (isNaN(u)) u = 0;
  return u;
}