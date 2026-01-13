import pytest
import respx
from httpx import Response
from ingestors.utils import icegate_schema_check

@respx.mock
@pytest.mark.asyncio
async def test_icegate_v1_1_ready():
    """Task 2: Scenario A (Pass) - Version is 1.1"""
    # Mocking the 2026 Advisory page
    respx.get("https://www.icegate.gov.in/advisory").mock(
        return_value=Response(200, json={"latest_schema": "1.1", "date": "2026-01-13"})
    )
    
    result = await icegate_schema_check(supported_version="1.1")
    assert result["system_status"] == "READY"
    assert result["version"] == "1.1"

@respx.mock
@pytest.mark.asyncio
async def test_icegate_v1_2_drift_alert():
    """Task 2: Scenario B (Critical Fail) - Version is 1.2"""
    # Mocking the 2026 Advisory page with a newer version
    respx.get("https://www.icegate.gov.in/advisory").mock(
        return_value=Response(200, json={"latest_schema": "1.2", "date": "2026-01-13"})
    )
    
    # The system should recognize v1.2 is unmapped and raise an alert (SystemExit)
    with pytest.raises(SystemExit):
        await icegate_schema_check(supported_version="1.1")
