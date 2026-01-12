# VERTICAL SLICING PLAYBOOK
## EXIM Insight India – MVP

This project MUST be developed using **vertical slicing**.

Vertical slicing means:
- Build one complete user-visible capability at a time
- Each slice goes end-to-end:
  UI → API → Logic → DB → Output
- No horizontal layers (no “all APIs first”, no “all UI first”)

---

## 1. WHY VERTICAL SLICING (NON-NEGOTIABLE)

We use vertical slicing to:
- Validate value early
- Prevent overengineering
- Keep agents focused
- Always have something demo-able

A slice is **DONE only when a user can see and use it**.

---

## 2. WHAT A VERTICAL SLICE IS (DEFINITION)

A vertical slice MUST include:
- One user story
- One API (or small set)
- Minimal UI
- Real DB read (existing schema only)
- Rule-based logic
- Plain-English output

If any of these are missing, the slice is NOT complete.

---

## 3. SLICE RULES (STRICT)

For every slice:

- MUST use existing DB schema (frozen)
- MUST respect MASTER_PRODUCT_CONTRACT.md
- MUST respect UI_UX_CONTRACT.md
- MUST be minimal
- MUST avoid future-proofing

Agents MUST NOT:
- Add shared abstractions “for later”
- Build reusable frameworks
- Touch unrelated code

---

## 4. MVP SLICE LIST (LOCKED ORDER)

Agents MUST follow this order.

### SLICE 1 — HS Search (FOUNDATION)
**User Story**  
> As a user, I want to search HS codes so that I can select the right product.

**Includes**
- Backend: `/api/v1/hs/search`
- DB: `hs_code`
- UI: Search input + results list
- Output: HS code + description

**Definition of Done**
- User types “rice”
- HS codes appear
- No country logic yet

---

### SLICE 2 — Country Selection
**User Story**  
> As a user, I want to select a destination country.

**Includes**
- Backend: `/api/v1/country/list`
- DB: `country`
- UI: Country dropdown
- Output: ISO code + name

**Definition of Done**
- User can select country
- Selection is stored in UI state

---

### SLICE 3 — Market Demand Insight
**User Story**  
> As a user, I want to see demand level and trend for a product in a country.

**Includes**
- Backend: `/api/v1/demand`
- DB: `market_demand`
- UI: Demand card
- Output: Demand level + trend

**Definition of Done**
- HS + Country → Demand shown
- No price, no risk yet

---

### SLICE 4 — Price Band Insight
**User Story**  
> As a user, I want to see price range so I can judge viability.

**Includes**
- Backend: `/api/v1/price`
- DB: `price_band`
- UI: Price card
- Output: Min / Avg / Max

**Definition of Done**
- Price shows correctly
- Uses same HS + Country state

---

### SLICE 5 — Certification Checklist
**User Story**  
> As a user, I want to know mandatory certifications to avoid rejection.

**Includes**
- Backend: `/api/v1/certification`
- DB: `certification`, `certification_requirement`
- UI: Checklist
- Output: Mandatory cert names + notes

**Definition of Done**
- Clear list
- No risk yet

---

### SLICE 6 — Risk Scoring
**User Story**  
> As a user, I want to understand export risk before proceeding.

**Includes**
- Backend: `/api/v1/risk`
- DB: `risk_factor`, `risk_score_summary`
- Logic: Rule-based score
- UI: Risk badge + explanation

**Definition of Done**
- Numeric score
- LOW / MEDIUM / HIGH
- Plain-English reasons

---

### SLICE 7 — Final Recommendation
**User Story**  
> As a user, I want a clear recommendation (GO / CAUTION / AVOID).

**Includes**
- Backend: `/api/v1/recommendation`
- DB: `recommendation`
- UI: Recommendation panel
- Output: Decision + rationale

---

### SLICE 8 — Report Generation (MONETIZATION SLICE)
**User Story**  
> As a user, I want to download a report.

**Includes**
- Backend: `/api/v1/report`
- UI: Download button
- Output: PDF-ready JSON

**Definition of Done**
- One-click download
- Printable structure

---

## 5. DEFINITION OF DONE (GLOBAL)

A slice is DONE only if:

- UI shows real data
- API returns correct response
- DB is queried
- Output matches PRD
- No extra features added

---

## 6. AGENT TASK TEMPLATE (USE THIS)

For EVERY slice, use this exact prompt:

```text
Implement VERTICAL SLICE <number> as defined in VERTICAL_SLICING_PLAYBOOK.md.

Rules:
- Do not touch other slices
- Do not modify DB schema
- Do not add abstractions
- Follow UI_UX_CONTRACT.md
- Follow MASTER_PRODUCT_CONTRACT.md

After completion, report ONLY:
1. What was implemented
2. What remains missing
3. Any blockers
```
