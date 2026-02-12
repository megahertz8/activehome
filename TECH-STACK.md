# Tech Stack

## Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS, Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Icons**: Lucide React

## Backend
- **Runtime**: Node.js (Vercel/Hono)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)

## Mobile
- **iOS**: React Native (Expo)
- **Android**: React Native (Expo)
- **Camera**: Expo Camera for room scanning

## Machine Learning
- **iOS**: Core ML for on-device inference
- **Web**: TensorFlow.js for browser-based ML
- **Android**: ML Kit (planned)
- **Federated Learning**: Custom implementation with federated averaging
- **Privacy**: Differential privacy for model updates
- **Training**: Python (TensorFlow/PyTorch) for centralized model training

## Infrastructure
- **Hosting**: Vercel (frontend), Supabase (backend)
- **Cloud Providers**:
  - **GCP Cloud Run**: Serverless container execution for regional aggregation
  - **Cloudflare Workers**: Edge computing for per-scan processing
- **CDN**: Cloudflare
- **Monitoring**: Vercel Analytics, Supabase logs

## Data Sources
- **UK**: EPC database (local SQLite + API fallback)
- **France**: DPE database (planned)
- **Solar**: PVGIS API (European Commission)
- **Energy Prices**: Octopus Energy (UK), EDF (France)
- **Grants**: Government APIs (BEIS, ADEME)

## Development Tools
- **Language**: TypeScript
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **Version Control**: Git

## Country Adapters
- **Architecture**: Plugin pattern with TypeScript interfaces
- **Supported Countries**: UK (full), France (partial), Global Lite Mode
- **Auto-Detection**: Postcode format + geo-IP fallback

## Security
- **Authentication**: Row Level Security (RLS) in Supabase
- **API**: Rate limiting, input validation
- **Data**: Encryption at rest/transit
- **Privacy**: GDPR/CCPA compliance, data minimization

## Performance
- **Core Web Vitals**: Optimized for fast loading
- **PWA**: Offline capability for basic features
- **Caching**: Supabase caching for EPC data
- **Edge**: Global edge deployment for low latency

## Open-Source Libraries
- **UI**: Radix UI (MIT)
- **Charts**: Recharts (MIT)
- **Maps**: @googlemaps/js-api-loader (Apache 2.0)
- **Database**: Drizzle ORM (Apache 2.0)
- **Auth**: Supabase (MIT/Apache mix)