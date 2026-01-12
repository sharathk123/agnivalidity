# EXIM Insight India – Validation MVP

This is a rule-based validation MVP for directional trade advisory.

## Product Intent
The sole purpose of this project is to validate whether exporters find value in structured trade insights and are willing to pay for reports. It is intentionally simple and avoids visual polish or advanced engineering.

## Functional Scope
- **Input**: HS Code (2-6 digit) and Destination Country (ISO code).
- **Output**:
  - Demand level and Trend
  - Price band (Indicative)
  - Certification checklist
  - Risk score and Level
  - Recommendation and Plain-English rationale
  - Downloadable PDF report

## Tech Stack
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLite.
- **Frontend**: React, Plain UI (No animations).

## Constraints
- No AI/LLM components.
- No Authentication/Payments in MVP.
- No visual polish.
- Rule-based logic only.

## Authority
All development is governed by the `MASTER_PRODUCT_CONTRACT.md` file.
