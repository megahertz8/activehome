# Architecture Overview

## System Architecture

Evolving Home follows a hybrid architecture balancing on-device computation for privacy with cloud aggregation for global model improvement.

### App vs. Cloud Split

```
┌─────────────────┐    ┌─────────────────┐
│     Mobile App  │    │   Web App       │
│  (React Native) │    │  (Next.js)      │
├─────────────────┤    ├─────────────────┤
│ • UI/UX         │    │ • UI/UX         │
│ • Camera Scan   │    │ • Camera Scan   │
│ • Local ML      │    │ • TF.js ML      │
│ • Offline Data  │    │ • Service Worker│
│ • FL Training   │    │ • FL Training   │
└─────────────────┘    └─────────────────┘
         │                       │
         └─────────┬─────────────┘
                   │
         ┌─────────────────┐
         │   Cloud Layer   │
         │ (Supabase/GCP)  │
         ├─────────────────┤
         │ • Auth          │
         │ • Data Sync     │
         │ • FL Aggregation│
         │ • API Services  │
         └─────────────────┘
```

**App Responsibilities**:
- User interface and experience
- Camera-based room scanning
- Local ML inference (energy assessment)
- Federated learning training (privacy-preserving)
- Offline data storage and sync

**Cloud Responsibilities**:
- User authentication and authorization
- Centralized data storage (anonymized aggregates)
- Federated learning model aggregation
- Third-party API integrations (EPC, solar, grants)
- Global model distribution

## Federated Learning Flow

Evolving Home implements federated learning to improve AI models without compromising user privacy:

### FL Data Points
- Building characteristics (age, construction type, insulation)
- Energy consumption patterns (seasonal variations, heating efficiency)
- Scan aggregates (room dimensions, material estimates)
- User feedback loops (recommendation accuracy ratings)
- Renovation outcomes (actual energy savings achieved)

### Training Flow

```
User Device                    Regional Server              Global Server
    │                               │                           │
    │ 1. Local Training             │                           │
    │    - Train on scan data       │                           │
    │    - Differential privacy     │                           │
    │    - Generate model update    │                           │
    │                               │                           │
    ├───2. Encrypted Update────────►│                           │
    │                               │                           │
    │                               │ 3. Regional Aggregation   │
    │                               │    - Collect updates      │
    │                               │    - Federated averaging  │
    │                               │    - Validate compliance  │
    │                               │                           │
    │                               │────────4. Global Update─►│
    │                               │                           │
    │                               │                           │ 5. Model Distribution
    │                               │◄─────────────6. New Model─┤
    │                               │                           │
    ◄───7. Model Update─────────────┼───────────────────────────┘
```

### Step Details

1. **Local Training**: On-device ML training using TensorFlow.js (web) or Core ML (iOS)
2. **Encrypted Updates**: Model gradients encrypted and sent to regional server
3. **Regional Aggregation**: GCP Cloud Run instances aggregate updates from users in same region
4. **Global Update**: Aggregated updates sent to central model server for global averaging
5. **Model Distribution**: Improved global model distributed back to regional servers
6. **Device Update**: Users receive model updates during sync operations
7. **Privacy Safeguards**: Differential privacy adds noise to prevent individual identification

### Per-Scan Server Spin-Up

For efficiency and cost optimization, heavy computations use ephemeral cloud instances:

```
Scan Upload ──► Cloudflare Worker ──► GCP Cloud Run (Spin-up)
                                      ├─ ML Processing
                                      ├─ Energy Calculations
                                      └─ Result Caching
                                               │
                                               ▼
                                    Results ──► User Device
```

**Benefits**:
- Cost-effective (pay per scan, not per user)
- Scalable (auto-scaling based on load)
- Secure (ephemeral instances, no persistent data)
- Fast (edge proximity for low latency)

## Data Export Strategy

### Privacy-First Sync
- **Anonymized Profiles**: Building data stripped of personal identifiers
- **Aggregates Only**: Statistical summaries, not individual records
- **Opt-in Hashes**: Cryptographic hashes for duplicate detection (user consent required)
- **Encrypted Transmission**: End-to-end encryption for all data transfers

### Safeguards
- **Encryption**: AES-256 for data at rest and transit
- **Consent Management**: Granular opt-in for FL participation
- **Anonymization**: K-anonymity for aggregate data (minimum group sizes)
- **Audit Logging**: All data exports logged for compliance
- **Data Minimization**: Only necessary fields exported, retention limits

### Cloud Infrastructure

#### Providers
- **Cloudflare Workers**: Edge computing for global distribution and per-scan processing
  - Free tier for development/low traffic
  - Global edge network for low latency
  - Durable Objects for state management

- **GCP Cloud Run**: Serverless containers for regional FL aggregation
  - Auto-scaling based on FL update volume
  - Regional data residency for compliance
  - Cost optimization through usage-based pricing

#### Cost Optimization
- **Per-Scan Billing**: Only charge for actual processing, not storage
- **Regional Caching**: Reduce redundant computations
- **Ephemeral Servers**: No idle resource costs
- **Edge Processing**: Minimize data transfer to centralized servers

#### Security
- **JWT Authentication**: Secure API access with short-lived tokens
- **Regional Isolation**: Data stays within user region where possible
- **Zero-Trust**: Every request authenticated and authorized
- **Encryption**: All data encrypted in transit and at rest

## Component Architecture

### Frontend Components
```
src/
├── app/                    # Next.js app router
├── components/             # Reusable UI components
│   ├── ui/                # Base UI (Radix)
│   ├── forms/             # Form components
│   └── charts/            # Data visualization
├── lib/
│   ├── adapters/          # Country adapters
│   ├── ml/               # ML utilities
│   └── fl/               # FL client code
└── hooks/                 # Custom React hooks
```

### Backend Services
```
supabase/
├── functions/             # Edge functions
├── migrations/            # DB schema
└── config/               # Configuration

api/
├── epc/                  # Energy certificate API
├── solar/                # Solar potential API
├── grants/               # Grant matching API
└── fl/                   # FL aggregation API
```

### Mobile Architecture
```
mobile/
├── components/           # Shared components
├── screens/              # App screens
├── services/             # API services
├── ml/                   # On-device ML
└── fl/                   # FL training
```

## Security Considerations

- **Privacy by Design**: Minimize data collection, maximize local processing
- **GDPR Compliance**: Right to erasure, data portability, consent management
- **Encryption**: End-to-end for sensitive operations
- **Access Control**: Role-based permissions, API rate limiting
- **Audit Trails**: Comprehensive logging for security events

## Scalability

- **Horizontal Scaling**: Stateless services, database read replicas
- **Global CDN**: Cloudflare for static assets and API caching
- **Edge Computing**: Regional processing reduces central load
- **Caching Strategy**: Multi-layer caching (browser, CDN, database)
- **Monitoring**: Real-time metrics and alerting for performance issues