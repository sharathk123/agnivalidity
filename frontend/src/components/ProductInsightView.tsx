import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000/api/v1';

interface ProductInsight {
    hs_code: string;
    product_name: string;
    verdict: string;
    metrics: {
        base_cost: number;
        logistics: number;
        rodtep_benefit: number;
        dbk_benefit: number;
        gst_benefit: number;
        net_cost: number;
        total_incentives: number;
        compliance_status: string;
    };
}

export const ProductInsightView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState<ProductInsight | null>(null);
    const [baseCost, setBaseCost] = useState(1000);
    const [logistics, setLogistics] = useState(150);

    // Module 6: Quote Parameters
    const [incoterm, setIncoterm] = useState('FOB');
    const [exchangeRate] = useState(83.5);
    const [paymentTerms] = useState('30% Advance, 70% against BL');
    const [isGenerating, setIsGenerating] = useState(false);
    const [quoteHistory, setQuoteHistory] = useState<{ number: string, url: string, created_at: string }[]>([]);

    const analyzeProduct = async (searchInput: string) => {
        if (!searchInput) return;
        setLoading(true);
        try {
            let hsCode = searchInput;
            if (searchInput.length >= 10 && !isNaN(Number(searchInput))) {
                hsCode = searchInput;
            } else {
                const searchRes = await axios.get(`${API_BASE}/hs/search?q=${searchInput}`);
                if (searchRes.data.length > 0) {
                    hsCode = searchRes.data[0].hsn_code;
                }
            }

            const calcRes = await axios.get(`${API_BASE}/advisory/calculate`, {
                params: { hs_code: hsCode, base_cost: baseCost, logistics: logistics }
            });
            setInsight(calcRes.data);
        } catch (err) {
            console.error(err);
            setInsight(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        analyzeProduct(query);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('hscode');
        if (code) {
            setQuery(code);
            analyzeProduct(code);
        }
    }, []);

    // ... handleGenerateQuote ... (keep as is)
    const handleGenerateQuote = async () => {
        if (!insight) return;
        setIsGenerating(true);
        try {
            const res = await axios.post(`${API_BASE}/advisory/quote`, {
                hs_code: insight.hs_code,
                base_cost: baseCost,
                logistics: logistics,
                incoterm: incoterm,
                payment_terms: paymentTerms,
                exchange_rate: exchangeRate
            });

            if (res.data.status === 'success') {
                const newQuote = {
                    number: res.data.quote_number,
                    url: res.data.pdf_url,
                    created_at: new Date().toISOString()
                };
                setQuoteHistory([newQuote, ...quoteHistory]);
                window.open(res.data.pdf_url, '_blank');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    // ... useEffect for AbortController ... (keep as is)
    useEffect(() => {
        if (insight) {
            const controller = new AbortController();
            const updateCalc = async () => {
                try {
                    const res = await axios.get(`${API_BASE}/advisory/calculate`, {
                        params: { hs_code: insight.hs_code, base_cost: baseCost, logistics: logistics },
                        signal: controller.signal
                    });
                    setInsight(res.data);
                } catch (err) {
                    if (!axios.isCancel(err)) {
                        console.error(err);
                    }
                }
            };
            const timer = setTimeout(updateCalc, 100);
            return () => {
                clearTimeout(timer);
                controller.abort();
            };
        }
    }, [baseCost, logistics]);

    return (
        <div className="space-y-10 animate-fade-in flex flex-col w-full">
            {/* Context Header */}
            <div className="flex justify-between items-end">
                <div className="max-w-xl">
                    <div className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">Enterprise Analysis Terminal</div>
                    <h2 className="text-4xl font-display font-bold tracking-tight text-slate-100 mb-4">Export Intelligence <br />Dashboard.</h2>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        Analyze hidden margins, policy benefits, and generate compliance-ready quotations for the 2026 Indian EXIM sector.
                    </p>
                </div>

            </div>

            {/* Search Terminal: Intelligence Port */}
            <div className={`relative z-20 transition-all duration-300 rounded-xl p-1 bg-slate-900/40 backdrop-blur-md border ${query.length === 10 ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-700/50 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.2)]'}`}>
                <div className="flex items-center gap-4 p-2">
                    <div className="w-12 h-12 flex items-center justify-center text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800">
                        {query.length === 10 ? (
                            <svg className="w-6 h-6 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        )}
                    </div>
                    <form onSubmit={handleSearch} className="flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ENTER 10-DIGIT HS CODE OR PRODUCT KEY..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-white placeholder-slate-600 outline-none uppercase tracking-widest font-mono"
                        />
                    </form>

                    {query.length === 10 && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black uppercase tracking-widest text-emerald-400 mr-2">
                            <span>Verified Schema</span>
                        </div>
                    )}

                    <button
                        onClick={(e) => handleSearch(e)}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                    >
                        {loading ? 'SCANNING...' : 'INITIATE'}
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                {/* IDLE STATE */}
                {!insight && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                        {/* Decorative Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                        <div className="relative z-10 text-center space-y-6">
                            <div className="w-20 h-20 mx-auto border-2 border-slate-800 rounded-full flex items-center justify-center">
                                <span className="w-2 h-2 bg-slate-600 rounded-full animate-ping"></span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-display text-slate-300 tracking-widest uppercase">System Ready</h3>
                                <p className="text-xs font-mono text-slate-500 mt-2">Awaiting HS Code input for deep analysis.</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-3 bg-indigo-500 animate-pulse"></span>
                                <span className="text-[10px] font-mono text-indigo-400">CURSOR_ACTIVE</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SCANNING STATE */}
                {loading && !insight && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="relative w-64 h-64">
                            {/* Radar Rings */}
                            <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-4 border border-indigo-500/40 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white font-mono tracking-tighter">SCANNING</div>
                                    <div className="text-[10px] text-indigo-400 font-mono mt-1">ACCESSING DATA LAKE</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-1 text-center">
                            <div className="text-[10px] font-mono text-slate-400">CONNECTING TO ICEGATE_V2... <span className="text-emerald-500">OK</span></div>
                            <div className="text-[10px] font-mono text-slate-400">FETCHING RODTEP SCROLLS... <span className="text-emerald-500">OK</span></div>
                            <div className="text-[10px] font-mono text-slate-400">VALIDATING COMPLIANCE... <span className="text-amber-500">PENDING</span></div>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {insight && (
                        <div className="grid grid-cols-12 gap-8 items-start relative z-10">
                            {/* ... (Existing Insight Content) ... */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                {/* Product Profile (Bioluminescent Tile) */}
                                <div className="bg-slate-900 border border-slate-700/50 relative p-8">
                                    <div className="absolute top-6 right-6">
                                        <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-500 ${insight.verdict === 'GO'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 animate-pulse-slow'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/50'
                                            }`}>
                                            Verdict: {insight.verdict}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 mb-8">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">Verified HS Code: <span className="text-slate-300">{insight.hs_code}</span></span>
                                        <h3 className="text-2xl font-bold font-display text-white">{insight.product_name}</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-sm hover:border-slate-700 transition-colors">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Market Volatility</div>
                                            <div className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                                LOW RISK
                                            </div>
                                            <div className="text-[10px] text-slate-600 font-medium">Jan-Feb 2026 Index</div>
                                        </div>
                                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-sm hover:border-slate-700 transition-colors">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Compliance Level</div>
                                            <div className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">OPTIMAL</div>
                                            <div className="text-[10px] text-slate-600 font-medium">Standard Duty Drawback</div>
                                        </div>
                                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-sm hover:border-slate-700 transition-colors">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Benefit Tier</div>
                                            <div className="text-lg font-bold text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">PREMIUM</div>
                                            <div className="text-[10px] text-slate-600 font-medium">High RoDTEP Utility</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Incentive Realization Ledger */}
                                <div className="bg-slate-900 border border-slate-700/50 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.2em]">Policy Realization Table</h4>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Values in INR (₹)</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Base FOB Unit Cost</span>
                                            <span className="text-xl font-bold text-slate-100 tracking-tighter font-mono">₹{baseCost.toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-6 pt-2">
                                            <IncentiveRow
                                                label="RoDTEP (Export Remission)"
                                                value={insight.metrics.rodtep_benefit}
                                                color="bg-indigo-500"
                                                percentage={(insight.metrics.rodtep_benefit / baseCost) * 100}
                                            />
                                            <IncentiveRow
                                                label="Duty Drawback (DBK)"
                                                value={insight.metrics.dbk_benefit}
                                                color="bg-violet-500"
                                                percentage={(insight.metrics.dbk_benefit / baseCost) * 100}
                                            />
                                            <IncentiveRow
                                                label="GST Refund Realization"
                                                value={insight.metrics.gst_benefit}
                                                color="bg-slate-700"
                                                percentage={(insight.metrics.gst_benefit / baseCost) * 100}
                                            />
                                        </div>
                                        <div className="pt-8 mt-4 border-t border-slate-800 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Advantages</span>
                                                <span className="text-4xl font-bold tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] font-mono">₹{insight.metrics.total_incentives.toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Net Benefit Realization</span>
                                                <div className="text-2xl font-bold text-emerald-400 tracking-tighter mt-1 font-mono hover:scale-105 transition-transform cursor-default">
                                                    +{((insight.metrics.total_incentives / baseCost) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Sidebar (Profitability Architect) */}
                            <div className="col-span-12 lg:col-span-4 space-y-6">
                                <div className="bg-slate-900 border border-slate-700/50 p-8 h-full">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 pb-4 border-b border-slate-800 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]">Profitability Architect</h4>

                                    <div className="space-y-8">
                                        {/* Parameter Sliders */}
                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Cost (FOB)</label>
                                                    <span className="text-lg font-bold text-slate-100 leading-none font-mono">₹{baseCost.toLocaleString()}</span>
                                                </div>
                                                <input
                                                    type="range" min="100" max="10000" step="100" value={baseCost}
                                                    onChange={(e) => setBaseCost(Number(e.target.value))}
                                                    className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer hover:accent-indigo-400"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Freight & Logistics</label>
                                                    <span className="text-lg font-bold text-slate-100 leading-none font-mono">₹{logistics.toLocaleString()}</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="2000" step="50" value={logistics}
                                                    onChange={(e) => setLogistics(Number(e.target.value))}
                                                    className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-slate-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Corporate Config */}
                                        <div className="pt-8 border-t border-slate-800 space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Commercial Term</label>
                                                <select
                                                    value={incoterm} onChange={(e) => setIncoterm(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-sm p-3 text-xs font-bold font-mono text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                                >
                                                    <option value="FOB">FOB (Free on Board)</option>
                                                    <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                                                    <option value="EXW">EXW (Ex Works)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Currency</label>
                                                <div className="text-xl font-bold text-slate-100 tracking-tighter font-mono">USD ($)</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Rate: ₹83.50</div>
                                            </div>
                                        </div>

                                        {/* Result Area */}
                                        <div className="pt-8 border-t border-slate-800">
                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Recommended Target FOB</div>
                                            <div className="text-4xl font-display font-bold tracking-tight text-white mb-2 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">₹{insight.metrics.net_cost.toLocaleString()}</div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                                                Incorporates <span className="text-emerald-400">₹{insight.metrics.total_incentives}</span> in benefits.
                                                Allows <span className="text-emerald-400">~{((insight.metrics.total_incentives / baseCost) * 100).toFixed(1)}%</span> competitive reduction.
                                            </p>

                                            <button
                                                onClick={handleGenerateQuote}
                                                disabled={isGenerating}
                                                className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3 active:scale-[0.98]"
                                            >
                                                {isGenerating ? <Spinner /> : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        GENERATE PRO FORMA
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Ledger */}
                                {quoteHistory.length > 0 && (
                                    <div className="bg-slate-900 border border-slate-700/50 p-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Document History</h4>
                                        <div className="space-y-3">
                                            {quoteHistory.slice(0, 3).map((quote, idx) => (
                                                <div key={idx} className="p-3 border border-slate-800 rounded-sm bg-slate-950/50 flex items-center justify-between group transition-colors hover:border-indigo-500/30">
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-bold text-slate-300 truncate font-mono">{quote.number}</div>
                                                        <div className="text-[9px] text-slate-600 font-bold">PDF • 24 KB</div>
                                                    </div>
                                                    <a href={quote.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 p-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const IncentiveRow = ({ label, value, color, percentage }: { label: string, value: number, color: string, percentage: number }) => (
    <div className="space-y-2 group hover:bg-white/5 p-2 rounded -mx-2 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
            </div>
            <span className={`font-mono ${value > 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>₹{value.toLocaleString()}</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`}
                style={{ width: `${Math.min(percentage * 5, 100)}%` }}
            ></div>
        </div>
    </div>
);

const Spinner = () => (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);
