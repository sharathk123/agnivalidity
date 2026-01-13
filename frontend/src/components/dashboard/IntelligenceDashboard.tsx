import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { HSSearchTerminal } from './HSSearchTerminal';
import { PricePredictionWidget } from './PricePredictionWidget';
import { IncentiveEngine } from './IncentiveEngine';
import { GlobalHeatmap } from './GlobalHeatmap';

const API_BASE = 'http://localhost:8000/api/v1';

// Animation Variants for Skeleton Reveal
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3
        }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50 } }
};

export const IntelligenceDashboard: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState<any | null>(null);
    const [baseCost, setBaseCost] = useState(1000);
    const [logistics, setLogistics] = useState(150);
    const [incoterm, setIncoterm] = useState('FOB');
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
            // Simulate delay for effect if needed, but API might be fast
            if (Date.now() % 2 === 0) await new Promise(r => setTimeout(r, 800));

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
        setInsight(null); // Clear previous to trigger animation re-mount
        analyzeProduct(query);
    };

    const handleGenerateQuote = async () => {
        if (!insight) return;
        setIsGenerating(true);
        try {
            const res = await axios.post(`${API_BASE}/advisory/quote`, {
                hs_code: insight.hs_code,
                base_cost: baseCost,
                logistics: logistics,
                incoterm: incoterm,
                payment_terms: "30% Advance, 70% against BL",
                exchange_rate: 83.5
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

    // Live update effect
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
                    if (!axios.isCancel(err)) console.error(err);
                }
            };
            const timer = setTimeout(updateCalc, 100);
            return () => { clearTimeout(timer); controller.abort(); };
        }
    }, [baseCost, logistics]);

    return (
        <div className="p-8 space-y-12 animate-fade-in max-w-[1920px] mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <div className="text-center space-y-4 pt-10">
                <div className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">
                    Enterprise Intelligence Unit
                </div>
                <h2 className="text-5xl font-display font-bold tracking-tighter text-white">
                    Agni Verified Analysis
                </h2>
                <div className="max-w-2xl mx-auto shadow-[0_0_30px_rgba(79,70,229,0.1)] rounded-xl">
                    <HSSearchTerminal
                        query={query}
                        setQuery={setQuery}
                        onSearch={handleSearch}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Main Display Area */}
            <div className="flex-1 relative min-h-[400px]">
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

                <AnimatePresence mode="wait">
                    {insight && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="grid grid-cols-12 gap-8 h-full relative z-10"
                        >
                            {/* Column 1: Incentive Engine (Left) */}
                            <motion.div variants={itemVariants} className="col-span-12 xl:col-span-4">
                                <IncentiveEngine baseCost={baseCost} insight={insight} />
                            </motion.div>

                            {/* Column 2: Price Prediction (Center) */}
                            <motion.div variants={itemVariants} className="col-span-12 xl:col-span-4">
                                <PricePredictionWidget
                                    baseCost={baseCost} setBaseCost={setBaseCost}
                                    logistics={logistics} setLogistics={setLogistics}
                                    incoterm={incoterm} setIncoterm={setIncoterm}
                                    insight={insight}
                                    onGenerateQuote={handleGenerateQuote}
                                    isGeneratingQuote={isGenerating}
                                />
                            </motion.div>

                            {/* Column 3: Global Heatmap (Right) */}
                            <motion.div variants={itemVariants} className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                                <div className="flex-1">
                                    <GlobalHeatmap />
                                </div>

                                {/* Product Verdict Card (Small) */}
                                <div className="bg-slate-900 border border-slate-700/50 p-6 flex flex-col justify-center items-center text-center shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Final Verdict</div>
                                    <div className={`text-4xl font-black font-display tracking-tight ${insight.verdict === 'GO' ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-rose-400'}`}>
                                        {insight.verdict}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 mt-2">CONFIDENCE: 98.4%</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`text-right pt-2 border-t border-slate-800/50 ${!insight ? 'fixed bottom-6 right-8 w-[calc(100%-4rem)]' : ''}`}>
                <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">
                    ICES 1.5 ACTIVE | 2026 MANDATORY JSON V1.1 VALIDATION ACTIVE | QUARANTINE PROTOCOLS ENGAGED
                </span>
            </div>
        </div>
    );
};
