# 20-MVP_CHECKLIST.md: Implementation Roadmap

## 1. Project Initialization [ ]
- [ ] Initialize `frontend` (Vite/React/Tailwind).
- [ ] Initialize `backend` (FastAPI/Python).
- [ ] Setup `sqlite` database structure.
- [ ] Dockerize backend for Fly.io.

## 2. Data Acquisition [ ]
- [ ] Seed HSN Directory (Chapter 01-98).
- [ ] Seed RoDTEP/Drawback rates (2024-25 data).
- [ ] Map certification rules to HSN Chapters.

## 3. Backend Implementation [ ]
- [ ] HSN Search API (SQLite full-text search).
- [ ] Incentive Lookup API.
- [ ] Compliance Rule Engine (Rule-based).
- [ ] Country Risk API.

## 4. Frontend Implementation [ ]
- [ ] Hero Section & Search Bar.
- [ ] HSN Intelligence Dashboard.
- [ ] Compliance Checklist View.
- [ ] Export Benefit Estimator.

## 5. Deployment [ ]
- [ ] Create Fly.io project for Backend.
- [ ] Setup Persistent Volume for SQLite.
- [ ] Deploy Frontend to Vercel/Netlify.
- [ ] Domain & SSL setup (Default subdomains).
