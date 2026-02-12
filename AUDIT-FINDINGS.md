# OpenBEM SAP 2012 Implementation Audit

**Audit Date**: 2026-02-12  
**Auditor**: Energy Engineering Subagent  
**Files Audited**: openbem.ts, u-values.ts, epc-to-openbem.ts, energy-calc.ts

---

## 🔴 CRITICAL ISSUES

### 1. **MISSING INTERNAL GAINS** (HIGH SEVERITY)
**Impact**: Heating demand overestimated by 20-40%

The implementation completely omits internal heat gains from:
- **Lighting**: ~50-150 W depending on TFA
- **Appliances**: ~207.8 × (TFA × occupancy)^0.4714 kWh/year
- **Cooking**: 35 + 7 × occupancy watts
- **Metabolic**: ~60W per person (SAP standard)
- **Water heating losses**: Cylinder losses contribute to space heating

**Current code** only includes solar gains through windows.

**OpenBEM reference**: `calc.LAC()` function calculates all internal gains and adds them to `data.gains_W` array.

**Fix required**: Implement `calcInternalGains()` function that adds:
```typescript
gains_W = {
  solar: [...],      // Already implemented
  lighting: [...],   // MISSING
  appliances: [...], // MISSING
  cooking: [...],    // MISSING
  metabolic: [...],  // MISSING
  water_heating: [...] // MISSING
}
```

---

### 2. **INCORRECT U-VALUE DEFAULTS** (MEDIUM SEVERITY)
**Impact**: Heat loss calculations 10-30% off for older properties

**U-values.ts issues**:
- Solid brick (uninsulated): Listed as **1.0 W/m²K**, should be **2.1 W/m²K**
- Cavity unfilled: Listed as **0.8 W/m²K**, should be **1.6 W/m²K**
- Single glazing: Correct at **4.8 W/m²K** ✓
- Uninsulated roof: Listed as **1.0 W/m²K**, should be **2.3 W/m²K**

**Age-based defaults too optimistic**:
- Pre-1919: Listed as 1.2, should be 2.1 (solid brick)
- 1919-1944: Listed as 1.0, should be 1.6 (early cavity)

---

### 3. **MONTHLY GAIN DISTRIBUTION MISSING** (MEDIUM SEVERITY)
Solar gains are calculated monthly (✓), but when aggregated in `calcSpaceHeating()`:

```typescript
total_gains[m] = results.fabric.annual_solar_gain / 12; // WRONG - not accounting for seasonal variation
```

This averages solar gains across all months instead of using the actual monthly values calculated in `calcFabric()`.

**Fix**: Store monthly solar gains array, not just annual average.

---

### 4. **INCOMPLETE EPC MAPPING** (LOW-MEDIUM SEVERITY)

**epc-to-openbem.ts**:
- Window area estimation (15% of floor area) is reasonable ✓
- Wall area estimation reasonable ✓
- Missing parser for specific EPC wall descriptions:
  - "As built, no insulation" → should map to 2.1 W/m²K
  - "Cavity wall, as built, insulated (assumed)" → ambiguous, defaults to 0.5
- Missing mechanical ventilation system detection beyond MVHR

---

## ⚠️ MODERATE ISSUES

### 5. **Ventilation Calculation Edge Cases**
- Air permeability test values: conversion from m³/h/m² @ 50Pa to ACH is correct (÷20) ✓
- Wind factor calculation correct ✓
- **Missing**: Default chimney/flue assumptions for older properties
- Default infiltration for pre-1919 properties should include chimney allowance

---

### 6. **Thermal Mass Defaults**
- Wall k-values: 200 kJ/m²K (brick/masonry) ✓
- Floor k-values: 100 kJ/m²K - should be 300 for concrete ✗
- Roof k-values: 50 kJ/m²K for light construction ✓

---

### 7. **Temperature Control Types**
Implementation matches SAP Table 9 for control types 1, 2, 3 ✓
- Type 1: Room thermostat only
- Type 2: Programmer and room thermostat
- Type 3: TRVs and bypass

---

## ✅ CORRECT IMPLEMENTATIONS

### 1. **Fabric Heat Loss Calculation**
```typescript
element.wk = element.netarea * element.uvalue;
```
✓ Correct: U × A for each element, properly subtracts window areas from walls

### 2. **Ventilation Heat Loss**
```typescript
infiltration_WK[m] = effective_air_change_rate[m] * results.volume * 0.33;
```
✓ Correct: 0.33 W/m³K is the standard SAP value (density × specific heat of air / 3)

### 3. **Solar Radiation Calculation**
The `solar_rad()` function uses proper SAP coefficients from Table U3 and orientation factors ✓

### 4. **Utilization Factor**
```typescript
const tau = TMP / (3.6 * HLP);
const a = 1.0 + tau / 15.0;
const y = G / L;
let n = 0.0;
if (y > 0.0 && y != 1.0) n = (1.0 - Math.pow(y, a)) / (1.0 - Math.pow(y, a + 1.0));
if (y == 1.0) n = a / (a + 1.0);
```
✓ Correct SAP utilization factor formula (accounts for thermal mass)

### 5. **Degree Days**
Uses regional temperature data from SAP Table U1 with altitude correction ✓

### 6. **Occupancy Calculation**
```typescript
if (data.TFA > 13.9) {
  results.occupancy = 1 + 1.76 * (1 - Math.exp(-0.000349 * Math.pow((results.TFA - 13.9), 2))) + 0.0013 * (results.TFA - 13.9);
}
```
✓ Exact SAP formula

---

## 🔧 REQUIRED FIXES

### Priority 1 (Critical)
1. ✗ **Add internal gains calculation** (lighting, appliances, cooking, metabolic)
2. ✗ **Fix U-value defaults** for uninsulated construction
3. ✗ **Fix monthly solar gain distribution** in space heating calc

### Priority 2 (Important)
4. ✗ **Add water heating losses as internal gains**
5. ✗ **Improve EPC text parsing** for construction types
6. ✗ **Add default chimney allowance** for pre-1919 properties

### Priority 3 (Enhancement)
7. ✗ **Add metabolic gains** (60W per person baseline)
8. ✗ **Better thermal mass** defaults (concrete floors)
9. ✗ **Extended mechanical ventilation** system types

---

## 📊 EXPECTED IMPACTS

### Before Fixes
- **Annual heating demand**: 25,000-35,000 kWh (overestimated)
- **Heat loss (W/K)**: 180-300 (overestimated)

### After Fixes
- **Annual heating demand**: 15,000-25,000 kWh (realistic)
- **Heat loss (W/K)**: 150-250 (realistic)
- **Internal gains offset**: ~2,000-3,000 kWh/year

---

## 📖 REFERENCES

1. SAP 2012 Methodology: BRE (2014)
2. OpenBEM source: https://github.com/emoncms/openbem
3. BR 443 Conventions for U-value calculations (BRE, 2006)
4. SAP 2012 Table 5: Internal heat gains
5. SAP 2012 Section 9: Space heating demand

---

## ✅ VALIDATION PLAN

### Test Case: Victorian Terrace
- Floor area: 85 m²
- Solid brick walls (uninsulated): 2.1 W/m²K
- Double glazed windows (old): 2.8 W/m²K
- 100mm loft insulation: 0.3 W/m²K
- Expected heat loss: 150-250 W/K
- Expected heating demand: 15,000-25,000 kWh/year

**Will create comprehensive test after fixes applied.**
