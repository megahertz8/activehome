# Solar Integration into Evolving Home

This document outlines how to integrate the solar potential estimates into the Evolving Home EPC score display.

## Overview

The solar potential is calculated using PVGIS (primary for UK/EU) or PVWatts (for US/fallback). It provides annual and monthly generation, financial savings, CO2 savings, and payback period.

## Usage in Components

### Fetching Solar Data

Use the `/api/solar` endpoint to get solar potential.

#### By Postcode and Property Details
```
GET /api/solar?postcode=M1+1AE&property_type=semi&floor_area=85
```

This auto-geocodes the postcode, estimates roof area (30% of floor area for semi-detached), and calculates solar potential.

#### By Coordinates and Roof Area
```
GET /api/solar?lat=51.5&lon=-0.1&roof_area=50
```

Returns JSON:
```json
{
  "annualGeneration_kWh": 3150,
  "monthlyGeneration_kWh": [92, 126, 260, 404, 477, 508, 504, 416, 306, 181, 92, 57],
  "peakPower_kWp": 3.5,
  "annualSavings_GBP": 771,
  "co2Saved_kg": 730,
  "paybackYears": 8.5
}
```

### Displaying in UI

Add a "Solar Potential" section to the EPC results page.

Example Markdown for display:

🌞 **Solar Potential**
- Estimated roof capacity: 3.5 kWp (10 panels)
- Annual generation: 3,150 kWh
- Self-consumption savings: £535/year
- Export income (SEG): £236/year
- Total annual benefit: £771/year
- Estimated payback: 8.5 years
- CO₂ saved: 730 kg/year

### Calculation Details

- **Self-consumption**: 50% of generation, saved at £0.28/kWh (approximate UK rate)
- **Export**: 50% exported at £0.15/kWh (Smart Export Guarantee)
- **CO₂ factor**: 0.231 kg/kWh (UK grid average)
- **Payback**: Assumes £6,500 system cost (adjust based on actual quotes)
- **Panels**: ~10 panels for 3.5 kWp (400W each)

### Integration with EPC Score

- Display solar potential alongside EPC rating
- Highlight how solar can improve energy efficiency score
- Use as a call-to-action for renewable upgrades

### Assumptions

- Typical UK installation: 35° tilt, 0° azimuth (south-facing)
- System losses: 14%
- Roof capacity: 0.15 kWp/m² (accounting for pitch and spacing)
- Property types: Detached (40%), Semi (30%), Terrace (25%), Flat (10%)

### Error Handling

- If API fails, show "Solar potential unavailable" message
- Cache results for 30 days to reduce API calls
- Graceful fallback: PVGIS -> PVWatts if key available

### Future Enhancements

- Add system cost input for accurate payback
- Integrate with EPC data for more precise roof estimates
- Add solar panel visualization on roof map