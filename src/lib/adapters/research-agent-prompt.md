# Country Energy Adapter Research Agent Prompt

You are an AI research agent tasked with gathering comprehensive information about a country's energy certification and efficiency systems. Your goal is to research and compile data that can be used to create a new country adapter for the Evolving Home platform.

## Target Country: {COUNTRY_NAME} ({COUNTRY_CODE})

## Research Requirements

Compile information for the following categories. Output must be structured JSON that maps directly to adapter fields.

### 1. National Energy Certificate Database
- **name**: Official name of the energy certificate system (e.g., "Energy Performance Certificate (EPC)", "Diagnostic de Performance Énergétique (DPE)")
- **url**: Official government website URL for the system
- **public_access**: Boolean - is the database publicly accessible?
- **bulk_download**: Boolean - is bulk data download available?
- **api**: Boolean - is there a public API?
- **api_url**: URL if API exists, null otherwise
- **data_format**: Description of data format (JSON, XML, CSV, etc.)
- **language**: Primary language of the data/system

### 2. Rating/Labeling System
- **scale**: Array of rating bands (A-G or similar)
- **thresholds**: Object mapping each band to kWh/m²/yr ranges
- **colors**: Object mapping each band to hex color codes
- **descriptions**: Object mapping each band to localized descriptions
- **calculation_method**: How the rating is calculated (energy consumption, efficiency, etc.)

### 3. Energy Pricing
- **electricity_regulated**: Boolean - is electricity price regulated?
- **gas_regulated**: Boolean - is gas price regulated?
- **average_residential_electricity**: Average residential electricity rate (EUR/kWh or local currency)
- **average_residential_gas**: Average residential gas rate (EUR/kWh or local currency)
- **pricing_api**: URL or description of API for live pricing data
- **currency**: Local currency code (EUR, GBP, USD, etc.)

### 4. Government Grant/Incentive Programs
- **programs**: Array of grant programs with:
  - name: Program name
  - amount: Typical grant amount or range
  - description: What the grant covers
  - eligibility: Who qualifies (income, property type, current rating, etc.)
  - url: Official program website
  - contact: Contact information or application portal

### 5. Postcode/Address Format
- **format_regex**: Regular expression for validating postcodes
- **format_description**: Human-readable description of postcode format
- **validation_rules**: Additional validation rules
- **geocoding_api**: Recommended geocoding service (Nominatim, Google, etc.)
- **geocoding_api_url**: API endpoint URL if applicable

### 6. Climate and Heating/Cooling Patterns
- **heating_degree_days**: Average annual heating degree days
- **cooling_degree_days**: Average annual cooling degree days
- **climate_zones**: Array of climate zones within the country
- **typical_heating_season**: Months when heating is typically used
- **typical_cooling_season**: Months when cooling is typically used
- **average_winter_temp**: Average winter temperature (°C)
- **average_summer_temp**: Average summer temperature (°C)

### 7. Common Building Types and Construction Eras
- **building_types**: Array of common property types (detached, semi-detached, terrace, flat, etc.)
- **construction_eras**: Array of historical construction periods with:
  - period: Name of the era (e.g., "Victorian", "Post-war")
  - years: Year range
  - typical_construction: Building materials and methods
  - typical_u_values: Typical U-values for walls, roof, windows
  - common_improvements: Typical energy efficiency improvements

### 8. Local Contractor/Tradesperson Platforms
- **platforms**: Array of contractor search platforms with:
  - name: Platform name
  - url: Website URL
  - coverage: Geographic coverage
  - specialties: Types of work covered
  - affiliate_program: Boolean - does affiliate program exist?

### 9. Legal Requirements
- **mandatory_on_sale**: Boolean - is energy certificate mandatory when selling property?
- **mandatory_on_rent**: Boolean - is energy certificate mandatory when renting property?
- **validity_period**: How long certificate is valid (years)
- **penalty_non_compliance**: Penalties for non-compliance
- **responsible_party**: Who is responsible for obtaining certificate (seller, buyer, agent, etc.)

### 10. Data Format and Language Considerations
- **primary_language**: ISO language code (en, fr, de, etc.)
- **date_format**: Local date format
- **number_format**: Local number formatting (decimal separator, etc.)
- **address_format**: How addresses are typically formatted
- **energy_units**: Units used for energy consumption (kWh/m²/yr, kWh/m³/yr, etc.)
- **area_units**: Units used for floor area (m², ft², etc.)

## Output Format

Your response must be valid JSON with the following structure:

```json
{
  "country_code": "XX",
  "country_name": "Country Name",
  "database": {
    "name": "...",
    "url": "...",
    "public_access": true,
    "bulk_download": false,
    "api": true,
    "api_url": "https://...",
    "data_format": "JSON",
    "language": "en"
  },
  "rating_system": {
    "scale": ["A", "B", "C", "D", "E", "F", "G"],
    "thresholds": {
      "A": [0, 50],
      "B": [51, 90],
      "C": [91, 150],
      "D": [151, 230],
      "E": [231, 330],
      "F": [331, 450],
      "G": [451, 999]
    },
    "colors": {
      "A": "#00a651",
      "B": "#50b848",
      "C": "#b3d334",
      "D": "#fef200",
      "E": "#f7941d",
      "F": "#ee1d23",
      "G": "#a0171e"
    },
    "descriptions": {
      "A": "Very efficient",
      "B": "Efficient",
      "C": "Average",
      "D": "Below average",
      "E": "Poor",
      "F": "Very poor",
      "G": "Extremely poor"
    },
    "calculation_method": "Primary energy consumption per square meter per year"
  },
  "energy_pricing": {
    "electricity_regulated": true,
    "gas_regulated": true,
    "average_residential_electricity": 0.25,
    "average_residential_gas": 0.08,
    "pricing_api": "https://api.example.com/prices",
    "currency": "EUR"
  },
  "grants": [
    {
      "name": "Green Grant Program",
      "amount": "Up to €5,000",
      "description": "Grants for energy efficiency improvements",
      "eligibility": "Properties with D-G ratings",
      "url": "https://gov.example.com/grants",
      "contact": "info@gov.example.com"
    }
  ],
  "postcode_format": {
    "format_regex": "^\\d{5}$",
    "format_description": "5-digit numeric postcode",
    "validation_rules": ["Must be exactly 5 digits"],
    "geocoding_api": "Nominatim",
    "geocoding_api_url": "https://nominatim.openstreetmap.org/"
  },
  "climate": {
    "heating_degree_days": 2500,
    "cooling_degree_days": 150,
    "climate_zones": ["Temperate", "Mediterranean"],
    "typical_heating_season": "October - April",
    "typical_cooling_season": "June - August",
    "average_winter_temp": 5,
    "average_summer_temp": 25
  },
  "buildings": {
    "building_types": ["Detached", "Semi-detached", "Terrace", "Flat"],
    "construction_eras": [
      {
        "period": "Pre-1919",
        "years": "Before 1919",
        "typical_construction": "Solid brick walls, slate roofs",
        "typical_u_values": {"walls": 2.1, "roof": 0.6, "windows": 4.8},
        "common_improvements": ["Wall insulation", "Roof insulation"]
      }
    ]
  },
  "contractors": [
    {
      "name": "Local Contractor Platform",
      "url": "https://contractors.example.com",
      "coverage": "National",
      "specialties": ["Insulation", "Windows", "Heating"],
      "affiliate_program": true
    }
  ],
  "legal": {
    "mandatory_on_sale": true,
    "mandatory_on_rent": true,
    "validity_period": 10,
    "penalty_non_compliance": "Fine up to €10,000",
    "responsible_party": "Seller"
  },
  "localization": {
    "primary_language": "en",
    "date_format": "DD/MM/YYYY",
    "number_format": "1,234.56",
    "address_format": "Street, City, Postcode",
    "energy_units": "kWh/m²/yr",
    "area_units": "m²"
  }
}
```

## Lessons Learned from Previous Countries

These are hard-won lessons from onboarding UK and France. Follow them to avoid repeating mistakes.

### Data Acquisition Patterns

**Pattern 1: Bulk SQL/CSV dumps (UK, France)**
- Government open data portals often provide full database dumps
- These can be MASSIVE (UK EPC: 7.4GB SQLite/17.6M rows, France DPE: 5.6GB MySQL/10M rows)
- MySQL dumps pack thousands of value tuples per INSERT line (60KB+ lines) — a naive line-by-line parser will miss 99.9% of rows. You MUST handle multi-value INSERT statements: `INSERT INTO table VALUES (...),(...),(...);`
- Always use a state-machine parser for value extraction (track quote state, handle escaped characters like `\'`, handle NULL, handle commas inside quoted strings)
- Batch insert (every 10K rows) and commit periodically — don't try to hold millions of rows in memory
- Convert MySQL types to SQLite equivalents: INT→INTEGER, VARCHAR(n)→TEXT, DECIMAL→REAL, DATE→TEXT, remove AUTO_INCREMENT/ENGINE=/backticks
- Strip MySQL-specific syntax: `/*!40101 SET ...*/`, `LOCK TABLES`, `UNLOCK TABLES`, `KEY` definitions inside CREATE TABLE
- After import, create indexes on: rating class, location (postcode/commune/department), certificate ID
- Verify row count matches expectations — if you get 11K rows from a 5.6GB file, something is wrong

**Pattern 2: REST API (UK EPC API, Netherlands EP-Online)**
- May require registration for API key (free but manual process)
- Rate limits vary — cache aggressively (30-day TTL in Supabase)
- Auth can be Basic Auth (UK: email:token as base64) or API key header
- Always implement: API → Supabase cache → response (never skip cache)

**Pattern 3: No public data (Germany, Israel)**
- Fall back to lite mode (user-entered bills + PVGIS solar + building physics estimates)
- Still useful — many users just want to know "how does my home compare"
- National average energy consumption data usually available from statistical offices

### Data Format Gotchas
- **Encoding**: European dumps often use Latin-1 or Windows-1252, not UTF-8. Always try `errors='replace'` when reading
- **Character sets**: MySQL dumps may have `SET NAMES utf8` but actual data has mixed encodings
- **Decimal separators**: France uses comma (3,14), UK uses dot (3.14) — handle in parsing
- **Date formats**: Vary wildly (DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY)
- **Address formats**: Some countries put house number before street, some after. Some have no postcodes (Ireland used to). Research the specific format.

### Rating Scale Differences
- UK EPC: A-G based on SAP score (1-100+), energy cost per m²
- France DPE: A-G based on kWh/m²/yr PRIMARY energy + separate GES (CO2) rating
- Netherlands: A++++ to G (yes, multiple plus signs)
- Germany: A+ to H (different scale entirely)
- Don't assume A-G is universal — always research the specific scale and thresholds

### What Makes a Country "Easy" vs "Hard"
- **Easy**: Public bulk DB + clear rating scale + English or well-documented API (UK, Netherlands)
- **Medium**: Public data but different format/language + registration required (France, Spain)
- **Hard**: No public bulk data, proprietary systems, or fragmented by region (Germany, US states)
- **Prioritize**: Countries with public open data + mandatory disclosure laws = most data available

### Solar Data (Global)
- PVGIS works for all of Europe, Africa, and parts of Asia — use it as primary
- PVWatts (NREL) covers the Americas — use as fallback
- Both are free, no API key needed
- Always pass: latitude, longitude, peak power (estimate from roof area), system loss (14% default)

### Pricing Data
- Eurostat publishes residential energy prices for all EU countries (updated biannually)
- Use as fallback when country-specific API doesn't exist
- URL: `https://ec.europa.eu/eurostat/databrowser/view/nrg_pc_204/default/table`
- For non-EU: IEA or national statistics offices

### Grant Programs
- EU countries often have both national AND EU-funded programs
- Programs change frequently — include a "last_verified" date
- Link to official application portals, not news articles
- Common pattern: income-based eligibility + property rating threshold (e.g., "D or below")

## Research Methodology

1. **Official Government Sources**: Start with government energy ministry websites
2. **Energy Agency Websites**: National energy agencies, EU energy agencies
3. **Public Databases**: Open data portals, statistical offices
4. **Industry Associations**: Construction, energy efficiency organizations
5. **Academic/Research Sources**: University research on building energy efficiency
6. **Cross-reference**: Verify information across multiple sources

## Quality Assurance

- Ensure all URLs are accessible and current
- Verify pricing data is recent (within last 12 months)
- Confirm legal requirements are up-to-date
- Test postcode regex against known examples
- Include source citations where possible in comments

## Completion Criteria

- All required fields completed
- JSON is valid and parseable
- Data is accurate and current
- Sufficient detail for adapter implementation
- Ready for direct use in code generation