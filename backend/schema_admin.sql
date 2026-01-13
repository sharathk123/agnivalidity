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

-- ================================================================
-- SEED DEFAULT INGESTION SOURCES
-- ================================================================

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, last_run_status)
VALUES ('ISO_COUNTRY_LIST', 'REFERENCE', 'https://restcountries.com/v3.1/all', 'MONTHLY', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, last_run_status)
VALUES ('DGFT_HS_MASTER', 'GOVERNMENT', 'https://dgft.gov.in', 'WEEKLY', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, last_run_status)
VALUES ('UN_COMTRADE', 'MULTILATERAL', 'https://comtradeplus.un.org', 'MONTHLY', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, last_run_status)
VALUES ('APEDA_PRODUCTS', 'GOVERNMENT', 'https://apeda.gov.in', 'WEEKLY', 'IDLE');

INSERT INTO ingestion_sources (source_name, source_type, base_url, frequency, last_run_status)
VALUES ('FAO_PRICES', 'MULTILATERAL', 'https://www.fao.org/faostat', 'MONTHLY', 'IDLE');

-- ================================================================
-- END OF SCHEMA_ADMIN
-- ================================================================
