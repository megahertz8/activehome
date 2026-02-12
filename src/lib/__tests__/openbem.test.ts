/**
 * OpenBEM SAP 2012 Implementation Tests
 * 
 * Tests the energy calculation engine with realistic building scenarios
 */

import { describe, it, expect } from '@jest/globals';
import { calculateEnergyDemand, calculateFabricHeatLoss, calculateUpgradeSavings, BuildingData } from '../openbem';

describe('OpenBEM SAP 2012 Energy Calculations', () => {
  
  /**
   * Test Case: Victorian Terrace in Manchester
   * 
   * Typical property characteristics:
   * - Built: 1890
   * - Floor area: 85 m²
   * - 2 storeys, 2.4m ceiling height
   * - Solid brick walls (uninsulated): 2.1 W/m²K
   * - Double glazed windows (old): 2.8 W/m²K
   * - 100mm loft insulation: 0.4 W/m²K
   * - Suspended timber floor (uninsulated): 0.7 W/m²K
   * - Gas boiler (85% efficiency)
   * - Current EPC rating: D (50-68)
   */
  describe('Victorian Terrace - Manchester', () => {
    const victorianTerrace: BuildingData = {
      region: 13, // North West (Manchester region in SAP table)
      altitude: 50,
      use_custom_occupancy: false,
      custom_occupancy: 3,
      floors: {
        'ground': { area: 42.5, height: 2.4 },
        'first': { area: 42.5, height: 2.4 }
      },
      fabric: {
        elements: {
          'ground_floor': {
            type: 'floor',
            name: 'Ground floor',
            area: 42.5,
            uvalue: 0.7, // Uninsulated suspended timber
            kvalue: 100
          },
          'external_walls': {
            type: 'wall',
            name: 'External walls',
            area: 62, // Estimated: perimeter ~20m × height 4.8m × 70% external
            uvalue: 2.1, // Solid brick, uninsulated
            kvalue: 200
          },
          'roof': {
            type: 'roof',
            name: 'Roof',
            area: 42.5,
            uvalue: 0.4, // 100mm loft insulation
            kvalue: 50
          },
          'windows_front': {
            type: 'window',
            name: 'Front windows',
            subtractfrom: 'external_walls',
            area: 8,
            uvalue: 2.8, // Old double glazing
            orientation: 4, // South
            overshading: 2, // Moderate (terraced)
            g: 0.76, // Solar gain factor
            gL: 0.70,
            ff: 0.70, // Frame factor
            kvalue: 0
          },
          'windows_rear': {
            type: 'window',
            name: 'Rear windows',
            subtractfrom: 'external_walls',
            area: 7,
            uvalue: 2.8,
            orientation: 0, // North
            overshading: 2,
            g: 0.76,
            gL: 0.70,
            ff: 0.70,
            kvalue: 0
          }
        }
      },
      ventilation: {
        number_of_chimneys: 1, // Typical for Victorian
        number_of_openflues: 0,
        number_of_intermittentfans: 1,
        number_of_passivevents: 0,
        number_of_fluelessgasfires: 0,
        air_permeability_test: false,
        air_permeability_value: 0,
        dwelling_construction: 'masonry',
        suspended_wooden_floor: 'unsealed',
        draught_lobby: false,
        percentage_draught_proofed: 50,
        number_of_sides_sheltered: 2, // Mid-terrace
        ventilation_type: 'd', // Natural ventilation
        system_air_change_rate: 0,
        balanced_heat_recovery_efficiency: 100
      },
      use_LAC: true,
      LAC: {
        LLE: 0.5, // 50% low energy lighting
        L: 1,
        reduced_internal_heat_gains: false
      },
      use_water_heating: true,
      water_heating: {
        low_water_use_design: false,
        instantaneous_hotwater: false,
        solar_water_heating: false,
        pipework_insulated_fraction: 0.5,
        declared_loss_factor_known: false,
        manufacturer_loss_factor: 0,
        storage_volume: 120,
        temperature_factor_a: 0,
        loss_factor_b: 0,
        volume_factor_b: 0,
        temperature_factor_b: 0,
        community_heating: false,
        hot_water_store_in_dwelling: true,
        contains_dedicated_solar_storage_or_WWHRS: false,
        hot_water_control_type: 'cylinder_thermostat',
        combi_loss: [0,0,0,0,0,0,0,0,0,0,0,0]
      },
      use_SHW: false,
      SHW: {
        A: 0,
        n0: 0.599,
        a1: 2.772,
        a2: 0.009,
        inclination: 35,
        orientation: 4,
        overshading: 1,
        Vs: 0,
        combined_cylinder_volume: 0
      },
      temperature: {
        responsiveness: 1,
        target: 21,
        control_type: 1, // Room thermostat only
        living_area: 42.5 // Ground floor living area
      },
      space_heating: {
        use_utilfactor_forgains: true
      }
    };

    it('should calculate correct floor area and volume', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      expect(results.TFA).toBe(85);
      expect(results.volume).toBe(204); // 85 m² × 2.4m
      expect(results.num_of_floors).toBe(2);
    });

    it('should calculate realistic occupancy', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // SAP formula for 85m²: 1 + 1.76 × (1 - exp(-0.000349 × (85-13.9)²)) + 0.0013 × (85-13.9)
      // Expected: ~2.5-3 people
      expect(results.occupancy).toBeGreaterThan(2);
      expect(results.occupancy).toBeLessThan(3.5);
    });

    it('should calculate fabric heat loss correctly', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Expected breakdown:
      // Walls: (62 - 15) × 2.1 = ~99 W/K (after subtracting windows)
      // Roof: 42.5 × 0.4 = 17 W/K
      // Floor: 42.5 × 0.7 = 30 W/K
      // Windows: 15 × 2.8 = 42 W/K
      // Total: ~188 W/K
      
      expect(results.fabric.total_heat_loss_WK).toBeGreaterThan(170);
      expect(results.fabric.total_heat_loss_WK).toBeLessThan(210);
      
      // Wall loss should be highest
      expect(results.fabric.total_wall_WK).toBeGreaterThan(80);
      expect(results.fabric.total_wall_WK).toBeLessThan(120);
      
      // Windows significant contributor
      expect(results.fabric.total_window_WK).toBeGreaterThan(35);
      expect(results.fabric.total_window_WK).toBeLessThan(50);
    });

    it('should calculate ventilation heat loss correctly', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Victorian with chimney, mid-terrace, moderate draughtproofing
      // Expected infiltration: 0.8-1.2 ACH
      // Ventilation loss: 0.33 × ACH × volume
      // For 204 m³ at 1.0 ACH: ~67 W/K
      
      expect(results.ventilation.average_WK).toBeGreaterThan(50);
      expect(results.ventilation.average_WK).toBeLessThan(90);
    });

    it('should calculate total heat loss in expected range', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Total heat loss: fabric + ventilation
      // Expected: 170-210 + 50-90 = 220-300 W/K
      // Target range: 150-250 W/K (mid-range Victorian)
      
      const totalHeatLoss = results.fabric.total_heat_loss_WK + results.ventilation.average_WK;
      
      expect(totalHeatLoss).toBeGreaterThan(200);
      expect(totalHeatLoss).toBeLessThan(300);
      console.log(`Total heat loss: ${totalHeatLoss.toFixed(1)} W/K`);
    });

    it('should calculate internal gains (lighting, appliances, cooking, metabolic)', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Check internal gains are present and non-zero
      expect(results.internal_gains).toBeDefined();
      
      // Lighting gains (varies by month)
      expect(results.internal_gains.lighting_W[0]).toBeGreaterThan(0);
      
      // Appliances gains (varies by month)
      expect(results.internal_gains.appliances_W[0]).toBeGreaterThan(50);
      
      // Cooking gains (constant)
      expect(results.internal_gains.cooking_W[0]).toBeGreaterThan(40);
      expect(results.internal_gains.cooking_W[0]).toBeLessThan(80);
      
      // Metabolic gains (constant, ~60W per person)
      expect(results.internal_gains.metabolic_W[0]).toBeGreaterThan(120);
      expect(results.internal_gains.metabolic_W[0]).toBeLessThan(210);
      
      // Total gains should be significant (200-400W depending on month)
      expect(results.internal_gains.total_W[0]).toBeGreaterThan(200);
      expect(results.internal_gains.total_W[6]).toBeGreaterThan(150); // Summer (less lighting)
    });

    it('should calculate solar gains with seasonal variation', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Solar gains should vary by month
      const janGains = results.fabric.monthly_solar_gains_W[0];
      const junGains = results.fabric.monthly_solar_gains_W[5];
      
      // June solar gains should be higher than January
      expect(junGains).toBeGreaterThan(janGains);
      
      // Annual solar gain should be reasonable for windows (~15m²)
      expect(results.fabric.annual_solar_gain_kwh).toBeGreaterThan(500);
      expect(results.fabric.annual_solar_gain_kwh).toBeLessThan(2000);
    });

    it('should calculate annual heating demand in realistic range', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Expected for Victorian terrace with some improvements:
      // - Heat loss ~250 W/K
      // - Degree days ~2500 (Manchester)
      // - Internal gains ~2500 kWh/year
      // - Expected demand: 15,000-25,000 kWh/year
      
      const heatingDemand = results.space_heating.annual_heating_demand;
      
      expect(heatingDemand).toBeGreaterThan(12000);
      expect(heatingDemand).toBeLessThan(30000);
      
      console.log(`Annual heating demand: ${heatingDemand.toFixed(0)} kWh/year`);
      
      // Heating demand per m²
      const demandPerM2 = heatingDemand / results.TFA;
      expect(demandPerM2).toBeGreaterThan(140); // ~140-300 kWh/m²/year typical for Victorian
      expect(demandPerM2).toBeLessThan(350);
      
      console.log(`Heating demand per m²: ${demandPerM2.toFixed(0)} kWh/m²/year`);
    });

    it('should calculate annual heating cost in realistic range', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Gas price: ~£0.10/kWh including standing charge
      const gasCost = 0.10;
      const boilerEfficiency = 0.85;
      
      const gasUsed = results.space_heating.annual_heating_demand / boilerEfficiency;
      const annualCost = gasUsed * gasCost;
      
      // Expected: £1,500-£3,000/year for Victorian terrace
      expect(annualCost).toBeGreaterThan(1400);
      expect(annualCost).toBeLessThan(4000);
      
      console.log(`Estimated annual heating cost: £${annualCost.toFixed(0)}/year (gas @ ${gasCost}p/kWh)`);
    });

    it('should calculate water heating demand', () => {
      const results = calculateEnergyDemand(victorianTerrace);
      
      // Water heating for 2.5-3 people: ~2000-3000 kWh/year
      expect(results.water_heating.annual_energy_content).toBeGreaterThan(1500);
      expect(results.water_heating.annual_energy_content).toBeLessThan(4000);
      
      console.log(`Annual water heating: ${results.water_heating.annual_energy_content.toFixed(0)} kWh/year`);
    });
  });

  /**
   * Test Case: Wall Insulation Upgrade
   */
  describe('Upgrade Scenario: External Wall Insulation', () => {
    it('should show significant savings from wall insulation', () => {
      const current: BuildingData = {
        region: 13,
        altitude: 50,
        use_custom_occupancy: false,
        custom_occupancy: 3,
        floors: {
          'ground': { area: 42.5, height: 2.4 },
          'first': { area: 42.5, height: 2.4 }
        },
        fabric: {
          elements: {
            'walls': {
              type: 'wall',
              name: 'External walls',
              area: 62,
              uvalue: 2.1, // Uninsulated solid brick
              kvalue: 200
            },
            'roof': {
              type: 'roof',
              name: 'Roof',
              area: 42.5,
              uvalue: 0.4,
              kvalue: 50
            },
            'floor': {
              type: 'floor',
              name: 'Floor',
              area: 42.5,
              uvalue: 0.7,
              kvalue: 100
            },
            'windows': {
              type: 'window',
              name: 'Windows',
              subtractfrom: 'walls',
              area: 15,
              uvalue: 2.8,
              orientation: 4,
              overshading: 2,
              g: 0.76,
              ff: 0.70,
              kvalue: 0
            }
          }
        },
        ventilation: {
          number_of_chimneys: 1,
          number_of_openflues: 0,
          number_of_intermittentfans: 1,
          number_of_passivevents: 0,
          number_of_fluelessgasfires: 0,
          air_permeability_test: false,
          air_permeability_value: 0,
          dwelling_construction: 'masonry',
          suspended_wooden_floor: 'unsealed',
          draught_lobby: false,
          percentage_draught_proofed: 50,
          number_of_sides_sheltered: 2,
          ventilation_type: 'd',
          system_air_change_rate: 0,
          balanced_heat_recovery_efficiency: 100
        },
        use_LAC: true,
        LAC: {
          LLE: 0.5,
          L: 1,
          reduced_internal_heat_gains: false
        },
        use_water_heating: true,
        water_heating: {
          low_water_use_design: false,
          instantaneous_hotwater: false,
          solar_water_heating: false,
          pipework_insulated_fraction: 0.5,
          declared_loss_factor_known: false,
          manufacturer_loss_factor: 0,
          storage_volume: 120,
          temperature_factor_a: 0,
          loss_factor_b: 0,
          volume_factor_b: 0,
          temperature_factor_b: 0,
          community_heating: false,
          hot_water_store_in_dwelling: true,
          contains_dedicated_solar_storage_or_WWHRS: false,
          hot_water_control_type: 'cylinder_thermostat',
          combi_loss: [0,0,0,0,0,0,0,0,0,0,0,0]
        },
        use_SHW: false,
        SHW: {
          A: 0,
          n0: 0.599,
          a1: 2.772,
          a2: 0.009,
          inclination: 35,
          orientation: 4,
          overshading: 1,
          Vs: 0,
          combined_cylinder_volume: 0
        },
        temperature: {
          responsiveness: 1,
          target: 21,
          control_type: 1,
          living_area: 42.5
        },
        space_heating: {
          use_utilfactor_forgains: true
        }
      };

      // Upgraded: Add external wall insulation (2.1 → 0.3 W/m²K)
      const upgraded = JSON.parse(JSON.stringify(current));
      upgraded.fabric.elements.walls.uvalue = 0.3;

      const savings = calculateUpgradeSavings(current, upgraded);
      
      // Wall insulation should save significant energy
      // U-value reduction: 2.1 - 0.3 = 1.8 W/m²K
      // Area: ~47 m² (after windows)
      // Heat loss reduction: 47 × 1.8 = ~85 W/K
      // Annual savings: ~3000-5000 kWh/year
      
      expect(savings.spaceHeatingSavings_kWh).toBeGreaterThan(2500);
      expect(savings.spaceHeatingSavings_kWh).toBeLessThan(7000);
      
      console.log(`Annual savings from wall insulation: ${savings.spaceHeatingSavings_kWh.toFixed(0)} kWh/year`);
      
      // Cost savings at £0.10/kWh
      const costSavings = (savings.spaceHeatingSavings_kWh / 0.85) * 0.10;
      console.log(`Annual cost savings: £${costSavings.toFixed(0)}/year`);
      
      // Typical EWI cost: £8,000-£12,000
      // Payback: 10-20 years
      const installCost = 10000;
      const payback = installCost / costSavings;
      console.log(`Simple payback: ${payback.toFixed(1)} years`);
      
      expect(payback).toBeGreaterThan(8);
      expect(payback).toBeLessThan(30);
    });
  });

  /**
   * Test Case: U-Value Calculation
   */
  describe('Fabric Heat Loss Component Tests', () => {
    it('should calculate wall heat loss correctly', () => {
      const testBuilding: BuildingData = {
        region: 0,
        altitude: 0,
        use_custom_occupancy: true,
        custom_occupancy: 1,
        floors: {
          'ground': { area: 50, height: 2.5 }
        },
        fabric: {
          elements: {
            'wall': {
              type: 'wall',
              name: 'Test wall',
              area: 100,
              uvalue: 2.1, // Solid brick
              kvalue: 200
            }
          }
        },
        ventilation: {
          number_of_chimneys: 0,
          number_of_openflues: 0,
          number_of_intermittentfans: 0,
          number_of_passivevents: 0,
          number_of_fluelessgasfires: 0,
          air_permeability_test: true,
          air_permeability_value: 10,
          dwelling_construction: 'masonry',
          suspended_wooden_floor: 0,
          draught_lobby: true,
          percentage_draught_proofed: 100,
          number_of_sides_sheltered: 4,
          ventilation_type: 'd',
          system_air_change_rate: 0,
          balanced_heat_recovery_efficiency: 100
        },
        use_LAC: false,
        LAC: { LLE: 0, L: 0, reduced_internal_heat_gains: false },
        use_water_heating: false,
        water_heating: {
          low_water_use_design: false,
          instantaneous_hotwater: false,
          solar_water_heating: false,
          pipework_insulated_fraction: 0,
          declared_loss_factor_known: false,
          manufacturer_loss_factor: 0,
          storage_volume: 0,
          temperature_factor_a: 0,
          loss_factor_b: 0,
          volume_factor_b: 0,
          temperature_factor_b: 0,
          community_heating: false,
          hot_water_store_in_dwelling: false,
          contains_dedicated_solar_storage_or_WWHRS: false,
          hot_water_control_type: '',
          combi_loss: []
        },
        use_SHW: false,
        SHW: {
          A: 0,
          n0: 0,
          a1: 0,
          a2: 0,
          inclination: 0,
          orientation: 0,
          overshading: 0,
          Vs: 0,
          combined_cylinder_volume: 0
        },
        temperature: {
          responsiveness: 1,
          target: 21,
          control_type: 1,
          living_area: 50
        },
        space_heating: {
          use_utilfactor_forgains: false
        }
      };

      const heatLoss = calculateFabricHeatLoss(testBuilding);
      
      // Expected: 100 m² × 2.1 W/m²K = 210 W/K
      expect(heatLoss.walls_WK).toBeCloseTo(210, 0);
    });
  });
});
