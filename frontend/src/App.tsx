import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

interface HSCode {
  id: number;
  hsn_code: string;
  description: string;
}

interface Country {
  id: number;
  iso_code: string;
  name: string;
}

interface Advisory {
  demand: { level: string; trend: string; };
  price: { avg: number | string; currency: string; volatility: string; };
  certifications: { name: string; authority: string; mandatory: boolean; days: number; }[];
  risk: { score: number | string; level: string; };
  recommendation: { action: string; rationale: string; };
}

function App() {
  const [query, setQuery] = useState('');
  const [hsnResults, setHsnResults] = useState<HSCode[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedHSN, setSelectedHSN] = useState<HSCode | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/countries`).then(res => setCountries(res.data));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    axios.get(`${API_BASE}/hsn/search?q=${query}`).then(res => {
      setHsnResults(res.data);
      setLoading(false);
    });
  };

  const getAdvisory = (hsnId: number, countryId: number) => {
    axios.get(`${API_BASE}/advisory?hs_code_id=${hsnId}&country_id=${countryId}`)
      .then(res => setAdvisory(res.data));
  };

  const downloadPDF = () => {
    if (selectedHSN && selectedCountry) {
      window.open(`${API_BASE}/report/pdf?hs_code_id=${selectedHSN.id}&country_id=${selectedCountry.id}`, '_blank');
    }
  };

  return (
    <div className="container">
      <h1>EXIM Insight India - Validation MVP</h1>
      <p>Rule-based trade advisory engine.</p>

      <div className="card">
        <h3>1. Select Route</h3>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Product/HS Code"
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="button" style={{ marginTop: '10px' }}>Search</button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <label>Destination Country: </label>
          <select
            className="input"
            style={{ width: 'auto' }}
            onChange={e => {
              const c = countries.find(x => x.id === parseInt(e.target.value));
              setSelectedCountry(c || null);
              if (selectedHSN && c) getAdvisory(selectedHSN.id, c.id);
            }}
          >
            <option value="">--Select--</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Matches</h3>
          {loading && <p>Loading...</p>}
          {hsnResults.map(h => (
            <div
              key={h.id}
              className="card"
              style={{ cursor: 'pointer', borderColor: selectedHSN?.id === h.id ? '#2563eb' : '#e2e8f0' }}
              onClick={() => {
                setSelectedHSN(h);
                if (selectedCountry) getAdvisory(h.id, selectedCountry.id);
              }}
            >
              <strong>{h.hsn_code}</strong>
              <p>{h.description}</p>
            </div>
          ))}
        </div>

        <div style={{ flex: 2 }}>
          <h3>Advisory Output</h3>
          {!advisory && <p>Search and select HS Code + Country to generate advisory.</p>}
          {advisory && selectedHSN && selectedCountry && (
            <div className="card">
              <h4>Route: {selectedHSN.hsn_code} to {selectedCountry.name}</h4>
              <p><strong>Recommendation:</strong> {advisory.recommendation.action}</p>
              <p><strong>Rationale:</strong> {advisory.recommendation.rationale}</p>
              <hr />
              <p><strong>Demand:</strong> {advisory.demand.level} (Trend: {advisory.demand.trend})</p>
              <p><strong>Price Band:</strong> {advisory.price.avg} {advisory.price.currency} (Volatility: {advisory.price.volatility})</p>
              <p><strong>Risk Score:</strong> {advisory.risk.score}/100 ({advisory.risk.level})</p>

              <h5>Certification Checklist</h5>
              <ul>
                {advisory.certifications.map((c, i) => (
                  <li key={i}>{c.name} ({c.authority}) - {c.mandatory ? 'Mandatory' : 'Optional'}</li>
                ))}
              </ul>

              <button className="button" onClick={downloadPDF}>Download PDF Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
