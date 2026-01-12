# DATABASE_SCHEMA.md
# EXIM Insight India – MVP (SQLite)

## Purpose of This Schema
This schema supports the MVP only. It enables the platform to answer:
- Demand for a product in a country
- Price range
- Certification requirements
- Risk score & explanation
- Final export recommendation

Anything not listed here MUST NOT be added in MVP.

## Design Principles
- SQLite compatible
- Minimal tables
- Read-heavy
- Explainable (no black box)
- Easy migration later to Postgres
- Zero paid infrastructure

## 1. Reference Tables (FOUNDATION)
### 1.1 hs_code
Stores HS codes and product context.
```sql
CREATE TABLE hs_code (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code TEXT NOT NULL UNIQUE,            -- e.g. '0806'
  description TEXT NOT NULL,               -- Grapes
  sector TEXT,                             -- Agriculture, Engineering
  regulatory_sensitivity TEXT             -- LOW | MEDIUM | HIGH
);
```

### 1.2 country
Stores destination country details.
```sql
CREATE TABLE country (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  iso_code TEXT NOT NULL UNIQUE,           -- AE, US, DE
  name TEXT NOT NULL,                      -- UAE
  region TEXT,                             -- GCC, EU, Africa
  base_risk_level TEXT                    -- LOW | MEDIUM | HIGH
);
```

## 2. Market Intelligence (MVP-Level)
### 2.1 market_demand
Represents simplified demand insight.
```sql
CREATE TABLE market_demand (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  demand_level TEXT NOT NULL,              -- LOW | MEDIUM | HIGH
  trend TEXT NOT NULL,                     -- UP | FLAT | DOWN
  last_updated TEXT,                       -- YYYY-MM

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  UNIQUE (hs_code_id, country_id)
);
```

### 2.2 price_band
Stores historical price ranges (simplified).
```sql
CREATE TABLE price_band (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  min_price REAL,
  avg_price REAL,
  max_price REAL,
  currency TEXT DEFAULT 'USD',
  volatility_level TEXT,                  -- LOW | MEDIUM | HIGH

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  UNIQUE (hs_code_id, country_id)
);
```

## 3. Certification Intelligence (CRITICAL)
### 3.1 certification
Master list of certifications.
```sql
CREATE TABLE certification (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                      -- Phytosanitary Certificate
  issuing_authority TEXT                  -- FSSAI, APEDA, Destination Authority
);
```

### 3.2 certification_requirement
Maps certifications to Product × Country.
```sql
CREATE TABLE certification_requirement (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  certification_id INTEGER NOT NULL,
  mandatory INTEGER NOT NULL,              -- 1 = Yes, 0 = No
  avg_time_days INTEGER,                   -- e.g. 21
  validity_months INTEGER,                 -- e.g. 12
  rejection_risk TEXT,                     -- LOW | MEDIUM | HIGH

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  FOREIGN KEY (certification_id) REFERENCES certification(id)
);
```

### 3.3 certification_notes
Human-readable guidance.
```sql
CREATE TABLE certification_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certification_requirement_id INTEGER NOT NULL,
  note TEXT,                               -- Labeling, packaging notes

  FOREIGN KEY (certification_requirement_id)
    REFERENCES certification_requirement(id)
);
```

## 4. Risk Scoring (Explainable)
### 4.1 risk_factor
Defines scoring dimensions.
```sql
CREATE TABLE risk_factor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                      -- Product, Country, Certification
  weight REAL NOT NULL                    -- e.g. 0.20
);
```

### 4.2 risk_score_detail
Stores dimension-level scores.
```sql
CREATE TABLE risk_score_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  risk_factor_id INTEGER NOT NULL,
  score INTEGER NOT NULL,                  -- 0–100 (dimension level)
  reason TEXT,                             -- Human explanation

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  FOREIGN KEY (risk_factor_id) REFERENCES risk_factor(id)
);
```

### 4.3 risk_score_summary
Stores final computed risk.
```sql
CREATE TABLE risk_score_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  total_score INTEGER NOT NULL,            -- 0–100
  risk_level TEXT NOT NULL,                -- LOW | MEDIUM | HIGH
  last_calculated TEXT,                    -- YYYY-MM-DD

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  UNIQUE (hs_code_id, country_id)
);
```

## 5. Final Recommendation
### 5.1 recommendation
Stores final advice shown to user.
```sql
CREATE TABLE recommendation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_code_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  recommendation TEXT NOT NULL,            -- GO | CAUTION | AVOID
  rationale TEXT NOT NULL,                 -- Plain-English explanation

  FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
  FOREIGN KEY (country_id) REFERENCES country(id),
  UNIQUE (hs_code_id, country_id)
);
```

## 6. Explicit Exclusions (DO NOT ADD)
The following MUST NOT exist in MVP schema:
- User table
- Authentication data
- Payment data
- Buyer/seller data
- Shipment tracking
- Logs or analytics tables
- AI/vector tables

## 7. Indexes (Performance – Optional but Safe)
```sql
CREATE INDEX idx_hs_code ON hs_code(hs_code);
CREATE INDEX idx_country_iso ON country(iso_code);
CREATE INDEX idx_demand_lookup ON market_demand(hs_code_id, country_id);
CREATE INDEX idx_price_lookup ON price_band(hs_code_id, country_id);
```

## 8. Agent Instructions (IMPORTANT)
Agents MUST implement database tables EXACTLY as defined in DATABASE_SCHEMA.md. No additional tables or columns are allowed.
