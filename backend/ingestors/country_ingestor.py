"""
Country List Ingestor
Fetches ISO country data from public REST Countries API
and populates the country table.

Source: https://restcountries.com (Public, no auth required)
"""

import requests
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session


# Risk level mapping by region
REGION_RISK_MAP = {
    "GCC": "LOW",
    "Europe": "LOW",
    "EU": "LOW",
    "North America": "LOW",
    "Oceania": "LOW",
    "South-Eastern Asia": "MEDIUM",
    "Eastern Asia": "MEDIUM",
    "South America": "MEDIUM",
    "Central America": "MEDIUM",
    "Southern Africa": "MEDIUM",
    "Western Africa": "HIGH",
    "Eastern Africa": "HIGH",
    "Northern Africa": "MEDIUM",
    "Middle Africa": "HIGH",
}

# Priority countries for EXIM India focus
PRIORITY_COUNTRIES = [
    "AE", "SA", "KW", "QA", "OM", "BH",  # GCC
    "US", "CA",                            # North America
    "DE", "GB", "FR", "NL", "IT", "BE",   # Europe
    "SG", "MY", "TH", "VN", "ID", "PH",   # SE Asia
    "JP", "KR", "CN", "HK", "TW",          # East Asia
    "AU", "NZ",                            # Oceania
    "ZA", "KE", "NG", "EG",                # Africa
    "BR", "MX",                            # Americas
]


def fetch_countries_from_api() -> List[Dict[str, Any]]:
    """
    Fetch country data from REST Countries API
    Returns list of country objects
    """
    url = "https://restcountries.com/v3.1/all?fields=name,cca2,region,subregion"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching countries: {e}")
        return []


def determine_risk_level(region: str, subregion: str) -> str:
    """Determine base risk level from region"""
    if subregion in REGION_RISK_MAP:
        return REGION_RISK_MAP[subregion]
    if region in REGION_RISK_MAP:
        return REGION_RISK_MAP[region]
    return "MEDIUM"


def map_region(region: str, subregion: str, iso_code: str) -> str:
    """Map to simplified region categories"""
    if iso_code in ["AE", "SA", "KW", "QA", "OM", "BH"]:
        return "GCC"
    if region == "Europe":
        return "EU" if subregion != "Northern Europe" or iso_code == "GB" else "EU"
    if region == "Americas" and subregion == "Northern America":
        return "North America"
    if region == "Americas":
        return "Latin America"
    if region == "Asia" and subregion == "South-Eastern Asia":
        return "SE Asia"
    if region == "Asia" and subregion == "Eastern Asia":
        return "East Asia"
    if region == "Asia" and subregion == "Southern Asia":
        return "South Asia"
    if region == "Africa":
        return subregion or "Africa"
    if region == "Oceania":
        return "Oceania"
    return region or "Other"


def run_country_ingestor(
    db: Session, 
    dry_run: bool = True,
    priority_only: bool = True
) -> Dict[str, Any]:
    """
    Main ingestor function
    
    Args:
        db: Database session
        dry_run: If True, only log what would be inserted
        priority_only: If True, only ingest priority countries
    
    Returns:
        Summary of ingestion results
    """
    started_at = datetime.now()
    
    result = {
        "source": "ISO_COUNTRY_LIST",
        "started_at": started_at.isoformat(),
        "dry_run": dry_run,
        "records_fetched": 0,
        "records_inserted": 0,
        "records_updated": 0,
        "records_skipped": 0,
        "errors": []
    }
    
    # Fetch from API
    countries = fetch_countries_from_api()
    result["records_fetched"] = len(countries)
    
    if not countries:
        result["errors"].append("Failed to fetch countries from API")
        return result
    
    # Get existing countries
    existing = db.execute(text("SELECT iso_code FROM country")).fetchall()
    existing_codes = {row[0] for row in existing}
    
    for country in countries:
        iso_code = country.get("cca2", "")
        name = country.get("name", {}).get("common", "")
        region = country.get("region", "")
        subregion = country.get("subregion", "")
        
        if not iso_code or not name:
            result["records_skipped"] += 1
            continue
        
        # Filter to priority countries if requested
        if priority_only and iso_code not in PRIORITY_COUNTRIES:
            result["records_skipped"] += 1
            continue
        
        mapped_region = map_region(region, subregion, iso_code)
        risk_level = determine_risk_level(region, subregion)
        
        if iso_code in existing_codes:
            # Update existing
            if not dry_run:
                db.execute(text("""
                    UPDATE country 
                    SET name = :name, region = :region, base_risk_level = :risk
                    WHERE iso_code = :iso
                """), {
                    "name": name,
                    "region": mapped_region,
                    "risk": risk_level,
                    "iso": iso_code
                })
            result["records_updated"] += 1
        else:
            # Insert new
            if not dry_run:
                db.execute(text("""
                    INSERT INTO country (iso_code, name, region, base_risk_level)
                    VALUES (:iso, :name, :region, :risk)
                """), {
                    "iso": iso_code,
                    "name": name,
                    "region": mapped_region,
                    "risk": risk_level
                })
            result["records_inserted"] += 1
    
    if not dry_run:
        db.commit()
    
    result["finished_at"] = datetime.now().isoformat()
    result["duration_seconds"] = int((datetime.now() - started_at).total_seconds())
    
    return result


if __name__ == "__main__":
    # Test run
    from database import SessionLocal
    
    db = SessionLocal()
    result = run_country_ingestor(db, dry_run=True, priority_only=True)
    
    print("=== Country Ingestor Dry Run ===")
    print(f"Fetched: {result['records_fetched']}")
    print(f"Would Insert: {result['records_inserted']}")
    print(f"Would Update: {result['records_updated']}")
    print(f"Skipped: {result['records_skipped']}")
    
    db.close()
