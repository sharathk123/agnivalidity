import pytest
import time
from unittest.mock import MagicMock, patch
from ingestors.utils import get_random_headers, retry_with_backoff, USER_AGENTS

def test_random_user_agent():
    """Task 1: The 'Identity & Stealth' Test - Randomized User-Agent"""
    url = "https://www.dgft.gov.in/CP/"
    headers1 = get_random_headers(url)
    headers2 = get_random_headers(url)
    
    # Check that User-Agent is in headers
    assert "User-Agent" in headers1
    assert "User-Agent" in headers2
    
    # Check that User-Agent is from the list
    assert headers1["User-Agent"] in USER_AGENTS
    assert headers2["User-Agent"] in USER_AGENTS
    
    # Check that Referer is correctly set for DGFT
    assert headers1["Referer"] == "https://www.dgft.gov.in/"

def test_retry_logic_on_failure():
    """Task 1: The 'Identity & Stealth' Test - Retry Logic on 429/503"""
    
    mock_func = MagicMock()
    
    # Scenario: Fail twice, then succeed
    # We'll simulate 429 and 503 by raising exceptions that include these strings or just generic exceptions
    # since the current retry_with_backoff catches all Exceptions.
    mock_func.side_effect = [
        Exception("429 Too Many Requests"),
        Exception("503 Service Unavailable"),
        "SUCCESS"
    ]
    
    # Apply the decorator with small base_delay for faster testing
    @retry_with_backoff(max_retries=3, base_delay=0.1)
    def decorated_func():
        return mock_func()
    
    result = decorated_func()
    
    assert result == "SUCCESS"
    assert mock_func.call_count == 3

def test_retry_logic_max_retries_exceeded():
    """Ensure it raises after max retries"""
    mock_func = MagicMock()
    mock_func.side_effect = Exception("Permanent Failure")
    
    @retry_with_backoff(max_retries=2, base_delay=0.1)
    def decorated_func():
        return mock_func()
    
    with pytest.raises(Exception) as excinfo:
        decorated_func()
    
    assert "Permanent Failure" in str(excinfo.value)
    assert mock_func.call_count == 2
