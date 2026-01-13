import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.ai_service import (
    get_explanation,
    get_cached_explanation,
    write_explanation_cache,
    log_ai_interaction,
    generate_cache_key,
    generate_prompt_hash,
    FALLBACK_MESSAGE
)

# Setup test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_ai_service.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    import os
    if os.path.exists("./test_ai_service.db"):
        try:
            os.remove("./test_ai_service.db")
        except:
            pass
    
    # Create core tables
    from database import Base
    Base.metadata.create_all(bind=engine)
    
    # Create AI tables using raw SQL
    db = TestingSessionLocal()
    
    # Read and execute schema_v2.sql
    with open("backend/schema_v2.sql", "r") as f:
        schema_sql = f.read()
        for statement in schema_sql.split(';'):
            if statement.strip():
                try:
                    db.execute(statement)
                except:
                    pass
    
    # Read and execute seed_prompts.sql
    with open("backend/seed_prompts.sql", "r") as f:
        seed_sql = f.read()
        for statement in seed_sql.split(';'):
            if statement.strip():
                try:
                    db.execute(statement)
                except:
                    pass
    
    db.commit()
    db.close()
    
    yield
    
    engine.dispose()
    if os.path.exists("./test_ai_service.db"):
        try:
            os.remove("./test_ai_service.db")
        except:
            pass

def test_cache_key_generation():
    """Test deterministic cache key generation"""
    key1 = generate_cache_key("MARKET_EXPLANATION", "10063020", "AE", {"demand": "HIGH"})
    key2 = generate_cache_key("MARKET_EXPLANATION", "10063020", "AE", {"demand": "HIGH"})
    assert key1 == key2
    assert len(key1) == 64  # SHA256 hex

def test_prompt_hash_generation():
    """Test prompt hash generation"""
    hash1 = generate_prompt_hash("test prompt")
    hash2 = generate_prompt_hash("test prompt")
    assert hash1 == hash2
    assert len(hash1) == 64

def test_cache_miss_then_write():
    """Test cache miss followed by cache write"""
    db = TestingSessionLocal()
    
    cache_key = "test_cache_key_123"
    
    # Cache miss
    result = get_cached_explanation(cache_key, db)
    assert result is None
    
    # Write to cache
    write_explanation_cache(
        cache_key=cache_key,
        hs_code="10063020",
        country_code="AE",
        explanation_type="MARKET_EXPLANATION",
        explanation_text="Test explanation",
        model_provider="mock",
        model_name="mock-model",
        db=db
    )
    
    # Cache hit
    result = get_cached_explanation(cache_key, db)
    assert result == "Test explanation"
    
    db.close()

def test_ai_interaction_logging():
    """Test AI interaction logging"""
    db = TestingSessionLocal()
    
    log_ai_interaction(
        interaction_type="MARKET_EXPLANATION",
        model_provider="mock",
        model_name="mock-model",
        prompt_hash="abc123",
        input_payload={"test": "data"},
        output_text="Test output",
        token_count=10,
        latency_ms=100,
        success=True,
        error_message=None,
        db=db
    )
    
    # Verify log was written
    from sqlalchemy import text
    result = db.execute(text("SELECT COUNT(*) FROM ai_interaction_log")).scalar()
    assert result == 1
    
    db.close()

def test_get_explanation_with_prompt():
    """Test get_explanation with seeded prompt"""
    db = TestingSessionLocal()
    
    explanation = get_explanation(
        explanation_type="MARKET_EXPLANATION",
        structured_payload={"demand": "HIGH", "trend": "UP"},
        hs_code="10063020",
        country_code="AE",
        db=db
    )
    
    # Should return mock AI output (not fallback)
    assert explanation != FALLBACK_MESSAGE
    assert "[AI Explanation" in explanation
    
    db.close()

def test_get_explanation_cache_hit():
    """Test that second call uses cache"""
    db = TestingSessionLocal()
    
    payload = {"demand": "HIGH", "trend": "UP"}
    
    # First call
    explanation1 = get_explanation(
        explanation_type="MARKET_EXPLANATION",
        structured_payload=payload,
        hs_code="10063020",
        country_code="AE",
        db=db
    )
    
    # Second call (should hit cache)
    explanation2 = get_explanation(
        explanation_type="MARKET_EXPLANATION",
        structured_payload=payload,
        hs_code="10063020",
        country_code="AE",
        db=db
    )
    
    assert explanation1 == explanation2
    
    # Verify only ONE AI interaction was logged
    from sqlalchemy import text
    count = db.execute(text("SELECT COUNT(*) FROM ai_interaction_log")).scalar()
    assert count == 1
    
    db.close()

def test_get_explanation_missing_prompt():
    """Test fallback when prompt doesn't exist"""
    db = TestingSessionLocal()
    
    explanation = get_explanation(
        explanation_type="NONEXISTENT_PROMPT",
        structured_payload={"test": "data"},
        hs_code="10063020",
        country_code="AE",
        db=db
    )
    
    assert explanation == FALLBACK_MESSAGE
    
    db.close()
