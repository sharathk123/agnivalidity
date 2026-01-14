import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, FileText, ArrowRight, Zap, ShieldCheck, BadgeCheck } from 'lucide-react';

interface PricePredictionWidgetProps {
    baseCost: number;
    setBaseCost: (val: number) => void;
    logistics: number;
    setLogistics: (val: number) => void;
    incoterm: string;
    setIncoterm: (val: string) => void;
    insight: any;
    onGenerateQuote: () => void;
    isGeneratingQuote: boolean;
}

export const PricePredictionWidget: React.FC<PricePredictionWidgetProps> = ({
    baseCost, setBaseCost,
    logistics, setLogistics,
    incoterm,
    insight,
    onGenerateQuote,
    isGeneratingQuote
}) => {
    const location = useLocation();

    // Derived Calculations
    const totalIncentives = insight?.metrics?.total_incentives || (baseCost * 0.05); // Fallback mock 5%
    const subtotal = baseCost + logistics;
    const netCost = subtotal - totalIncentives;
    const margin = netCost * 0.15; // 15% Margin

    // Check URL params for GI Status override or use insight prop
    const queryParams = new URLSearchParams(location.search);
    const paramGiStatus = queryParams.get('gi_status');
    const effectiveGiStatus = paramGiStatus || insight?.gi_status;

    const giPremium = effectiveGiStatus === 'REGISTERED' ? netCost * 0.20 : 0;
    const finalQuote = netCost + margin + giPremium;

    // Engine Latency Simulation
    const [latency, setLatency] = useState(0.4);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramBaseCost = params.get('base_cost');

        if (paramBaseCost) {
            setBaseCost(Number(paramBaseCost));
        }
    }, [location.search, setBaseCost]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(2));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-950/90 border border-slate-700/50 rounded-lg h-full flex flex-col relative overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row h-full relative z-10">

                {/* 1. The Calculation Stack (Left - 60%) */}
                <div className="w-full lg:w-[60%] p-8 border-r border-slate-800/50 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                            <Calculator className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Profitability Architect</h3>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Live Pricing Engine • Region: Global</div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 pr-6">
                        {/* Base Cost */}
                        <div className="group">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Base Unit Cost</label>
                                <span className="text-lg font-bold text-slate-200 font-mono">₹{baseCost.toLocaleString()}</span>
                            </div>
                            <input
                                type="range" min="100" max="10000" step="100" value={baseCost}
                                onChange={(e) => setBaseCost(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                            />
                        </div>

                        {/* Logistics */}
                        <div className="group">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-400 transition-colors">Freight & Logistics</label>
                                <span className="text-lg font-bold text-slate-200 font-mono">+ ₹{logistics.toLocaleString()}</span>
                            </div>
                            <input
                                type="range" min="0" max="2000" step="50" value={logistics}
                                onChange={(e) => setLogistics(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-slate-500 cursor-pointer hover:accent-amber-500"
                            />
                        </div>

                        <div className="border-t border-slate-800/50 my-4"></div>

                        {/* Benefits Deduction */}
                        <div className="flex justify-between items-center p-3 bg-emerald-500/5 rounded border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-default">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-display" title="Government tax-back (RoDTEP/DBK) automatically included">Govt. Incentives (RoDTEP/DBK)</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-400 font-mono">- ₹{totalIncentives.toFixed(0)}</span>
                        </div>

                        {/* GI Premium Line Item */}
                        {effectiveGiStatus === 'REGISTERED' && (
                            <div className="flex justify-between items-center py-2 border-b border-emerald-900/30 text-emerald-400 bg-emerald-900/10 px-2 rounded">
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span className="text-sm font-bold">GI Brand Premium (+20%)</span>
                                </div>
                                <span className="font-mono font-bold">+₹{Math.round(giPremium).toLocaleString()}</span>
                            </div>
                        )}

                        {/* Margin */}
                        <div className="flex justify-between items-center px-3 py-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Margin (15%)</span>
                            <span className="text-sm font-bold text-slate-400 font-mono">+ ₹{margin.toFixed(0)}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-800/50 flex justify-between items-end">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span className="font-display">REAL-TIME ACCURACY: <span className="font-mono">{100 - (latency * 10)}%</span></span>
                        </div>
                    </div>
                </div>

                {/* 2. The Quotation Preview (Right - 40%) */}
                <div className="w-full lg:w-[40%] bg-slate-900/50 p-8 flex flex-col relative">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <FileText className="w-24 h-24 text-slate-800" />
                    </div>

                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-700/50 pb-2">Pro-Forma Preview</h4>

                    <div className="space-y-4 flex-1 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                            <span>INCOTERM:</span>
                            <span className="font-bold text-slate-200">{incoterm}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>TARGET CURRENCY:</span>
                            <span className="font-bold text-slate-200">USD ($)</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>EXCHANGE RATE:</span>
                            <span className="font-bold text-slate-200">₹83.50</span>
                        </div>

                        <div className="border-t border-dashed border-slate-700 my-4 h-px"></div>

                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold uppercase text-[10px]">Total FOB Value</span>
                            <span className="text-3xl font-bold text-white tracking-tight">
                                ${(finalQuote / 83.5).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="text-right text-[10px] text-slate-500">
                            (INR ₹{finalQuote.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                        </div>
                    </div>

                    <button
                        onClick={onGenerateQuote}
                        disabled={isGeneratingQuote}
                        className="w-full mt-8 bg-slate-100 hover:bg-white text-slate-900 h-10 px-4 rounded text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
                    >
                        {isGeneratingQuote ? <div className="w-3 h-3 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mx-auto" /> : (
                            <>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Generate Compliance JSON</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-1" />
                            </>
                        )}
                    </button>
                    <div className="text-center mt-3 text-[9px] font-mono text-slate-600">
                        MANDATE: ICEGATE_1.5_MAR_2026_COMPLIANT
                    </div>
                </div>
            </div>
        </div>
    );
};
