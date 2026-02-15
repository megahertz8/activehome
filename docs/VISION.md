# Evolving Home — Product Vision

**The climate changes. So should your home.**

---

## The Problem

Home energy efficiency is treated as a one-time event. Get an EPC. Maybe insulate the loft. Done.

But homes aren't static. Energy prices fluctuate daily. New technologies emerge every year. Government grants come and go. Your neighbourhood changes. The climate itself is shifting.

29 million UK homes are responsible for 21% of the country's carbon emissions. 80% are rated EPC D or below. The tools that exist today give you a snapshot — a diagnosis with no follow-up. That's like going to the doctor once and never returning.

## The Thesis

**Your home should never stop evolving.**

Evolving Home is a living energy companion that grows with your home. Not a one-time calculator. Not a static report. A continuous, intelligent relationship between you and your home's energy performance.

We don't just tell you what's wrong. We tell you what changed since last time — and what to do next.

## How It Works

### The Living Score (0-100)
Every home gets a dynamic energy score. Not a static EPC (which is a snapshot from whenever your last assessment was). A living score that updates as:

- **Energy prices change** → your ROI calculations shift
- **New grants launch** → measures you couldn't afford become free
- **Technology improves** → heat pump efficiency goes up, costs come down
- **You make improvements** → your score rises, your ranking changes
- **Seasons change** → winter prep alerts, summer solar opportunity windows

### The Data Flywheel
This is the engine. Every home that uses Evolving Home feeds anonymised data back into the system:

- What improvements they made
- What it actually cost (not estimates — real invoices)
- What savings they measured (smart meter verified)
- What worked, what didn't

This data makes recommendations better for every OTHER home. A Victorian terrace in Bristol that installed external wall insulation last month teaches us something useful for every Victorian terrace in the country.

**Federated Learning** makes this possible at scale without compromising privacy:
- Models train on local data, only aggregated learnings are shared
- No raw data leaves the device
- Every home contributes to collective intelligence
- Regional patterns emerge automatically (damp in the West Country, wind exposure in Scotland, solar gain in the South East)

The more homes evolve, the smarter the system gets. The smarter the system gets, the more homes evolve. This flywheel is the moat.

### Energy Leagues
Your home competes against similar homes:

- **Street League** → your ranking on your street
- **Type League** → how you compare to other Victorian terraces / 1960s semis / new builds
- **Area League** → your postcode district ranking
- **National League** → top percentile across the UK

Tiers: Foundation → Bronze → Silver → Gold → Platinum → Vanguard

Improvement triggers notifications. Neighbours improving triggers motivation. Seasonal challenges ("Winter Ready Challenge: insulate before October, earn Gold") drive engagement.

This isn't gamification bolted on. It's the mechanic that makes people come back. People don't check their EPC twice. They check their ranking weekly.

### The Notification Engine
The relationship stays alive through intelligent, timely nudges:

- "🔔 New BUS grant launched — you're eligible for £7,500 off a heat pump"
- "📉 Heat pump prices dropped 12% since you last checked. Your payback is now 4.2 years"
- "🏘️ 3 homes on your street improved this month. You dropped to #8"
- "🌡️ October forecast: heating bill spike incoming. Here's your 3-step prep plan"
- "🆕 New insulation material just hit the UK market — here's what it means for your home"
- "📊 Your smart meter data shows 15% more usage than predicted. Possible draught issue?"

### Smart Meter Integration
The bridge between estimates and reality:

1. **Connect** → user links smart meter via n3rgy/DCC
2. **Baseline** → we establish actual consumption patterns
3. **Improve** → user makes a change (e.g., installs insulation)
4. **Verify** → we measure real savings, not theoretical
5. **Learn** → verified data feeds back into the model for everyone

This creates the most accurate energy model in the market. EPC estimates are based on SAP assumptions from the 1990s. We use real data from real homes in real time.

## The Competitive Landscape

| | Snugg | EPC Register | TheEcoExperts | **Evolving Home** |
|---|---|---|---|---|
| Initial assessment | ✅ | ✅ | ✅ | ✅ |
| Grant matching | ✅ | ❌ | Partial | ✅ Auto-applied |
| Live energy prices | ❌ | ❌ | ❌ | ✅ Octopus API |
| Solar potential | ❌ | ❌ | Basic | ✅ PVGIS by postcode |
| Fabric-first logic | ❌ | ❌ | ❌ | ✅ |
| Ongoing relationship | ❌ | ❌ | ❌ | ✅ |
| Smart meter verified | Planned | ❌ | ❌ | ✅ |
| Community/leagues | ❌ | ❌ | ❌ | ✅ |
| Federated learning | ❌ | ❌ | ❌ | ✅ |
| Open scoring engine | ❌ | ❌ | ❌ | Planned |

**Snugg's strength** is distribution (TSB, EDF, banks). Their weakness is they built a one-time tool, not a relationship. Banks want to check a box ("we offer green advice"). We want to change behaviour.

## Business Model

### Consumer (Free → Premium)
- **Free**: Living score, basic recommendations, street ranking
- **Premium (£4.99/mo or £39.99/yr)**: Detailed reports, full league access, smart meter tracking, priority grant alerts, contractor quotes, PDF exports

### B2B API
- Mortgage lenders embed our score in affordability checks
- Estate agents show energy potential alongside listings
- Insurers use our data for climate risk assessment
- Local authorities track retrofit progress at scale

### Affiliate / Lead Gen
- Installer matching (£20-50 per qualified lead)
- Energy tariff switching (Octopus referral programme)
- Green finance products (green mortgage referrals)

### Data Insights (Anonymised)
- Aggregated retrofit trends for policy makers
- Regional energy performance benchmarks
- Technology adoption curves for manufacturers

## Technology Stack

- **Frontend**: Next.js (web), React Native (app planned)
- **Backend**: Supabase (auth, DB, realtime)
- **Data Sources**: UK EPC API (10M+ certs), Octopus Energy (live tariffs), PVGIS (solar), OSM (building geometry), SAP/OpenBEM (energy calc)
- **ML Pipeline**: Federated learning framework (device-local training, aggregated model updates)
- **Scoring Engine**: OpenBEM-based with proprietary enhancements (fabric-first, multi-ECM, grant-aware)

## Go-to-Market

### Phase 1: UK Foundation (Now → Q2 2026)
- Nail the living score + shareable score cards
- SEO city pages (programmatic, 500+ pages)
- "What's my EPC?" viral tool
- Energy Leagues MVP
- Smart meter integration

### Phase 2: Community (Q2-Q3 2026)
- App launch (iOS + Android)
- Push notifications
- Neighbourhood maps
- Before/after improvement gallery
- Referral programme ("invite a neighbour")

### Phase 3: Flywheel (Q3-Q4 2026)
- Federated learning pipeline live
- Real-cost database (verified by users)
- Open API for partners
- B2B pilot with one bank/utility

### Phase 4: International (2027)
- Regional adapters (US/IRA, FR/MaPrimeRénov, NL/ISDE, AU/STCs)
- One platform, localised scoring, regional grants
- Multi-language support

## The Vision

In 5 years, "What's your Evolving Home score?" should be as natural as "What's your credit score?"

Every home improvement, every new technology, every policy change makes the score more accurate and the recommendations more relevant. The climate changes. So should your home.

---

*"A home is never finished. It's always evolving."*
