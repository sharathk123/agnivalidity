# IMPLEMENTATION_PLAN.md
## EXIM Insight India — Enterprise SaaS Build Roadmap

================================================================
## Document Authority
================================================================
This is the IMPLEMENTATION ROADMAP for EXIM Insight India.

Precedence order:
1. MASTER_PRODUCT_CONTRACT.md
2. This file
3. Other technical documents

================================================================
## Product Vision
================================================================

**EXIM Insight India** is an enterprise SaaS platform that transforms
publicly available global trade data into explainable, AI-assisted
export intelligence for Indian SME exporters.

**Core Value Proposition:**
- Answer: WHAT to export, WHERE to export, HOW to comply
- Save 2-4 weeks of research per market
- Replace ₹50K-₹2L consultant fees with instant insights
- Provide downloadable reports for stakeholder communication

================================================================
## The 5 Core Modules
================================================================

| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 1 | **Directory Engine** | Maps HS Codes to Descriptions and Sectors | ✅ Core (Frozen) |
| 2 | **Market Intelligence** | Calculates Demand Levels, Price Bands, Trends | ✅ Core (Frozen) |
| 3 | **Compliance Vault** | Stores certifications, authorities, timelines per country | ✅ Core (Frozen) |
| 4 | **Risk Assessment** | Weighted scoring of country + product risk (0-100) | ✅ Core (Frozen) |
| 5 | **AI Advisory Layer** | Translates data into plain-English executive briefings | ✅ AI Extension (v2) |

================================================================
## Current State Assessment
================================================================

### Completed ✅

| Component | Status | Details |
|-----------|--------|---------|
| Database Schema (MVP) | ✅ Done | 11 core tables, frozen |
| Database Schema (AI v2) | ✅ Done | 5 AI extension tables |
| Backend API | ✅ Done | 13 endpoints, all tested |
| Frontend MVP | ✅ Done | React + Vite, functional |
| PDF Generation | ✅ Done | ReportLab integration |
| AI Service Layer | ✅ Done | Caching, logging, prompt governance |
| Prompt Templates | ✅ Done | 7 templates with guardrails |
| Backend Tests | ✅ Done | 9/9 passing |

### Current Data

| Table | Records | Notes |
|-------|---------|-------|
| hs_code | 1 | Basmati Rice only |
| country | 3 | UAE, USA, Germany |
| market_demand | 1 | HS 10063020 → UAE |
| price_band | 1 | HS 10063020 → UAE |
| certifications | 2 | APEDA RCMC, Phytosanitary |
| risk_score_summary | 1 | HS 10063020 → UAE |
| recommendation | 1 | HS 10063020 → UAE |

================================================================
## 3-Phase Roadmap
================================================================

---
## PHASE 1: Data Anchor (Week 1-2)
---

**Goal:** Populate database with 50+ high-volume Indian export items

### Priority 1.1: Expand HS Code Directory
```
Target: 50+ HS codes across 5 sectors
- Agriculture: Basmati Rice, Spices, Turmeric, Tea, Coffee
- Textiles: Cotton T-shirts, Silk Fabrics, Readymade Garments
- Pharma: Generic Drugs, Ayurvedic Products
- Engineering: Auto Parts, Machine Tools
- Chemicals: Dyes, Pigments, Organic Chemicals
```

**Action Items:**
- [ ] Create `seed_hs_codes.sql` with 50 HS codes
- [ ] Include sector classification
- [ ] Include regulatory_sensitivity rating
- [ ] Source: DGFT, APEDA, ITC HS Schedule

### Priority 1.2: Expand Country Coverage
```
Target: 20 countries across regions
- GCC: UAE, Saudi Arabia, Kuwait, Qatar, Oman
- Europe: Germany, UK, France, Netherlands, Italy
- North America: USA, Canada
- Asia: Singapore, Japan, South Korea, Malaysia
- Africa: South Africa, Kenya, Nigeria
- Oceania: Australia
```

**Action Items:**
- [ ] Create `seed_countries.sql` with 20 countries
- [ ] Include region classification
- [ ] Include base_risk_level
- [ ] Source: UN Comtrade, World Bank

### Priority 1.3: Populate Trade Intelligence
```
Target: 200+ market_demand + price_band entries
Rule: Cover top 10 HS codes × top 20 countries
```

**Action Items:**
- [ ] Create `seed_market_data.sql`
- [ ] Source demand data from UN Comtrade export volumes
- [ ] Source price data from FAO, APEDA
- [ ] Include data_source and last_updated columns

### Priority 1.4: Populate Certifications
```
Target: Complete certification matrix
- APEDA RCMC (all agricultural exports)
- FSSAI (food products to specific countries)
- BIS (quality marks for specific HS codes)
- Phytosanitary (plant products)
- Halal (GCC countries)
- USDA Organic (USA organic products)
- EUDR (EU deforestation regulation)
```

**Action Items:**
- [ ] Create `seed_certifications.sql`
- [ ] Map certifications to HS code × country pairs
- [ ] Include avg_time_days and rejection_risk
- [ ] Source: DGFT, FSSAI, APEDA, destination customs

### Deliverable (Week 2):
```
Test: curl /api/v1/insight?hs_code_id=X&country_id=Y
Expected: Returns complete advisory for any combination
```

---
## PHASE 2: Deterministic API (Week 3-4)
---

**Goal:** 100% accuracy on rule-based calculations

### Priority 2.1: Fuzzy HS Code Search
```python
# Current: Simple LIKE query
results = db.query(HSCode).filter(
    HSCode.description.ilike(f"%{q}%")
)

# Target: Fuzzy matching with thefuzz
from thefuzz import fuzz, process
matches = process.extract(query, hs_code_descriptions, limit=10)
```

**Action Items:**
- [ ] Install `thefuzz` library
- [ ] Update `/api/v1/hs/search` endpoint
- [ ] Add fuzzy matching with 70% threshold
- [ ] Handle typos: "Tumeric" → "Turmeric"
- [ ] Add test cases for fuzzy search

### Priority 2.2: Risk Calculation Engine
```
Current: Reading pre-calculated risk_score_summary
Target: Dynamic calculation using risk_factor weights

risk_score = sum(
    factor.weight * factor_score
    for factor in risk_factors
)
```

**Action Items:**
- [ ] Populate risk_factor table with standard factors
- [ ] Implement dynamic risk calculation in `/api/v1/risk`
- [ ] Add risk breakdown to response
- [ ] Test with multiple country profiles

### Priority 2.3: Enhanced PDF Report
```
Current: Basic text layout
Target: Professional enterprise report

Layout:
- Header: Logo, Title, Date
- Executive Summary: GO/CAUTION/AVOID
- Market Analysis: Demand + Price charts
- Compliance Checklist: Table format
- Risk Assessment: Score + Factors
- Footer: Disclaimer, Data Sources
```

**Action Items:**
- [ ] Design PDF template structure
- [ ] Add table formatting for certifications
- [ ] Add data source attribution
- [ ] Add timestamp and disclaimer
- [ ] Test print quality

### Priority 2.4: Country List Endpoint Test
```
Missing: Dedicated test for /api/v1/country/list
```

**Action Items:**
- [ ] Add `test_country_list()` to test_main.py
- [ ] Verify response structure
- [ ] Verify alphabetical ordering

### Deliverable (Week 4):
```
Test: Search for "Tumeric" → Returns "Turmeric" results
Test: PDF download → Professional 2-page report
Test: Risk score → Matches weighted calculation
```

---
## PHASE 3: AI Advisory Layer (Week 5-6)
---

**Goal:** Connect real AI provider to executive briefing

### Priority 3.1: Groq Integration
```python
# Current: Mock AI response
def call_ai_model(prompt, data):
    return f"[Mock: {data}]"

# Target: Real Groq API call
from groq import Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(
    model="llama-3.1-70b-versatile",
    messages=[{"role": "user", "content": prompt}]
)
```

**Action Items:**
- [ ] Get Groq API key (free tier)
- [ ] Create `backend/.env` with GROQ_API_KEY
- [ ] Update `ai_service.py` with real API call
- [ ] Add fallback to HuggingFace if Groq fails
- [ ] Test token counting and cost tracking

### Priority 3.2: Quota Enforcement
```
Rule: Block AI call if quota exceeded
Current: ai_usage_quota table exists
Target: Enforce limits in service layer
```

**Action Items:**
- [ ] Add `check_quota()` function to ai_service
- [ ] Track daily/monthly usage per user_type
- [ ] Return fallback brief if quota exceeded
- [ ] Log quota violations

### Priority 3.3: Frontend Advisory Integration
```
Target: Add "Get AI Brief" button to insight view
Flow: Click → Loading → Display formatted brief
```

**Action Items:**
- [ ] Add button to App.tsx insight section
- [ ] Call `/api/v1/advisory` endpoint
- [ ] Display brief in markdown format
- [ ] Show data sources and timestamp
- [ ] Add print-friendly styling

### Priority 3.4: Cache Optimization
```
Target: Reduce AI costs with aggressive caching
Rule: Same HS + Country = Same explanation for 30 days
```

**Action Items:**
- [ ] Verify cache hit rate in logs
- [ ] Tune TTL based on data freshness
- [ ] Add cache invalidation for data updates

### Deliverable (Week 6):
```
Test: /api/v1/advisory → Returns formatted brief
Test: Same query twice → Second uses cache
Test: User types → AI generates executive-grade text
```

================================================================
## Technical Priorities (First 48 Hours)
================================================================

### Immediate Actions

| Priority | Task | Time | Owner |
|----------|------|------|-------|
| P0 | Add 10 more HS codes to database | 2h | - |
| P0 | Add 5 more countries to database | 1h | - |
| P1 | Implement fuzzy search with thefuzz | 3h | - |
| P1 | Add test_country_list() | 30m | - |
| P2 | Improve PDF layout | 4h | - |
| P2 | Get Groq API key | 30m | - |

### Commands to Run
```bash
# Verify current state
cd backend
pytest test_main.py test_database.py -v

# Check database content
sqlite3 exim_insight.db "SELECT COUNT(*) FROM hs_code;"
sqlite3 exim_insight.db "SELECT COUNT(*) FROM country;"

# Test insight endpoint
curl "http://localhost:8000/api/v1/insight?hs_code_id=1&country_id=1" | jq

# Test advisory endpoint
curl "http://localhost:8000/api/v1/advisory?hs_code_id=1&country_id=1" | jq
```

================================================================
## Success Metrics
================================================================

### Phase 1 Complete When:
- [ ] 50+ HS codes in database
- [ ] 20+ countries in database
- [ ] 200+ market data entries
- [ ] All HS × Country combinations return valid insights

### Phase 2 Complete When:
- [ ] Fuzzy search handles typos correctly
- [ ] PDF report is stakeholder-presentable
- [ ] Risk calculation is dynamic and explainable
- [ ] 100% test coverage maintained

### Phase 3 Complete When:
- [ ] AI generates coherent executive briefs
- [ ] Cache reduces API costs by 80%+
- [ ] Quota system prevents cost overruns
- [ ] Frontend displays AI briefs professionally

================================================================
## Risk Mitigation
================================================================

| Risk | Mitigation |
|------|------------|
| AI hallucination | Strict prompt guardrails, data-only context |
| API cost overrun | Quota enforcement, aggressive caching |
| Data staleness | Include last_updated in all responses |
| Legal liability | Disclaimer on all outputs, "indicative" language |
| Scope creep | Follow vertical slicing, reject out-of-scope requests |

================================================================
## File Structure (Target)
================================================================

```
backend/
├── main.py                    # API endpoints
├── database.py                # ORM models
├── seed.py                    # MVP seed data
├── seed_expanded.py           # Phase 1 expanded data
├── schema_v2.sql              # AI extension schema
├── seed_prompts.sql           # AI prompt templates
├── services/
│   ├── __init__.py
│   ├── ai_service.py          # AI service layer
│   └── risk_service.py        # Dynamic risk calculation
├── test_main.py               # API tests
├── test_database.py           # DB tests
├── test_ai_service.py         # AI service tests
└── test_risk_service.py       # Risk calculation tests

frontend/
├── src/
│   ├── App.tsx                # Main component
│   ├── App.css                # Styles
│   └── components/
│       ├── SearchBar.tsx      # HS code search
│       ├── InsightCard.tsx    # Insight display
│       └── AdvisoryBrief.tsx  # AI brief display
```

================================================================
## Next Action
================================================================

**Start with Phase 1, Priority 1.1:**
Create `seed_expanded.py` with 50 HS codes.

Command to begin:
```bash
cd backend
touch seed_expanded.py
```

================================================================
END OF IMPLEMENTATION_PLAN.md
