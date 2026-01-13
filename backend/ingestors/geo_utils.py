# Geographical Coordinate Mapping for Global Demand Hubs
PORT_COORDS = {
    "NL": {"name": "Rotterdam, NL", "lat": 51.9225, "lng": 4.47917},
    "AE": {"name": "Jebel Ali, UAE", "lat": 24.9857, "lng": 55.0273},
    "VN": {"name": "Ho Chi Minh, VN", "lat": 10.7626, "lng": 106.6601},
    "DE": {"name": "Hamburg, DE", "lat": 53.5511, "lng": 9.9937},
    "US": {"name": "New York, USA", "lat": 40.7128, "lng": -74.0060},
    "SG": {"name": "Singapore", "lat": 1.3521, "lng": 103.8198},
    "CN": {"name": "Shanghai, CN", "lat": 31.2304, "lng": 121.4737},
    "AU": {"name": "Sydney, AU", "lat": -33.8688, "lng": 151.2093},
    "GB": {"name": "London, UK", "lat": 51.5074, "lng": -0.1278},
    "SA": {"name": "Jeddah, SA", "lat": 21.4858, "lng": 39.1925},
    "FR": {"name": "Le Havre, FR", "lat": 49.4938, "lng": 0.1077},
    "IT": {"name": "Genoa, IT", "lat": 44.4056, "lng": 8.9463},
    "JP": {"name": "Tokyo, JP", "lat": 35.6762, "lng": 139.6503},
    "KR": {"name": "Busan, KR", "lat": 35.1796, "lng": 129.0756},
    "CA": {"name": "Vancouver, CA", "lat": 49.2827, "lng": -123.1207},
    "BR": {"name": "Santos, BR", "lat": -23.9608, "lng": -46.3339},
    "ID": {"name": "Jakarta, ID", "lat": -6.2088, "lng": 106.8456},
    "ES": {"name": "Valencia, ES", "lat": 39.4699, "lng": -0.3763},
    "CH": {"name": "Zurich, CH", "lat": 47.3769, "lng": 8.5417},
    "QA": {"name": "Doha, QA", "lat": 25.2854, "lng": 51.5310},
    "RU": {"name": "St. Petersburg, RU", "lat": 59.9343, "lng": 30.3351},
    "MX": {"name": "Manzanillo, MX", "lat": 19.0522, "lng": -104.3158},
    "NG": {"name": "Lagos, NG", "lat": 6.4550, "lng": 3.3841},
    "MY": {"name": "Port Klang, MY", "lat": 3.0031, "lng": 101.3931},
    "IL": {"name": "Haifa, IL", "lat": 32.7940, "lng": 34.9896},
    "TR": {"name": "Istanbul, TR", "lat": 41.0082, "lng": 28.9784}
}

def get_port_coordinates(iso_code: str):
    return PORT_COORDS.get(iso_code)
