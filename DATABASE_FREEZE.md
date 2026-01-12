## DATABASE FREEZE (NON-NEGOTIABLE)

The database schema is FINAL and already implemented.

Source of truth:
- DATABASE_SCHEMA.md
- Existing SQLite tables in the repository

Rules:
- NO new tables may be added
- NO columns may be added
- NO columns may be removed or renamed
- NO schema refactors are allowed

Agents may:
- Read from tables
- Write seed data
- Write queries
- Write joins

Agents may NOT:
- Propose schema changes
- Auto-migrate schema
- “Improve” normalization
- Add audit/log/metadata tables

If any schema change is required,
it must be approved explicitly by the product owner.
