"""
Ingestion Utilities
Resilient fetching, identity management, and schema validation for Admin Command Control.

CRITICAL: These utilities protect against IP blacklisting and ensure government portal compliance.
"""

import time
import random
import functools
import logging
import requests
from typing import Callable, Optional, Dict, Any
from datetime import datetime

# Configure logging for Admin Dashboard
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EXIM_Admin")

# ================================================================
# USER-AGENT ROTATION (2026 Updated Strings)
# ================================================================
# Modern browser signatures to avoid bot detection on CII-protected portals

USER_AGENTS = [
    # Chrome on Windows (Jan 2026)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    # Chrome on macOS (Jan 2026)
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    # Firefox on Linux (Jan 2026)
    "Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0",
    # Edge on Windows (Jan 2026)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
    # Safari on macOS (Jan 2026)
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
]

# Referer headers by domain
REFERER_MAP = {
    "dgft.gov.in": "https://www.dgft.gov.in/",
    "icegate.gov.in": "https://www.icegate.gov.in/",
    "tradestat.commerce.gov.in": "https://tradestat.commerce.gov.in/",
    "apeda.gov.in": "https://apeda.gov.in/",
    "ecgc.in": "https://www.ecgc.in/",
    "investindia.gov.in": "https://www.investindia.gov.in/",
}


# ================================================================
# RESILIENT RETRY DECORATOR
# ================================================================

def retry_with_backoff(max_retries: int = 5, base_delay: float = 2.0):
    """
    Decorator for Admin Workers.
    Implements exponential backoff: delay = base_delay * (2^retry) + jitter
    
    Prevents "thundering herd" behavior when government servers are down.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            last_exception = None
            
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    retries += 1
                    last_exception = e
                    
                    if retries == max_retries:
                        logger.error(f"FATAL: {func.__name__} failed after {max_retries} attempts. Error: {e}")
                        raise e
                    
                    # Calculate delay with jitter (randomness) to avoid detection
                    delay = (base_delay * (2 ** (retries - 1))) + random.uniform(0, 1)
                    logger.warning(f"Retry {retries}/{max_retries} for {func.__name__} in {delay:.2f}s... Error: {e}")
                    time.sleep(delay)
            
            return None
        return wrapper
    return decorator


# ================================================================
# STEALTH HTTP CLIENT
# ================================================================

def get_random_headers(url: str) -> Dict[str, str]:
    """Generate randomized headers with appropriate referer"""
    from urllib.parse import urlparse
    
    domain = urlparse(url).netloc
    referer = None
    
    for key, ref in REFERER_MAP.items():
        if key in domain:
            referer = ref
            break
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
    }
    
    if referer:
        headers["Referer"] = referer
    
    return headers


@retry_with_backoff(max_retries=3, base_delay=2.0)
def fetch_url(url: str, timeout: int = 15) -> str:
    """
    Fetch URL with retry logic and stealth headers.
    Use this for all government portal requests.
    """
    headers = get_random_headers(url)
    
    logger.info(f"Fetching: {url}")
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    
    logger.info(f"Success: {url} ({len(response.text)} bytes)")
    return response.text


@retry_with_backoff(max_retries=3, base_delay=2.0)
def fetch_json(url: str, timeout: int = 15) -> Dict[str, Any]:
    """
    Fetch JSON from URL with retry logic.
    """
    headers = get_random_headers(url)
    headers["Accept"] = "application/json"
    
    logger.info(f"Fetching JSON: {url}")
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    
    return response.json()


# ================================================================
# ICEGATE JSON SCHEMA VERSION GUARD
# ================================================================

# Current supported schema version
SUPPORTED_ICEGATE_VERSION = "1.5"

def check_icegate_schema_version(db_session) -> Dict[str, Any]:
    """
    Check ICEGATE JSON schema version against system settings.
    Returns validation result with alert status.
    
    CRITICAL: ICEGATE goes live Jan 31, 2026 with JSON filing.
    """
    from sqlalchemy import text
    
    # Get configured version from system settings
    configured_version = db_session.execute(text(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'ICEGATE_JSON_VERSION'"
    )).scalar()
    
    if not configured_version:
        configured_version = SUPPORTED_ICEGATE_VERSION
    
    result = {
        "supported_version": SUPPORTED_ICEGATE_VERSION,
        "configured_version": configured_version,
        "status": "OK",
        "message": "Schema version is compatible",
        "checked_at": datetime.now().isoformat()
    }
    
    # Compare versions
    try:
        supported_parts = [int(x) for x in SUPPORTED_ICEGATE_VERSION.split(".")]
        configured_parts = [int(x) for x in configured_version.split(".")]
        
        if configured_parts > supported_parts:
            result["status"] = "CODE_UPDATE_REQUIRED"
            result["message"] = f"ICEGATE schema v{configured_version} requires code update. Current parser supports v{SUPPORTED_ICEGATE_VERSION}."
    except Exception as e:
        result["status"] = "ERROR"
        result["message"] = f"Version parse error: {e}"
    
    return result


def validate_before_ingestion(source_name: str, db_session) -> Dict[str, Any]:
    """
    Pre-flight validation before starting ingestion.
    Checks schema versions, kill switch, and source status.
    """
    from sqlalchemy import text
    
    validation = {
        "source_name": source_name,
        "can_proceed": True,
        "checks": []
    }
    
    # Check 1: Kill Switch
    kill_switch = db_session.execute(text(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'GLOBAL_KILL_SWITCH'"
    )).scalar()
    
    if kill_switch == "ON":
        validation["can_proceed"] = False
        validation["checks"].append({
            "check": "KILL_SWITCH",
            "status": "BLOCKED",
            "message": "Global kill switch is ON"
        })
    else:
        validation["checks"].append({
            "check": "KILL_SWITCH",
            "status": "OK",
            "message": "Kill switch is OFF"
        })
    
    # Check 2: Source is active
    source = db_session.execute(text(
        "SELECT is_active, last_run_status FROM ingestion_sources WHERE source_name = :name"
    ), {"name": source_name}).fetchone()
    
    if not source:
        validation["can_proceed"] = False
        validation["checks"].append({
            "check": "SOURCE_EXISTS",
            "status": "FAILED",
            "message": f"Source '{source_name}' not found"
        })
    elif not source[0]:
        validation["can_proceed"] = False
        validation["checks"].append({
            "check": "SOURCE_ACTIVE",
            "status": "BLOCKED",
            "message": "Source is disabled"
        })
    elif source[1] == "RUNNING":
        validation["can_proceed"] = False
        validation["checks"].append({
            "check": "SOURCE_STATUS",
            "status": "BLOCKED",
            "message": "Source is already running"
        })
    else:
        validation["checks"].append({
            "check": "SOURCE_STATUS",
            "status": "OK",
            "message": f"Source is {source[1] or 'IDLE'}"
        })
    
    # Check 3: ICEGATE version (for ICEGATE and DGFT sources)
    # DGFT data must align with ICEGATE classification, so we block if schema drifts.
    if "ICEGATE" in source_name or "DGFT" in source_name:
        icegate_check = check_icegate_schema_version(db_session)
        if icegate_check["status"] == "CODE_UPDATE_REQUIRED":
            validation["can_proceed"] = False
        validation["checks"].append({
            "check": "ICEGATE_VERSION",
            "status": icegate_check["status"],
            "message": icegate_check["message"]
        })
    
    return validation


# ================================================================
# THROTTLE HELPER
# ================================================================

class Throttler:
    """
    Rate limiter for respecting government portal request limits.
    Uses token bucket algorithm.
    """
    
    def __init__(self, requests_per_minute: int = 10):
        self.rpm = requests_per_minute
        self.min_interval = 60.0 / requests_per_minute
        self.last_request_time = 0.0
    
    def wait(self):
        """Wait if needed to respect rate limit"""
        now = time.time()
        elapsed = now - self.last_request_time
        
        if elapsed < self.min_interval:
            sleep_time = self.min_interval - elapsed + random.uniform(0.1, 0.5)
            logger.debug(f"Throttling: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def fetch(self, url: str, timeout: int = 15) -> str:
        """Fetch URL with throttling"""
        self.wait()
        return fetch_url(url, timeout)


# ================================================================
# LOG MESSAGE FORMATTER (for Admin Dashboard)
# ================================================================

def format_admin_log(level: str, source: str, message: str) -> Dict[str, Any]:
    """Format log message for Admin Dashboard live stream"""
    return {
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "source": source,
        "message": message
    }


# ================================================================
# EXPORTS
# ================================================================

__all__ = [
    "retry_with_backoff",
    "fetch_url",
    "fetch_json",
    "get_random_headers",
    "check_icegate_schema_version",
    "validate_before_ingestion",
    "Throttler",
    "format_admin_log",
    "USER_AGENTS",
    "SUPPORTED_ICEGATE_VERSION",
]
