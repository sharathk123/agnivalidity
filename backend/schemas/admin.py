from pydantic import BaseModel
from typing import Optional, Dict

class IngestionSource(BaseModel):
    id: int
    source_name: str
    source_type: str
    base_url: Optional[str]
    frequency: str
    is_active: bool
    dry_run_mode: bool
    throttle_rpm: int
    last_run_status: Optional[str]
    last_run_at: Optional[str]
    records_updated: int
    ingestion_strategy: str
    performance_stats: Optional[Dict] = None

class IngestionLog(BaseModel):
    id: int
    source_id: int
    run_type: str
    records_fetched: int
    records_inserted: int
    records_updated: int
    records_skipped: int
    error_summary: Optional[str]
    schema_drift_detected: bool
    started_at: Optional[str]
    finished_at: Optional[str]
    duration_seconds: Optional[int]

class SystemSetting(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str]
