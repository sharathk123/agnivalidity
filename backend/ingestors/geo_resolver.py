import json
import os
import logging
from difflib import get_close_matches

logger = logging.getLogger("EXIM_Admin")

class GeoResolver:
    """
    Resolves naming discrepancies between external data sources (scrapers)
    and the canonical TopoJSON boundaries used in the frontend.
    """
    
    def __init__(self, topojson_path: str):
        self.topojson_path = topojson_path
        self.canonical_names = []
        self.alias_map = {
            "Darjeeling": "Darjiling",
            "Darjeling": "Darjiling",
            "Kanchipuram": "Kancheepuram",
            "Conjeevaram": "Kancheepuram",
            "Allahabad": "Prayagraj",
            "Varanasi": "Varanasi",
            "Banaras": "Varanasi",
            "Kashi": "Varanasi",
            # Add more aliases as discovered
        }
        self._load_canonical_names()
    
    def _load_canonical_names(self):
        """Load strings from the TopoJSON property 'shapeName'"""
        if not os.path.exists(self.topojson_path):
            logger.warning(f"TopoJSON not found at {self.topojson_path}. Falling back to empty canonical list.")
            return
            
        try:
            with open(self.topojson_path, 'r') as f:
                data = json.load(f)
                # Hardcoded for the INDADM2gbOpen schema used in our project
                geoms = data.get('objects', {}).get('INDADM2gbOpen', {}).get('geometries', [])
                self.canonical_names = [g['properties'].get('shapeName') for g in geoms if g['properties'].get('shapeName')]
                logger.info(f"Loaded {len(self.canonical_names)} canonical district names.")
        except Exception as e:
            logger.error(f"Failed to load TopoJSON for resolution: {e}")

    def resolve_district(self, name: str) -> str:
        """
        Input: Scraped name (e.g., 'Darjeeling')
        Output: Canonical name (e.g., 'Darjiling')
        """
        if not name:
            return name
            
        clean_name = name.strip()
        
        # 1. Direct Match
        if clean_name in self.canonical_names:
            return clean_name
            
        # 2. Alias Map (Manual Overrides)
        if clean_name in self.alias_map:
            return self.alias_map[clean_name]
            
        # 3. Fuzzy Matching (Difflib)
        matches = get_close_matches(clean_name, self.canonical_names, n=1, cutoff=0.75)
        if matches:
            resolved = matches[0]
            logger.info(f"Resolved '{clean_name}' -> '{resolved}' using fuzzy matching.")
            return resolved
            
        # 4. Fallback (Return as is, frontend will handle missing data)
        return clean_name

# Singleton instance for the ingestor
# Path relative to backend/
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
topo_path = os.path.join(project_root, "frontend/public/india-districts.json")
resolver = GeoResolver(topo_path)
