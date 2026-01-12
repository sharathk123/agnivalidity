# EXIM Insight India – MVP

## Purpose
This repository implements a **zero-cost MVP** for an EXIM Intelligence Portal using:
- Indian government trade data
- Public global trade data
- Rule-based risk & certification intelligence

The MVP is built **local-first** and deployed to **free production services**.

---

## Local → Production Strategy (IMPORTANT)

Development flow:
1. Everything runs locally first
2. Same code is deployed to production
3. Only FREE service providers are used

Production targets:
- Frontend: Vercel (Free)
- Backend: Fly.io (Free)
- Database: SQLite (persistent volume)

---

## What This MVP IS
- A validation MVP
- Read-heavy
- Rule-based
- Explainable
- Zero paid services

## What This MVP IS NOT
- Not a marketplace
- Not real-time
- No AI chat
- No buyer discovery
- No payments
- No auth

---

## Repo Structure

exim-mvp/
├── 00-README.md
├── 10-PRD.md
├── 20-MVP_CHECKLIST.md
├── 30-ARCHITECTURE.md
├── 40-AGENT_RULES.md
├── 50-API_CONTRACTS.md
├── backend/
├── frontend/
├── data/
└── docs/

---

## Agent Usage
Before writing any code, agents MUST read:
- 10-PRD.md
- 20-MVP_CHECKLIST.md
- 30-ARCHITECTURE.md
- 40-AGENT_RULES.md
- 50-API_CONTRACTS.md
