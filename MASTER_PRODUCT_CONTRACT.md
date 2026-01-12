## EXIM Insight India – Validation MVP

This document is the **highest authority** in this repository.

If any other document, code, or agent output conflicts with this file,
**THIS FILE WINS**.

---

## 1. PRODUCT INTENT (NON-NEGOTIABLE)

This project is a **VALIDATION MVP**, not a finished product.

The sole purpose is to validate:
- Whether exporters / consultants find value
- Whether they are willing to PAY for insights
- Whether the problem definition is correct

This project is NOT intended to:
- Impress visually
- Demonstrate engineering excellence
- Be production-ready
- Be scalable
- Be AI-powered (yet)

---

## 2. SUCCESS CRITERIA (ONLY THESE)

The MVP is considered successful ONLY IF:
- A user can select 1 HS Code + 1 Country
- The system returns:
  - Demand summary
  - Price band
  - Certification checklist
  - Risk score
  - Recommendation
- A PDF report can be generated
- At least one user is willing to pay for that report

NO other success definition is valid.

---

## 3. APPROVED TECH STACK (LOCKED)

### Backend
- Language: **Python 3.11+**
- Framework: **FastAPI**
- Server: Uvicorn
- ORM: SQLAlchemy or SQLModel (basic usage only)
- API style: REST
- Versioning: `/api/v1`

### Database
- **SQLite ONLY**
- File-based
- Local-first
- Production uses mounted volume (Fly.io / Render)

### Frontend
- React or Next.js
- Plain UI
- No animations
- No design systems
- No visual polish focus

### Hosting (FREE ONLY)
- Backend: Fly.io OR Render (free tier)
- Frontend: Vercel (free tier)

NO PAID SERVICES ALLOWED.

---

## 4. DATA RULES (STRICT)

Allowed:
- Indian government trade data
- Public global trade datasets
- Manually curated sample data

Forbidden:
- Paid APIs
- Scraping private platforms
- Buyer/seller contact data
- Real-time feeds

Data refresh can be manual.

---

## 5. MVP FUNCTIONAL SCOPE (HARD BOUNDARY)

### INPUT
- HS Code (2–6 digit)
- Destination Country (ISO code)

### OUTPUT (MUST ALL EXIST)
- Demand level (LOW / MEDIUM / HIGH)
- Trend (UP / FLAT / DOWN)
- Price band (Min / Avg / Max)
- Certification checklist
- Risk score (0–100)
- Risk level (LOW / MEDIUM / HIGH)
- Recommendation (GO / CAUTION / AVOID)
- Plain-English rationale
- Downloadable PDF report

If any output is missing, MVP is INCOMPLETE.

---

## 6. EXPLICIT EXCLUSIONS (DO NOT BUILD)

The following MUST NOT exist in code or UI:

- Authentication
- Authorization
- Payments
- AI / LLM calls
- “AI-powered” wording
- Chatbots
- Background jobs
- Schedulers
- Real-time data
- Buyer discovery
- Shipment tracking
- WebSockets
- Notifications

If an agent adds any of these, the change MUST be rejected.

---

## 7. DATABASE AUTHORITY

The database schema defined in `DATABASE_SCHEMA.md` is FINAL.

Rules:
- No additional tables
- No additional columns
- No hidden metadata tables
- No analytics/logging tables

Schema exists ONLY to support MVP outputs.

---

## 8. AGENT BEHAVIOR CONTRACT (CRITICAL)

Any coding agent working on this repo MUST:

### MUST DO
1. Read this file fully before coding
2. Implement ONLY what is explicitly allowed
3. Keep code minimal and boring
4. Use deterministic, rule-based logic
5. Ensure everything runs locally first

### MUST NOT DO
- Declare MVP “complete”, “successful”, or “verified”
- Use marketing language
- Add visual polish
- Suggest future features
- Change tech stack
- Expand scope

### REPORTING FORMAT (MANDATORY)

After each task, agents may ONLY report:
- What was implemented
- What remains unimplemented
- Any blockers

No summaries.  
No self-evaluation.  
No success claims.

---

## 9. LANGUAGE & POSITIONING RULES

Allowed language:
- “Rule-based”
- “Indicative”
- “Directional”
- “Advisory”

Forbidden language:
- “AI-powered”
- “Intelligent engine”
- “High-fidelity”
- “Production-ready”
- “Enterprise-grade”

This applies to:
- Code comments
- UI text
- README files
- Agent summaries

---

## 10. RETROFIT INSTRUCTIONS (IMPORTANT)

If existing code violates this contract:

1. KEEP:
   - SQLite schema
   - Core joins
   - Basic FastAPI routes
   - Seed data

2. REMOVE / SIMPLIFY:
   - Animation libraries
   - “Premium” UI language
   - AI-style phrasing
   - Over-engineered abstractions

3. REWRITE:
   - README to align with this file
   - Agent summaries to factual status only

---

## 11. DECISION AUTHORITY

- Product decisions → HUMAN ONLY
- Scope decisions → THIS FILE
- Implementation → AGENT
- Validation → USERS

Agents do NOT decide when the MVP is “done”.

---

## 12. FINAL RULE

If there is ever doubt:
> **Default to LESS code, LESS UI, LESS intelligence.**

Validation beats sophistication.

---

END OF MASTER PRODUCT CONTRACT
