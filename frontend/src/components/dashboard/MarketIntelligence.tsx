import React, { useState } from 'react';
import { Zap, Activity, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlobalMarketPulse } from './GlobalMarketPulse';
import { TelemetryStream } from './TelemetryStream';
import { SeasonalitySignalCard } from './SeasonalitySignalCard';
import { Skeleton } from '../ui/Skeleton';

const chartData = [
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

export const MarketIntelligence: React.FC = () => {
    const [viewMode, setViewMode] = useState<'PRICE' | 'PROFIT'>('PRICE');
    const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate Data Fetching
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="p-6 h-screen flex flex-col gap-6 animate-fade-in overflow-hidden relative">

            {/* 1. Global Market Pulse (Sticky Top / Header) */}
            <div className="shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white tracking-tighter uppercase">Market Intelligence</h2>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">Consolidated Surveillance & Analytics Hub</div>
                    </div>
                </div>
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div>
                                    <Skeleton className="w-48 h-6 mb-2" />
                                    <Skeleton className="w-32 h-4" />
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="space-y-1">
                                    <Skeleton className="w-32 h-3" />
                                    <Skeleton className="w-16 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="w-32 h-3" />
                                    <Skeleton className="w-16 h-8" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-24 rounded" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <GlobalMarketPulse />
                )}
            </div>

            {/* 2. Main Content Area (Signals + Trends) */}
            <div className="flex-1 min-h-0 flex gap-6">

                {/* Left Panel: Market Signals Feed (30%) */}
                <div className="w-[30%] bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest font-display">Live Signals</h3>
                    </div>

                    {/* Seasonality Signal */}
                    {isLoading ? (
                        <Skeleton className="h-32 w-full rounded-lg mb-4" />
                    ) : (
                        <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800/50">
                            <SeasonalitySignalCard />
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-3 border-l-2 border-slate-200 dark:border-slate-800">
                                    <Skeleton className="w-24 h-3 mb-2" />
                                    <Skeleton className="w-full h-8" />
                                </div>
                            ))
                        ) : (
                            signals.map(signal => (
                                <div key={signal.id} className="p-3 bg-slate-50 dark:bg-slate-900 border-l-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group cursor-pointer">
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${signal.type === 'CRITICAL' ? 'text-rose-500 dark:text-rose-400' :
                                        signal.type === 'RISK' ? 'text-amber-500 dark:text-amber-400' :
                                            signal.type === 'OPPORTUNITY' ? 'text-emerald-600 dark:text-emerald-400' :
                                                'text-indigo-600 dark:text-indigo-400'
                                        }`}>
                                        [{signal.type}]
                                    </span>
                                    <p className="text-[10px] font-mono text-slate-600 dark:text-emerald-100/80 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                                        {signal.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Trend Engine (70%) */}
                <div className="w-[70%] bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col relative group shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            <div>
                                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest font-display">Trend Engine</h3>
                                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase">Real-time Analytics</div>
                            </div>
                        </div>

                        {/* Chart Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded p-0.5">
                            <button onClick={() => setViewMode('PRICE')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'PRICE' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Price</button>
                            <button onClick={() => setViewMode('PROFIT')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'PROFIT' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Profit</button>
                        </div>
                    </div>

                    <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/20 rounded border border-slate-200 dark:border-slate-700/30">
                        {isLoading ? (
                            <div className="w-full h-full p-4 flex flex-col justify-end space-y-4">
                                <Skeleton className="w-full h-[80%]" />
                                <div className="flex justify-between">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <Skeleton key={i} className="w-8 h-4" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1e293b]" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                        itemStyle={{ fontSize: '12px' }}
                                        labelStyle={{ fontSize: '10px', color: '#94a3b8' }}
                                    />
                                    <Area type="monotone" dataKey={viewMode === 'PRICE' ? 'price' : 'profit'} stroke={viewMode === 'PRICE' ? '#818cf8' : '#34d399'} fillOpacity={1} fill={`url(#${viewMode === 'PRICE' ? 'colorPrice' : 'colorProfit'})`} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Telemetry Stream (Collapsible Footer Drawer) - ALWAYS DARK */}
            <div className={`transition-all duration-300 ease-in-out bg-slate-950 border-t border-slate-800 ${isTelemetryOpen ? 'h-64' : 'h-10'} shrink-0 -mx-6 -mb-6 relative flex flex-col`}>
                <button
                    onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
                    className="w-full h-10 bg-slate-900/50 hover:bg-slate-900 flex items-center justify-between px-6 border-b border-slate-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-indigo-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-display">System Telemetry Stream</span>
                    </div>
                    {isTelemetryOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
                </button>
                <div className="flex-1 overflow-hidden relative">
                    <TelemetryStream />
                </div>
            </div>
        </div>
    );
};

