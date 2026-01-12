# 40-AGENT_RULES.md: Standard Operating Procedures

## 1. Zero-Cost Policy
- NEVER suggest or use a paid API (e.g., OpenAI, Serper, Pinecone) without explicit confirmation.
- Use local models (if needed) or rule-based logic.
- Prefer SQLite/JSON files for storage.

## 2. Design Aesthetics
- All frontend components must use a "Glassmorphism" or "Modern FinTech" look.
- Use HSL-based color palettes (Deep Blues, Emerald Greens, Subtle Grays).
- Micro-animations for all interactive elements.

## 3. Code Standards
- **Backend**: Type-hinting required for all FastAPI endpoints. Pydantic models for request/response validation.
- **Frontend**: Component-based architecture. Use `shadcn` inspired patterns without the bloat.
- **Data**: All data seeding scripts must be idempotent.

## 4. Documentation
- Every new API must be added to `50-API_CONTRACTS.md`.
- All logic changes must be reflected in `30-ARCHITECTURE.md`.

## 5. Database Schema Enforcement
- Agents MUST implement database tables EXACTLY as defined in `docs/DATABASE_SCHEMA.md`.
- No additional tables or columns are allowed.
