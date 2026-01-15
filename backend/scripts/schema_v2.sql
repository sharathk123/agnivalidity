-- DATABASE_SCHEMA_V2.sql
-- EXIM Insight India – AI Extension Schema
-- 
-- PURPOSE:
-- This schema extends the MVP database to support AI explanations,
-- auditability, cost control, and agentic observability.
--
-- RULES:
-- - Does NOT modify MVP tables
-- - AI NEVER writes into core tables
-- - AI data is disposable
-- - Product MUST function if AI is disabled

-- ================================================================
-- AI INTERACTION LOG
-- ================================================================
-- Purpose: Record EVERY AI interaction for audit, debugging,
-- hallucination detection, and cost tracking.

CREATE TABLE IF NOT EXISTS ai_interaction_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_type TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    input_payload TEXT NOT NULL,
    output_text TEXT,
    token_count INTEGER,
    latency_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_interaction_log_created_at ON ai_interaction_log(created_at);
CREATE INDEX idx_ai_interaction_log_prompt_hash ON ai_interaction_log(prompt_hash);
CREATE INDEX idx_ai_interaction_log_success ON ai_interaction_log(success);

-- ================================================================
-- AI EXPLANATION CACHE
-- ================================================================
-- Purpose: Prevent repeated AI calls for identical explanations.

CREATE TABLE IF NOT EXISTS ai_explanation_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    hs_code TEXT NOT NULL,
    country_code TEXT NOT NULL,
    explanation_type TEXT NOT NULL,
    explanation_text TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

CREATE INDEX idx_ai_explanation_cache_key ON ai_explanation_cache(cache_key);
CREATE INDEX idx_ai_explanation_cache_expires ON ai_explanation_cache(expires_at);

-- ================================================================
-- AI AGENT TASK LOG
-- ================================================================
-- Purpose: Track multi-step agentic AI execution.

CREATE TABLE IF NOT EXISTS ai_agent_task_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    input_context TEXT NOT NULL,
    output_summary TEXT,
    step_count INTEGER,
    success BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_agent_task_log_agent_name ON ai_agent_task_log(agent_name);
CREATE INDEX idx_ai_agent_task_log_created_at ON ai_agent_task_log(created_at);

-- ================================================================
-- AI PROMPT TEMPLATE
-- ================================================================
-- Purpose: Govern and version ALL AI prompts.

CREATE TABLE IF NOT EXISTS ai_prompt_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_name TEXT UNIQUE NOT NULL,
    prompt_version TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_prompt_template_active ON ai_prompt_template(is_active);

-- ================================================================
-- AI USAGE QUOTA
-- ================================================================
-- Purpose: Define AI usage limits for cost control.

CREATE TABLE IF NOT EXISTS ai_usage_quota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type TEXT NOT NULL,
    daily_limit INTEGER NOT NULL,
    monthly_limit INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_usage_quota_user_type ON ai_usage_quota(user_type);

-- ================================================================
-- DEFAULT QUOTA POLICIES
-- ================================================================
-- Insert default quotas for cost control

INSERT INTO ai_usage_quota (user_type, daily_limit, monthly_limit) 
VALUES ('free', 10, 100);

INSERT INTO ai_usage_quota (user_type, daily_limit, monthly_limit) 
VALUES ('paid', 100, 1000);

-- ================================================================
-- END OF SCHEMA_V2
-- ================================================================
