# Country Adapters

This document describes the country adapter architecture for Evolving Home, enabling multi-country support with a plugin pattern.

## Overview

The adapter pattern allows each country to have its own implementation for energy data handling, while maintaining a consistent API. This supports different data sources (EPC in UK, DPE in France), rating scales, pricing, and regulations.

## Architecture

### Core Interface

Each country implements the `CountryAdapter` interface defined in `src/lib/adapters/types.ts`:

```typescript
interface CountryAdapter {
  // Identity
  countryCode: string;        // ISO 3166-1 alpha-2 (GB, FR, NL, US, etc.)
  countryName: string;        // "United Kingdom", "France", etc.
  currency: string;           // GBP, EUR, USD
  locale: string;             // en-GB, fr-FR, etc.

  // Data
  searchByPostcode(postcode: string): Promise<AddressResult[]>;
  getCertificate(id: string): Promise<EnergyData | null>;

  // Energy Calculations
  calculateEnergyScore(data: EnergyData): EnergyScore;
  getRatingScale(): RatingBand[];

  // Pricing
  getEnergyPrices(region?: string): Promise<EnergyPrices>;

  // Solar
  getSolarPotential(lat: number, lon: number, roofArea: number): Promise<SolarResult>;

  // Grants & Incentives
  getAvailableGrants(data: EnergyData): Promise<Grant[]>;

  // Improvements
  getRecommendations(data: EnergyData): Recommendation[];

  // Contractors (affiliate links)
  getContractorSearchUrl(postcode: string, improvementType: string): string;

  // Validation
  validatePostcode(postcode: string): boolean;
  formatPostcode(postcode: string): string;
}
```

### Registry

The `src/lib/adapters/index.ts` file provides:
- `getAdapter(countryCode: string)` - Get adapter for a country
- `detectCountry(postcode: string)` - Auto-detect country from postcode format
- `getSupportedCountries()` - List all supported countries

## Method Details

### searchByPostcode(postcode: string)
Returns a list of addresses for a given postcode.

**UK Implementation**: Queries local SQLite EPC database or EPC API.

**France Implementation**: TODO - Query local DPE database.

### getCertificate(id: string)
Retrieves full energy certificate data for a specific property.

**UK Implementation**: Fetches EPC record with all fields.

**France Implementation**: TODO - Fetch DPE record.

### calculateEnergyScore(data: EnergyData)
Calculates current/potential energy scores and savings.

**UK Implementation**: Uses EPC cost fields to calculate annual/20-year savings.

**France Implementation**: TODO - Calculate based on DPE consumption data.

### getRatingScale()
Returns the A-G rating bands with colors and thresholds.

**UK Implementation**: Standard EPC A-G scale.

**France Implementation**: DPE A-G scale (different kWh/m² thresholds).

### getEnergyPrices(region?: string)
Gets live energy prices for electricity/gas.

**UK Implementation**: Octopus Energy API.

**France Implementation**: EDF regulated tariffs.

### getSolarPotential(lat, lon, roofArea)
Estimates solar PV potential.

**UK Implementation**: PVGIS API.

**France Implementation**: Same PVGIS API (works for France too).

### getAvailableGrants(data)
Returns applicable government grants.

**UK Implementation**: Boiler Upgrade Scheme, ECO4, etc. based on rating/fuel.

**France Implementation**: MaPrimeRénov' grants.

### getRecommendations(data)
Suggests energy improvement measures.

**UK Implementation**: Based on EPC descriptions (wall/roof insulation, windows).

**France Implementation**: TODO - Based on DPE diagnostic.

### getContractorSearchUrl(postcode, improvementType)
Returns affiliate links to contractor search platforms.

**UK Implementation**: Checkatrade.com

**France Implementation**: QuelleEnergie.fr

### validatePostcode/formatPostcode
Country-specific postcode validation and formatting.

## Adding a New Country

1. Create `src/lib/adapters/{countryCode}.ts` implementing `CountryAdapter`
2. Add import and registration in `src/lib/adapters/index.ts`
3. Update `detectCountry()` to recognize the new postcode format
4. Implement data source (local DB, API, etc.)
5. Add country-specific logic for grants, pricing, etc.

## Current Status

### United Kingdom (GB)
- ✅ Full implementation
- ✅ EPC local database
- ✅ EPC API fallback
- ✅ Energy calculations
- ✅ Solar PVGIS
- ✅ Octopus pricing
- ✅ UK grants
- ✅ Postcode validation

### France (FR)
- ✅ Stub implementation
- ✅ DPE rating scale
- ✅ Postcode validation (5 digits)
- ✅ MaPrimeRénov' grants stub
- 🔄 **TODO**: DPE data import and lookup
- 🔄 **TODO**: EDF pricing integration
- 🔄 **TODO**: DPE-based recommendations

### Lite Mode (Global Fallback)
- ✅ Generic adapter for any country
- ✅ PVGIS solar potential (global coverage)
- ✅ Degree day estimation from latitude
- ✅ User-entered energy bills as primary data
- ✅ Building physics estimates from age/size
- ✅ EU-standard A-G rating scale
- ✅ Nominatim geocoding fallback
- ✅ No grants (shows message)
- ✅ No contractor links (Google search fallback)

## Auto-Country Onboarding Pipeline

The platform now supports automatic onboarding of new countries through a research-driven pipeline:

### 1. Lite Mode Fallback
When a user enters a postcode from an unsupported country, the system automatically:
- Detects the country via postcode format or geo-IP headers
- Falls back to the `LiteAdapter` for basic functionality
- Logs the request to `country_requests` table for analytics
- Returns results with `liteMode: true` flag

### 2. Country Request Tracking
All lite mode requests are tracked in Supabase:
- `country_requests` table stores country code, postcode, IP country
- `country_request_counts` view aggregates usage statistics
- RLS allows anonymous inserts but restricts reads to service role

### 3. Research Agent Workflow
When demand is detected for a new country:
1. Use the research prompt template (`research-agent-prompt.md`)
2. Feed to AI agent (Claude/Grok) to gather comprehensive country data
3. AI outputs structured JSON with all required adapter information
4. Use generator template to create adapter code
5. Add to registry and test

### 4. Adapter Generation
The `generator-template.ts.hbs` provides a complete adapter skeleton that:
- Implements all `CountryAdapter` interface methods
- Fills in researched data (grants, pricing, contractors, etc.)
- Includes TODO comments for implementation details
- Ready for manual completion by developers

### 5. UI Integration
Frontend shows "beta" badge for lite mode via `isLiteMode()` check:
- Different messaging for lite vs full adapters
- Clear indication of limited functionality
- Call-to-action for full country support

## France DPE Data Import

The France DPE data is available as a MySQL dump at `data/france/dpe_logement_202103.sql`.

### Import Process
1. Convert MySQL dump to SQLite format
2. Create `data/france/dpe.db` SQLite database
3. Extract relevant fields from `td001_dpe` table
4. Create indexes for postcode and address searches

### Key Fields
- `numero_dpe` - DPE identifier
- `code_postal` - Postcode
- `commune` - City
- `adresse` - Address
- `consommation_energie` - Energy consumption (kWh/m²)
- `classe_consommation_energie` - Energy class (A-G)
- `estimation_ges` - GHG emissions
- `classe_estimation_ges` - GHG class (A-G)

### Challenges
- Large dataset (~6GB MySQL dump)
- Need to map DPE fields to common `EnergyData` interface
- Different calculation methodology vs EPC

## API Changes

The `/api/epc` endpoint now accepts an optional `country` parameter:

```
GET /api/epc?postcode=SW1A%201AA&country=GB
```

If `country` is omitted, it's auto-detected from postcode format or geo-IP.

### New Response Fields
- `liteMode`: Boolean indicating if lite adapter was used

## Backward Compatibility

- UK postcodes without `country` param default to GB
- Existing UK functionality unchanged
- API response format maintained with backward-compatible additions