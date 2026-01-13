# 20-MVP_CHECKLIST.md: Implementation Roadmap

## 1. Project Initialization [ ]
- [ ] Initialize `frontend` (Vite/React/Tailwind).
- [ ] Initialize `backend` (FastAPI/Python).
- [ ] Setup `sqlite` database structure.
- [ ] Dockerize backend for Fly.io.

## 2. Data Acquisition [ ]
- [ ] Seed HSN Directory (Chapter 01-98).
- [ ] Seed Market Demand & Price patterns.
- [ ] Map certification rules to HS Codes/Chapters.

## 3. Backend Implementation [ ]
- [ ] HSN Search API (SQLite full-text search).
- [ ] Market Intelligence API (Demand/Price).
- [ ] Compliance Checklist API (Rule-based).
- [ ] Country Risk & Advisory API.

## 4. Frontend Implementation [ ]
- [ ] Hero Section & Search Bar.
- [ ] HS Intelligence Dashboard.
- [ ] Compliance Checklist View.
- [ ] Market Demand & Price Cards.

## 5. Deployment [ ]
- [ ] Create Fly.io project for Backend.
- [ ] Setup Persistent Volume for SQLite.
- [ ] Deploy Frontend to Vercel/Netlify.
- [ ] Domain & SSL setup (Default subdomains).
