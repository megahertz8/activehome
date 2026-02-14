# Roadmap

## Phase 1: Foundation (Q4 2024) ✅
**Status**: In Progress

### Completed
- ✅ Next.js app setup with TypeScript
- ✅ Supabase integration (auth, database, storage)
- ✅ UK EPC adapter with local SQLite database
- ✅ Basic energy assessment UI
- ✅ Postcode search and certificate lookup
- ✅ Solar potential integration (PVGIS)
- ✅ Grant matching (UK schemes)
- ✅ Contractor affiliate links

### Current Sprint
- 🔄 Multi-country adapter architecture
- 🔄 France DPE data import
- 🔄 Mobile app development (Expo)
- 🔄 AI recommendation engine

## Phase 2: Expansion (Q1-Q2 2025)
**Theme**: Global Scale & AI Enhancement

### Federated Learning Integration
**Timeline**: 2-4 weeks
**Dependencies**: Security baseline complete, core ML infrastructure ready

**Milestones**:
- **Week 1-2**: Core FL algorithm implementation
  - Federated averaging in TensorFlow.js
  - Differential privacy for model updates
  - Encrypted communication protocols
- **Week 3**: Data export strategy
  - Privacy-first sync implementation
  - Anonymized profile/aggregate exports
  - Opt-in consent flow for FL participation
- **Week 4**: Cloud infrastructure setup
  - Regional aggregation servers on GCP Cloud Run
  - Cloudflare Workers for edge processing
  - Per-scan server spin-up optimization

**Constraints**:
- Battery impact mitigation (background processing only)
- Gamification to encourage participation (energy savings badges)
- GDPR compliance for EU users (opt-in required)
- Cross-platform compatibility (iOS Core ML, Web TF.js)

### Other Phase 2 Features
- 🔄 Complete France support (DPE import, EDF pricing)
- 🔄 Advanced AI recommendations (ML-based prioritization)
- 🔄 Mobile scanning (room photos → energy estimates)
- 🔄 User dashboard with renovation tracking
- 🔄 Offline mode for EPC data

## Phase 2.5: Data Integration Sprint (Feb 2026) ✅
**Status**: In Progress

### Completed (Feb 14, 2026)
- ✅ **28 Data Sources Identified**: Research/academic, government, industry, open datasets catalogued in quality-data-sources.md
- ✅ **Cross-Reference Analysis**: Mapped new sources against existing research (15 net new sources, 40% new knowledge)
- ✅ **TABULA/EPISCOPE Integration**: Downloaded building typologies for 20+ EU countries (critical for modeling without individual building data)
- ✅ **Energy Score Engine**: 0-100 scale spec'd with component scoring (insulation, heating, solar, water, envelope)
- ✅ **Video Discovery Pipeline**: Processed 406/421 Passivhaus/retrofit videos with insights extraction
- ✅ **Leagues System**: Code complete (Foundation → Vanguard tiers based on Energy Score + action completion)

### Data Sources by Category
**Research/Academic**: Passivhaus Institute, IEA, BRE Trust, AECB, CSIRO, LBNL  
**Government**: DOE US, EU Building Stock Observatory, UK DESNZ, EPC API, NatHERS AU, ADEME FR, RVO NL  
**Industry**: NREL, Energy Saving Trust, MCS Installer Data, Fraunhofer ISE  
**Open Datasets**: OpenEPC, TABULA/EPISCOPE (EU building typologies)  
**Standards**: SAP/RdSAP methodology docs, NatHERS protocols  

### Next Integration Phase
- 🔄 EU/US adapter builds (TABULA typology integration, ResStock for US)
- 🔄 Energy Score engine implementation (backend + UI)
- 🔄 Discovery pipeline deployment (video → data source ingestion)
- 🔄 Regional landing pages (FR, NL live; US in dev)

## Phase 3: Scale (2026)
**Theme**: Monetization & Enterprise

### Key Features
- 🔄 Contractor marketplace (verified professionals)
- 🔄 Enterprise analytics (anonymized aggregate insights)
- 🔄 API for third-party integrations
- 🔄 Advanced ML models (predictive renovation ROI)
- 🔄 Multi-language support (i18n)

### Business Model
- **Freemium**: Basic assessments free, premium recommendations
- **Affiliate Revenue**: Contractor referrals
- **Enterprise**: Bulk assessments for housing associations
- **Grants**: White-label for government programs

## Technical Debt & Maintenance
- 🔄 Database optimization (query performance)
- 🔄 Test coverage (aim for 80%+)
- 🔄 Documentation updates
- 🔄 Security audits (quarterly)

## Research & Development
- 🔄 New country adapters (Germany, Netherlands, US)
- 🔄 Advanced ML features (computer vision for damage detection)
- 🔄 IoT integration (smart meter data)
- 🔄 Carbon footprint calculations

## Success Metrics
- **User Growth**: 10K active users by EOY 2025
- **Engagement**: 70% scan-to-recommendation conversion
- **Accuracy**: 90%+ recommendation accuracy (user validated)
- **Global Reach**: Support for 5+ countries by 2026

## Risk Mitigation
- **Technical Risks**: Regular security audits, automated testing
- **Market Risks**: User feedback loops, A/B testing for features
- **Regulatory**: GDPR compliance monitoring, legal review for new countries
- **Competition**: Focus on privacy differentiation and open-source community