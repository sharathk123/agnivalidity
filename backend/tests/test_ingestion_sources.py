import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from sqlalchemy import text
from admin import run_ingestion_worker
from ingestors.dgft_ingestor import run_dgft_ingestor_task
from ingestors.country_ingestor import run_country_ingestor

# Mock DGFT HTML
DGFT_HTML_MOCK = """
<table>
    <tr>
        <td>1234.56.78</td>
        <td>Test Coffee</td>
        <td>Free</td>
    </tr>
</table>
"""

@pytest.mark.asyncio
async def test_dgft_ingestion(session):
    # 1. Setup Mock
    with patch("ingestors.dgft_ingestor.fetch_dgft_chapter_html", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = DGFT_HTML_MOCK
        
        # 2. Run Task
        await run_dgft_ingestor_task(session, source_id=1, chapters=[9], dry_run=False)
        
        # 3. Validation
        row = session.execute(text("SELECT description, regulatory_sensitivity FROM hs_code WHERE hs_code='12345678'")).fetchone()
        assert row is not None
        assert row[0] == "Test Coffee"
        assert row[1] == "LOW"

@pytest.mark.asyncio
async def test_country_ingestion(session):
    # Mock Response
    mock_data = [{"name": { "common": "TestLand" }, "cca2": "TL", "region": "TestRegion", "subregion": "TestSub"}]
    
    # Patch requests.get (NOT httpx)
    with patch("ingestors.country_ingestor.requests.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.json.return_value = mock_data
        mock_resp.raise_for_status = MagicMock()
        mock_get.return_value = mock_resp
        
        # 2. Run Task (Sync)
        # Pass priority_only=False to allow 'TL'
        run_country_ingestor(session, dry_run=False, priority_only=False)
        
        # 3. Validation
        row = session.execute(text("SELECT name FROM country WHERE iso_code='TL'")).fetchone()
        assert row is not None
        assert row[0] == "TestLand"

@pytest.mark.asyncio
async def test_icegate_drift_simulation(session):
    # Setup Source
    # Clean up by Name and ID to avoid Unique Constraint violation
    session.execute(text("DELETE FROM ingestion_sources WHERE source_name='ICEGATE_JSON_ADVISORY' OR id=999"))
    
    # Add source_type column value (Use High ID)
    session.execute(text("INSERT INTO ingestion_sources (id, source_name, source_type, last_run_status) VALUES (999, 'ICEGATE_JSON_ADVISORY', 'API', 'IDLE')"))
    session.commit()
    
    # Patch SessionLocal in database module
    # This ensures run_ingestion_worker gets our mock session
    with patch("database.SessionLocal") as mock_sl:
        mock_sl.return_value = session
        # Mock session.close to prevent premature closing of fixture
        with patch.object(session, 'close', return_value=None):
             
             # Mock Sleep
             with patch("asyncio.sleep", new_callable=AsyncMock):
                 await run_ingestion_worker(source_id=999, source_name="ICEGATE_JSON_ADVISORY", dry_run=False)
    
    # Check Status
    status = session.execute(text("SELECT last_run_status FROM ingestion_sources WHERE id=999")).scalar()
    
    # Expect FAILED because Simulation Logic sets Drift (Live 1.2 > Internal 1.1)
    assert status == 'FAILED'
