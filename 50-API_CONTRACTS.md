# 50-API_CONTRACTS.md: API Specifications

## Base URL
- Local: `http://localhost:8000`
- Production: `https://exim-backend.fly.dev`

---

## 1. Search HSN
`GET /api/v1/hsn/search`

**Params:**
- `q`: Search query (e.g., "Basmati Rice")
- `limit`: (Optional) Default 10

**Response:**
```json
[
  {
    "hsn_code": "10063020",
    "description": "Basmati Rice",
    "relevance": 0.95
  }
]
```

---

## 2. Get Intelligence
`GET /api/v1/hsn/{code}/intelligence`

**Response:**
```json
{
  "hsn_code": "10063020",
  "incentives": {
    "rodtep": "2.5%",
    "drawback": "1.2%",
    "rosctl": "N/A"
  },
  "compliance": [
    {
      "agency": "APEDA",
      "requirement": "Registration-cum-Membership Certificate (RCMC) mandatory",
      "level": "Critical"
    }
  ],
  "risk_score": {
    "overall": "Low",
    "factors": ["Stable demand", "Standardized certification"]
  }
}
```

---

## 3. Country Risks
`GET /api/v1/countries/risks`

**Response:**
```json
[
  {
    "country": "USA",
    "risk_level": "Low",
    "prohibited_items": ["Certain endangered species", "Specific chemicals"]
  }
]
```
