-- schema_intelligence.sql
-- EXIM Insight India – Market Intelligence Schema

-- Core Tables Reference (Assumed existing or created here)
CREATE TABLE IF NOT EXISTS hs_code (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hs_code TEXT UNIQUE NOT NULL,
    description TEXT,
    regulatory_sensitivity TEXT DEFAULT 'LOW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS country (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iso_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- Intelligence Tables
CREATE TABLE IF NOT EXISTS market_demand (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hs_code_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    demand_level TEXT CHECK(demand_level IN ('HIGH', 'MEDIUM', 'LOW')),
    trend TEXT CHECK(trend IN ('UP', 'DOWN', 'STABLE')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
    FOREIGN KEY (country_id) REFERENCES country(id),
    UNIQUE(hs_code_id, country_id)
);

CREATE TABLE IF NOT EXISTS price_band (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hs_code_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    volatility_level TEXT CHECK(volatility_level IN ('LOW', 'MEDIUM', 'HIGH')),
    avg_price REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
    FOREIGN KEY (country_id) REFERENCES country(id),
    UNIQUE(hs_code_id, country_id)
);

CREATE TABLE IF NOT EXISTS risk_score_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hs_code_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    total_score INTEGER DEFAULT 0, -- Penalty Score
    risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
    FOREIGN KEY (country_id) REFERENCES country(id),
    UNIQUE(hs_code_id, country_id)
);

CREATE TABLE IF NOT EXISTS recommendation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hs_code_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    recommendation TEXT CHECK(recommendation IN ('GO', 'CAUTION', 'AVOID', 'PENDING')) DEFAULT 'PENDING',
    rationale TEXT,
    calculated_at DATETIME,
    FOREIGN KEY (hs_code_id) REFERENCES hs_code(id),
    FOREIGN KEY (country_id) REFERENCES country(id),
    UNIQUE(hs_code_id, country_id)
);
