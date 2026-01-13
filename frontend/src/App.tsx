import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminCommandCenter } from './components/admin/CommandCenter';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Card } from './components/ui/Card';

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
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Market Intelligence</h2>
          <p className="text-slate-500 mt-1">Validate trade compliance and market demand in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Search & Select */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="1. Route Configuration" className="border-t-4 border-t-brand-500">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product / HS Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 09103030 or Turmeric"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
                    🔍
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination Market</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm bg-white"
                  onChange={e => {
                    const c = countries.find(x => x.id === parseInt(e.target.value));
                    setSelectedCountry(c || null);
                    if (selectedHSN && c) getInsights(selectedHSN.id, c.id);
                  }}
                >
                  <option value="">-- Select Country --</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </form>
          </Card>

          {/* Search Results */}
          <div className="space-y-3">
            {loading && !insight && (
              <div className="text-center py-8 text-slate-500 animate-pulse">Scanning Trade Database...</div>
            )}

            {!loading && hsnResults.length > 0 && (
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Did you mean:</div>
            )}

            {hsnResults.map(h => (
              <div
                key={h.id}
                onClick={() => {
                  setSelectedHSN(h);
                  if (selectedCountry) getInsights(h.id, selectedCountry.id);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedHSN?.id === h.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-white border-slate-200 hover:border-brand-300'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-brand-700 font-bold bg-brand-100 px-2 py-0.5 rounded text-sm">{h.hsn_code}</span>
                  {selectedHSN?.id === h.id && <span className="text-brand-600 text-lg">✓</span>}
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{h.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Advisory Results */}
        <div className="lg:col-span-8">
          {!insight && (
            <div className="h-full flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">👋</div>
              <h3 className="text-lg font-medium text-slate-900">Welcome to Agni EXIM</h3>
              <p className="text-slate-500 max-w-sm mt-2">Select a product and destination to generate a real-time compliance and opportunity report.</p>
            </div>
          )}

          {insight && selectedHSN && selectedCountry && (
            <div className="space-y-6 animate-slide-up">

              {/* Verdict Card */}
              <div className={`rounded-xl p-6 border-l-8 shadow-sm ${insight.recommendation.action === 'GO' ? 'bg-gradient-to-r from-emerald-50 to-white border-l-emerald-500' : insight.recommendation.action === 'CAUTION' ? 'bg-gradient-to-r from-amber-50 to-white border-l-amber-500' : 'bg-gradient-to-r from-red-50 to-white border-l-red-500'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Recommendation</div>
                    <div className={`text-4xl font-black tracking-tight ${insight.recommendation.action === 'GO' ? 'text-emerald-700' : insight.recommendation.action === 'CAUTION' ? 'text-amber-700' : 'text-red-700'}`}>
                      {insight.recommendation.action}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{selectedHSN.hsn_code} ➔ {selectedCountry.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <p className="mt-4 text-slate-700 leading-relaxed max-w-2xl font-medium border-t border-black/5 pt-4">
                  {insight.recommendation.rationale}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Market Demand */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📈</div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Market Demand</h4>
                  <div className="text-2xl font-bold text-slate-900">{insight.demand.level}</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold mt-2 ${insight.demand.trend === 'UP' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    TREND: {insight.demand.trend}
                  </div>
                </Card>

                {/* Price Band */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💰</div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg Price</h4>
                  <div className="text-2xl font-bold text-slate-900">
                    {insight.price.currency} {insight.price.avg}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Range: {insight.price.min} - {insight.price.max}
                  </div>
                </Card>

                {/* Risk Score */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🛡️</div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Score</h4>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-bold text-slate-900">{insight.risk.score}</div>
                    <div className="text-sm text-slate-400 mb-1">/ 100</div>
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-2 uppercase">{insight.risk.level} Risk</div>
                </Card>
              </div>

              {/* Certs & Risk Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Compliance Checklist">
                  <ul className="space-y-4">
                    {insight.certifications.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${c.mandatory ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.authority}</div>
                          {c.notes.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                              {c.notes[0]}
                            </div>
                          )}
                        </div>
                        {c.mandatory && <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Mandatory</span>}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Risk Analysis">
                  <ul className="space-y-3">
                    {insight.risk.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="text-amber-500 mt-0.5">⚠️</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20" onClick={downloadPDF}>
                      <span>📄</span>
                      <span>Download Full Report</span>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-slate-400 pb-8">
        Data cached from DGFT & UN Comtrade. Last updated: {new Date().toLocaleDateString()}. use at own risk.
      </div>
    </DashboardLayout>
  );
}

export default App;
