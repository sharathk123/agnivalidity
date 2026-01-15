-- schema_admin.sql
-- EXIM Insight India – Admin & Ingestion Control Schema
--
-- PURPOSE: Track data sources, ingestion status, and audit logs

-- ================================================================
-- INGESTION SOURCES
-- ================================================================
-- Track every external data source

CREATE TABLE IF NOT EXISTS ingestion_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name TEXT UNIQUE NOT NULL,
    source_type TEXT NOT NULL,          -- 'GOVERNMENT', 'MULTILATERAL', 'REFERENCE'
    base_url TEXT,
    frequency TEXT DEFAULT 'MANUAL',    -- 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL'
    is_active BOOLEAN DEFAULT TRUE,
    dry_run_mode BOOLEAN DEFAULT FALSE,
    throttle_rpm INTEGER DEFAULT 10,    -- Requests per minute
    ingestion_strategy TEXT DEFAULT 'REST_API', -- 'REST_API', 'HTML_PARSER', 'POST_REQUEST_SCRAPER', 'PDF_TO_JSON', 'JSON_SCHEMA_MONITOR'
    last_run_status TEXT,               -- 'SUCCESS', 'FAILED', 'RUNNING', 'IDLE'
    last_run_at DATETIME,
    records_updated INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingestion_sources_active ON ingestion_sources(is_active);
CREATE INDEX idx_ingestion_sources_status ON ingestion_sources(last_run_status);

-- ================================================================
-- INGESTION LOGS
-- ================================================================
-- Audit log for every ingestion task

CREATE TABLE IF NOT EXISTS ingestion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    run_type TEXT DEFAULT 'FULL',       -- 'FULL', 'INCREMENTAL', 'DRY_RUN'
    records_fetched INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    error_summary TEXT,
    schema_drift_detected BOOLEAN DEFAULT FALSE,
    started_at DATETIME,
    finished_at DATETIME,
    duration_seconds INTEGER,
    FOREIGN KEY (source_id) REFERENCES ingestion_sources(id)
);

CREATE INDEX idx_ingestion_logs_source ON ingestion_logs(source_id);
CREATE INDEX idx_ingestion_logs_started ON ingestion_logs(started_at);

-- ================================================================
-- SYSTEM SETTINGS
-- ================================================================
-- Global admin settings including kill switch

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('GLOBAL_KILL_SWITCH', 'OFF', 'Master switch to pause all ingestion workers');

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('DEFAULT_THROTTLE_RPM', '10', 'Default requests per minute for new sources');

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('DRY_RUN_DEFAULT', 'TRUE', 'Default dry run mode for new ingestions');

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('ICEGATE_JSON_VERSION', '1.5', 'Expected ICEGATE JSON schema version (MIG_CIM-Custodian)');

-- ================================================================
-- SEED INGESTION SOURCES (2026 EXIM Ecosystem)
-- ================================================================

-- REFERENCE DATA
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('ISO_COUNTRY_LIST', 'REFERENCE', 'https://restcountries.com/v3.1/all', 'MONTHLY', 'REST_API', 'IDLE');

-- GOVERNMENT: HS CODES & POLICY
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('DGFT_ITCHS_MASTER', 'GOVERNMENT', 'https://www.dgft.gov.in/CP/?opt=itchs', 'MONTHLY', 'HTML_PARSER', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('DGFT_HS_MASTER', 'GOVERNMENT', 'https://dgft.gov.in', 'WEEKLY', 'REST_API', 'IDLE');

-- GOVERNMENT: TRADE STATISTICS (DEMAND & PRICE)
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('COMMERCE_TRADESTAT_ANNUAL', 'GOVERNMENT', 'https://tradestat.commerce.gov.in/', 'MONTHLY', 'POST_REQUEST_SCRAPER', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('COMMERCE_TRADESTAT_MONTHLY', 'GOVERNMENT', 'https://tradestat.commerce.gov.in/meidb/', 'DAILY', 'POST_REQUEST_SCRAPER', 'IDLE');

-- GOVERNMENT: COMPLIANCE & PORT MASTERS
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('DGFT_APPLICATION_MASTER', 'GOVERNMENT', 'https://www.dgft.gov.in/CP/?opt=application-master-data', 'WEEKLY', 'HTML_PARSER', 'IDLE');

-- GOVERNMENT: ICEGATE JSON SCHEMAS (2026 PIVOT - Live Jan 31, 2026)
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('ICEGATE_JSON_ADVISORY', 'GOVERNMENT', 'https://www.icegate.gov.in/guidelines/advisory-for-BE-SB-filing-using-JSON-based-schema', 'WEEKLY', 'JSON_SCHEMA_MONITOR', 'IDLE');

-- GOVERNMENT: SOURCING & ODOP
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('INVEST_INDIA_ODOP', 'GOVERNMENT', 'https://www.investindia.gov.in/one-district-one-product', 'MONTHLY', 'PDF_TO_JSON', 'IDLE');

-- GOVERNMENT: RISK & INSURANCE
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('ECGC_COUNTRY_RISK', 'GOVERNMENT', 'https://www.ecgc.in/country-classification/', 'MONTHLY', 'HTML_PARSER', 'IDLE');

-- GOVERNMENT: AGRICULTURAL PRODUCTS
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('APEDA_PRODUCTS', 'GOVERNMENT', 'https://apeda.gov.in', 'WEEKLY', 'REST_API', 'IDLE');

-- MULTILATERAL: GLOBAL TRADE DATA
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('UN_COMTRADE', 'MULTILATERAL', 'https://comtradeplus.un.org', 'MONTHLY', 'REST_API', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('FAO_PRICES', 'MULTILATERAL', 'https://www.fao.org/faostat', 'MONTHLY', 'REST_API', 'IDLE');

-- GOVERNMENT: FTA INTELLIGENCE (Success Rate Tracking)
VALUES ('INVEST_INDIA_FTA', 'GOVERNMENT', 'https://www.investindia.gov.in/fta', 'WEEKLY', 'PDF_TO_JSON', 'IDLE');

-- GOVERNMENT: CBIC EXCHANGE RATES (Customs Notifications)
INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, ingestion_strategy, last_run_status)
VALUES ('CBIC_EXCHANGE_MASTER', 'GOVERNMENT', 'https://www.cbic.gov.in/Exchange-Rate-Notifications', 'FORTNIGHTLY', 'PDF_TO_JSON', 'IDLE');

-- ================================================================
-- PERFORMANCE METRICS
-- ================================================================

CREATE TABLE IF NOT EXISTS fta_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    cleaned_tariff_lines INTEGER,
    total_raw_lines INTEGER,
    success_rate REAL,
    error_count INTEGER,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES ingestion_sources(id)
);

-- ================================================================
-- END OF SCHEMA_ADMIN
-- ================================================================

