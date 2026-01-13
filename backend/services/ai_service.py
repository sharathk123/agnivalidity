"""
AI Service Module
Handles all AI interactions per AI_SERVICE_CONTRACT.md

Rules:
- ALL AI calls go through this service
- ALL calls are logged to ai_interaction_log
- Caching is mandatory
- AI failure must not break product flow
"""

import hashlib
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from database import SessionLocal

# AI extension tables (imported dynamically to avoid circular deps)
def get_ai_tables():
    from sqlalchemy import Table, MetaData
    metadata = MetaData()
    from database import engine
    metadata.reflect(bind=engine)
    return {
        'ai_interaction_log': metadata.tables.get('ai_interaction_log'),
        'ai_explanation_cache': metadata.tables.get('ai_explanation_cache'),
        'ai_prompt_template': metadata.tables.get('ai_prompt_template'),
        'ai_usage_quota': metadata.tables.get('ai_usage_quota'),
    }

FALLBACK_MESSAGE = "Explanation unavailable. Please review the data above."

def generate_cache_key(explanation_type: str, hs_code: str, country_code: str, payload: Dict[str, Any]) -> str:
    """Generate deterministic cache key"""
    payload_str = json.dumps(payload, sort_keys=True)
    raw = f"{explanation_type}:{hs_code}:{country_code}:{payload_str}"
    return hashlib.sha256(raw.encode()).hexdigest()

def generate_prompt_hash(prompt_text: str) -> str:
    """Generate hash from prompt text"""
    return hashlib.sha256(prompt_text.encode()).hexdigest()

def get_cached_explanation(
    cache_key: str,
    db: Session
) -> Optional[str]:
    """
    Read from ai_explanation_cache
    Returns explanation text if cache hit and not expired
    """
    tables = get_ai_tables()
    cache_table = tables['ai_explanation_cache']
    if cache_table is None:
        return None
    
    from sqlalchemy import select
    stmt = select(cache_table).where(cache_table.c.cache_key == cache_key)
    result = db.execute(stmt).fetchone()
    
    if result is None:
        return None
    
    # Check expiry
    if result.expires_at:
        expires_at = datetime.fromisoformat(result.expires_at)
        if datetime.now() > expires_at:
            return None
    
    return result.explanation_text

def write_explanation_cache(
    cache_key: str,
    hs_code: str,
    country_code: str,
    explanation_type: str,
    explanation_text: str,
    model_provider: str,
    model_name: str,
    db: Session,
    ttl_days: int = 30
) -> None:
    """
    Write to ai_explanation_cache
    """
    tables = get_ai_tables()
    cache_table = tables['ai_explanation_cache']
    if cache_table is None:
        return
    
    expires_at = datetime.now() + timedelta(days=ttl_days)
    
    from sqlalchemy import insert
    stmt = insert(cache_table).values(
        cache_key=cache_key,
        hs_code=hs_code,
        country_code=country_code,
        explanation_type=explanation_type,
        explanation_text=explanation_text,
        model_provider=model_provider,
        model_name=model_name,
        expires_at=expires_at.isoformat()
    )
    
    try:
        db.execute(stmt)
        db.commit()
    except Exception:
        db.rollback()

def log_ai_interaction(
    interaction_type: str,
    model_provider: str,
    model_name: str,
    prompt_hash: str,
    input_payload: Dict[str, Any],
    output_text: Optional[str],
    token_count: Optional[int],
    latency_ms: int,
    success: bool,
    error_message: Optional[str],
    db: Session
) -> None:
    """
    Log to ai_interaction_log
    MUST be called for EVERY AI invocation
    """
    tables = get_ai_tables()
    log_table = tables['ai_interaction_log']
    if log_table is None:
        return
    
    from sqlalchemy import insert
    stmt = insert(log_table).values(
        interaction_type=interaction_type,
        model_provider=model_provider,
        model_name=model_name,
        prompt_hash=prompt_hash,
        input_payload=json.dumps(input_payload),
        output_text=output_text,
        token_count=token_count,
        latency_ms=latency_ms,
        success=success,
        error_message=error_message
    )
    
    try:
        db.execute(stmt)
        db.commit()
    except Exception:
        db.rollback()

def get_active_prompt(prompt_name: str, db: Session) -> Optional[Dict[str, Any]]:
    """
    Fetch active prompt from ai_prompt_template
    """
    tables = get_ai_tables()
    prompt_table = tables['ai_prompt_template']
    if prompt_table is None:
        return None
    
    from sqlalchemy import select
    stmt = select(prompt_table).where(
        prompt_table.c.prompt_name == prompt_name,
        prompt_table.c.is_active == True
    )
    result = db.execute(stmt).fetchone()
    
    if result is None:
        return None
    
    return {
        'prompt_text': result.prompt_text,
        'prompt_version': result.prompt_version,
        'prompt_hash': generate_prompt_hash(result.prompt_text)
    }

def call_ai_model(prompt_text: str, structured_data: Dict[str, Any]) -> str:
    """
    Call AI model (mocked for now)
    In production, this would call Groq/HuggingFace/OpenAI
    """
    # MOCK IMPLEMENTATION
    # Real implementation would use:
    # - Groq API
    # - HuggingFace Inference API
    # - OpenAI API (fallback)
    
    return f"[AI Explanation based on provided data: {json.dumps(structured_data, indent=2)}]"

def get_explanation(
    explanation_type: str,
    structured_payload: Dict[str, Any],
    hs_code: str,
    country_code: str,
    db: Session
) -> str:
    """
    Generate human-readable explanation from structured data
    
    Rules:
    - Checks cache first
    - Fetches prompt from database
    - Calls AI model
    - Logs interaction
    - Writes to cache
    - Returns explanation OR fallback
    """
    start_time = time.time()
    
    # Generate cache key
    cache_key = generate_cache_key(explanation_type, hs_code, country_code, structured_payload)
    
    # Check cache
    cached = get_cached_explanation(cache_key, db)
    if cached:
        return cached
    
    # Get prompt
    prompt_data = get_active_prompt(explanation_type, db)
    if not prompt_data:
        return FALLBACK_MESSAGE
    
    prompt_text = prompt_data['prompt_text']
    prompt_hash = prompt_data['prompt_hash']
    
    # Call AI
    try:
        # Combine prompt with structured data
        full_prompt = f"{prompt_text}\n\nDATA:\n{json.dumps(structured_payload, indent=2)}"
        
        output_text = call_ai_model(full_prompt, structured_payload)
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Log success
        log_ai_interaction(
            interaction_type=explanation_type,
            model_provider="mock",
            model_name="mock-model",
            prompt_hash=prompt_hash,
            input_payload=structured_payload,
            output_text=output_text,
            token_count=len(output_text.split()),
            latency_ms=latency_ms,
            success=True,
            error_message=None,
            db=db
        )
        
        # Write cache
        write_explanation_cache(
            cache_key=cache_key,
            hs_code=hs_code,
            country_code=country_code,
            explanation_type=explanation_type,
            explanation_text=output_text,
            model_provider="mock",
            model_name="mock-model",
            db=db
        )
        
        return output_text
        
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Log failure
        log_ai_interaction(
            interaction_type=explanation_type,
            model_provider="mock",
            model_name="mock-model",
            prompt_hash=prompt_hash,
            input_payload=structured_payload,
            output_text=None,
            token_count=None,
            latency_ms=latency_ms,
            success=False,
            error_message=str(e),
            db=db
        )
        
        return FALLBACK_MESSAGE
