import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminCommandCenter } from './components/admin/CommandCenter';

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

interface DemandData {
  level: string;
  trend: string;
}

interface PriceData {
  min: number;
  avg: number;
  max: number;
  currency: string;
}

interface CertData {
  name: string;
  authority: string;
  mandatory: boolean;
  notes: string[];
}

interface RiskData {
  score: number;
  level: string;
  reasons: string[];
}

interface RecData {
  action: string;
  rationale: string;
}

interface Insight {
  demand: DemandData;
  price: PriceData;
  certifications: CertData[];
  risk: RiskData;
  recommendation: RecData;
}

// Simple Router Hook
const usePath = () => {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return path;
};

function App() {
  const path = usePath();

  if (path === '/admin') {
    return <AdminCommandCenter />;
  }

  const [query, setQuery] = useState('');
  const [hsnResults, setHsnResults] = useState<HSCode[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedHSN, setSelectedHSN] = useState<HSCode | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/country/list`).then(res => setCountries(res.data));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    axios.get(`${API_BASE}/hs/search?q=${query}`).then(res => {
      setHsnResults(res.data);
      setLoading(false);
    });
  };

  const getInsights = (hsnId: number, countryId: number) => {
    setLoading(true);
    axios.get(`${API_BASE}/insight?hs_code_id=${hsnId}&country_id=${countryId}`)
      .then(res => {
        setInsight(res.data);
        setLoading(false);
      })
      .catch(() => {
        setInsight(null);
        setLoading(false);
      });
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
      <div style={{ fontSize: '10px', color: '#10b981', marginBottom: '10px' }}>● System ready</div>

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
              if (selectedHSN && c) getInsights(selectedHSN.id, c.id);
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
          {loading && !insight && <p>Loading...</p>}
          {!loading && hsnResults.length === 0 && query && <p style={{ fontSize: '12px', color: '#64748b' }}>No matches found for "{query}".</p>}
          {hsnResults.map(h => (
            <div
              key={h.id}
              className="card"
              style={{ cursor: 'pointer', borderColor: selectedHSN?.id === h.id ? '#2563eb' : '#e2e8f0' }}
              onClick={() => {
                setSelectedHSN(h);
                if (selectedCountry) getInsights(h.id, selectedCountry.id);
              }}
            >
              <strong>{h.hsn_code}</strong>
              <p>{h.description}</p>
            </div>
          ))}
        </div>

        <div style={{ flex: 2 }}>
          <h3>Advisory Output</h3>
          {!insight && <p>Search and select HS Code + Country to see results.</p>}
          {insight && selectedHSN && selectedCountry && (
            <div className="card">
              <h4>Route: {selectedHSN.hsn_code} to {selectedCountry.name}</h4>

              <div className="card" style={{ background: insight.recommendation.action === 'GO' ? '#f0fdf4' : insight.recommendation.action === 'CAUTION' ? '#fff7ed' : '#fef2f2', borderLeft: `5px solid ${insight.recommendation.action === 'GO' ? '#166534' : insight.recommendation.action === 'CAUTION' ? '#9a3412' : '#991b1b'}` }}>
                <strong>Recommendation: {insight.recommendation.action}</strong>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>{insight.recommendation.rationale}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                  <strong>Market Demand</strong>
                  <p>Level: {insight.demand.level}</p>
                  <p>Trend: {insight.demand.trend}</p>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                  <strong>Price Band ({insight.price.currency})</strong>
                  <p>Min: {insight.price.min}</p>
                  <p>Avg: {insight.price.avg}</p>
                  <p>Max: {insight.price.max}</p>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '15px' }}>
                <strong>Risk Score: {insight.risk.score}/100</strong>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Level: {insight.risk.level}
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '12px' }}>
                  {insight.risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              <div className="card">
                <strong>Certification Checklist</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  {insight.certifications.map((c, i) => (
                    <li key={i} style={{ marginBottom: '10px' }}>
                      <div><strong>{c.name}</strong> ({c.authority})</div>
                      <div style={{ fontSize: '12px', color: c.mandatory ? '#dc2626' : '#64748b' }}>
                        {c.mandatory ? 'MANDATORY' : 'Optional'}
                      </div>
                      {c.notes.map((n, ni) => (
                        <div key={ni} style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>- {n}</div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="button" style={{ padding: '12px 24px', fontSize: '16px' }} onClick={downloadPDF}>Download Detailed Report (PDF)</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{ marginTop: '50px', padding: '20px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>DATA SOURCES:</strong> Directorate General of Foreign Trade (DGFT), Ministry of Commerce & Industry, Customs IceGate, and internal rule-based trade matrices (2025-26).
        </div>
        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <strong>GOVERNMENT-STYLE DISCLOSURE:</strong>
          <p style={{ marginTop: '5px', lineHeight: '1.4' }}>
            This directional advisory is generated based on codified trade regulations and historical market patterns. While every effort is made to maintain accuracy, exporters are advised to treat this as decision-support intelligence only. Final compliance must be verified with the respective Licensing Authorities and Customs Houses before shipment execution. The platform is not liable for regulatory changes or market fluctuations occurring after the date of insight generation.
          </p>
        </div>
        <p style={{ marginTop: '10px', textAlign: 'center' }}>© 2026 EXIM Insight India. Rule-based Validation MVP.</p>
      </footer>
    </div>
  );
}

export default App;
