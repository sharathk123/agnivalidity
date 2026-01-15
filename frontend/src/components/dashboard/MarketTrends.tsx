import React, { useState } from 'react';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SeasonalitySignalCard } from './SeasonalitySignalCard';
import { useTheme } from '../../contexts/ThemeContext';

const data = [
    { name: 'Jan', price: 4000, profit: 2400 },
    { name: 'Feb', price: 3000, profit: 1398 },
    { name: 'Mar', price: 2000, profit: 9800 },
    { name: 'Apr', price: 2780, profit: 3908 },
    { name: 'May', price: 1890, profit: 4800 },
    { name: 'Jun', price: 2390, profit: 3800 },
    { name: 'Jul', price: 3490, profit: 4300 },
];

const signals = [
    { id: 1, text: "High Demand Detected: HS 091030 (Turmeric) in EU-Region.", type: "OPPORTUNITY" },
    { id: 2, text: "Logistics Delay: Suez Route congestion index up by 12%.", type: "RISK" },
    { id: 3, text: "Currency Fluctuation: INR/USD varies by +0.4% this week.", type: "NEUTRAL" },
    { id: 4, text: "Regulatory Update: New pesticide norms for Basmati in KSA.", type: "CRITICAL" },
    { id: 5, text: "Trend Alert: Organic Cotton Yarn demand spikes in Vietnam.", type: "OPPORTUNITY" },
    { id: 6, text: "Duty Drawback: Rates revised for Chapter 62 (Apparel).", type: "INFO" },
    { id: 7, text: "Container Availability: Shortage reported at Mundra Port.", type: "RISK" },
    { id: 8, text: "Buyer Inquiry: Bulk requirement for Chilies from USA.", type: "OPPORTUNITY" },
];

export const MarketTrends: React.FC = () => {
    const [viewMode, setViewMode] = useState<'PRICE' | 'PROFIT'>('PRICE');
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const chartColors = {
        grid: isDarkMode ? "#1e293b" : "#e2e8f0",
        axis: isDarkMode ? "#475569" : "#64748b",
        tooltipBg: isDarkMode ? "#0f172a" : "#ffffff",
        tooltipBorder: isDarkMode ? "#334155" : "#e2e8f0",
        tooltipText: isDarkMode ? "#94a3b8" : "#64748b"
    };

    return (
        <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6 relative overflow-hidden group h-full flex flex-col shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-colors duration-300">


            <div className="flex flex-col lg:flex-row gap-6 h-full relative z-10">

                {/* 1. The Signal Feed (Left Column - 30%) */}
                <div className="w-full lg:w-[30%] flex flex-col gap-4 border-r border-slate-200 dark:border-slate-800/50 pr-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded border border-emerald-200 dark:border-emerald-500/20">
                            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest font-display">Market Signals</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {signals.map(signal => (
                            <div key={signal.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border-l-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all group/signal">
                                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${signal.type === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
                                    signal.type === 'RISK' ? 'text-amber-600 dark:text-amber-400' :
                                        signal.type === 'OPPORTUNITY' ? 'text-emerald-600 dark:text-emerald-400' :
                                            'text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                    [{signal.type}]
                                </span>
                                <p className="text-[10px] font-mono text-slate-600 dark:text-emerald-100/80 leading-relaxed group-hover/signal:text-slate-900 dark:group-hover/signal:text-white transition-colors">
                                    {signal.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. The Trend Engine (Center - 70%) */}
                <div className="w-full lg:w-[70%] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded border border-indigo-200 dark:border-indigo-500/20">
                                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest font-display">Trend Engine</h3>
                                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                    Real-time Analytics • 18/18 Source Streams
                                </div>
                            </div>
                        </div>

                        {/* Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1">
                            <button
                                onClick={() => setViewMode('PRICE')}
                                className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'PRICE' ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Global Price
                            </button>
                            <button
                                onClick={() => setViewMode('PROFIT')}
                                className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'PROFIT' ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Profit Realization
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 relative shadow-inner dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        <SeasonalitySignalCard />
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10 pointer-events-none">
                            <TrendingUp className="w-96 h-96 text-slate-300 dark:text-slate-800" />
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke={chartColors.axis}
                                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke={chartColors.axis}
                                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '4px' }}
                                    itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                                    labelStyle={{ fontFamily: 'JetBrains Mono', color: chartColors.tooltipText, fontSize: '10px', marginBottom: '4px' }}
                                    formatter={(value: any) => [`$${value}`, viewMode === 'PRICE' ? 'Global Price' : 'Profit']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={viewMode === 'PRICE' ? 'price' : 'profit'}
                                    stroke={viewMode === 'PRICE' ? '#818cf8' : '#34d399'}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#${viewMode === 'PRICE' ? 'colorPrice' : 'colorProfit'})`}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="text-right pt-4 border-t border-slate-200 dark:border-slate-800/50 mt-auto flex justify-between items-end">
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-widest pl-2">
                    Source: Agni Intelligence Network • 18 Streams Active
                </div>
                <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                    ICES 1.5 ACTIVE | SYSTEM_ID: AGNI-01
                </span>
            </div>
        </div>
    );
};


