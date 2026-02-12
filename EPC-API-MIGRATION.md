# EPC API Migration Documentation

## Overview

This migration replaces the 7.4GB local SQLite database with a live query system using the UK Government's EPC Open Data API, with results cached in Supabase. This allows the app to deploy to Vercel/production without size limits.

## Changes Made

### 1. New API Client (`src/lib/epc-api.ts`)
- Implements search by postcode and UPRN
- Fetches full certificate data by LMK key
- Includes rate limiting (100ms between requests) and retry logic (up to 3 retries for 429/5xx errors)
- Authentication uses `EPC_API_EMAIL` and `EPC_API_KEY` environment variables

### 2. Updated API Route (`src/app/api/epc/route.ts`)
- Now checks Supabase cache first (30-day TTL)
- Falls back to live API queries if not cached
- Caches successful API responses in Supabase
- Maintains compatibility with existing frontend expectations
- Keeps local SQLite as final fallback

### 3. Supabase Cache Table (`supabase-epc-cache-migration.sql`)
- Stores full EPC certificate data
- Indexed by postcode, address, and cached_at
- Includes cleanup function for expired entries (30 days)

## API Details

### EPC Open Data API
- **Base URL**: https://epc.opendatacommunities.org/api/v1
- **Authentication**: HTTP Basic Auth with email:api-key (Base64 encoded)
- **Rate Limits**: No explicit limits documented, but page size max 5000, unlimited pagination with search-after
- **Endpoints**:
  - `/domestic/search`: Search certificates (by postcode, UPRN, etc.)
  - `/domestic/certificate/{lmk}`: Get full certificate by LMK key

### Environment Variables Required
```
EPC_API_EMAIL=your-registered-email@example.com
EPC_API_KEY=your-api-key-from-epc-site
NEXT_PUBLIC_SUPABASE_URL=https://exrnpqwdnwlzsumaubci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Setup Instructions

1. **Register for EPC API Access**:
   - Visit https://epc.opendatacommunities.org/
   - Create account and get API key
   - Set `EPC_API_EMAIL` and `EPC_API_KEY` in environment

2. **Run Supabase Migration**:
   - Go to Supabase dashboard (https://exrnpqwdnwlzsumaubci.supabase.co)
   - Open SQL Editor
   - Run the contents of `supabase-epc-cache-migration.sql`

3. **Deploy**:
   - The app will now work without the local SQLite file
   - First requests will be slower (API calls), subsequent cached
   - Local DB remains as fallback if API fails

## Data Model Compatibility

The API returns data in the same `EPCRecord` format as the local DB, ensuring drop-in replacement.

## Error Handling

- API down: Gracefully returns 500 error without crashing
- Rate limited: Retries with exponential backoff
- Invalid data: Falls back to local DB if available

## Performance

- Cached responses: ~10-100ms
- API calls: ~500-2000ms (plus network)
- Cache TTL: 30 days (configurable in SQL)

## Future Improvements

- Implement neighborhood stats from Supabase cache
- Add UPRN lookup if available in frontend
- Background cache warming for popular postcodes