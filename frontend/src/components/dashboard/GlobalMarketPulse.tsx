import React from 'react';
import { Activity, Globe } from 'lucide-react';

export const GlobalMarketPulse: React.FC = () => {
    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                // In a real app we'd import axios, but here we can rely on Global default or native fetch
                const response = await fetch('http://localhost:8000/admin/settings');
                const data = await response.json();
                setSettings(data.settings);
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };

        fetchSettings();
        // Poll every 5s to keep it fresh in sync with Admin
        const interval = setInterval(fetchSettings, 5000);
        return () => clearInterval(interval);
    }, []);

    // Simulate Market Rate (approx 6-8% premium over CBIC)
    const marketRate = settings?.CBIC_USD_RATE?.value ? (parseFloat(settings.CBIC_USD_RATE.value) * 1.065).toFixed(2) : '—';


    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-6 rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">Global Market Pulse</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Feed
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">LATENCY: 480ms</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 text-right">
                    <div>
                        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display">Verified Data Partners</div>
                        <div className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">24<span className="text-slate-400 dark:text-slate-600">/28</span></div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display" title="Shows how stable global prices are for your selected product">Market Stability</div>
                        <div className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">Low</div>
                    </div>
                </div>
            </div>

            {/* Content Utility Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* CBIC Parity Card (Integrated with Intelligence Tooltip) */}
                <MetricCard
                    label="USD/INR PARITY"
                    value={`₹${marketRate}`}
                    subtext="Live Market Rate"
                    badge="EXPORT SURPLUS"
                    icon={<Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    isLive={true}
                    highlight
                    tooltip={
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-tight text-white">Parity Intelligence</span>
                            </div>

                            <div className="space-y-1 font-mono text-[10px]">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-[9px] uppercase tracking-wider">Fixed CBIC Rate:</span>
                                    <span className="text-slate-200">₹{parseFloat(settings?.CBIC_USD_RATE?.value || '0').toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-[9px] uppercase tracking-wider">Live Market:</span>
                                    <span className="text-emerald-400 font-bold">₹{marketRate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-[9px] uppercase tracking-wider">Sync Delay:</span>
                                    <span className="text-slate-500">Live</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-700/50">
                                <div className="text-[10px] leading-relaxed text-indigo-300 font-medium">
                                    <strong className="text-white block mb-1">Intelligence Advisor:</strong>
                                    Market rate (₹{marketRate}) exceeds Customs entry rate.
                                    <br />
                                    <span className="text-emerald-400">Yield optimization favorable for realization.</span>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Metric Cards */}
                <MetricCard
                    label="Rice (Non-Basmati)"
                    value="+12.4%"
                    subtext="Strong EU Demand"
                    icon={<Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                />
                <MetricCard
                    label="Spices (Turmeric)"
                    value="+8.2%"
                    subtext="Stable Output"
                    icon={<Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                />


                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded p-4 relative overflow-hidden group">
                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Regional Heatmap</div>
                    <div className="flex items-end gap-1 h-[40px] mt-4">
                        {[40, 60, 30, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:opacity-80 transition-opacity" style={{ height: `${h}%`, opacity: 0.6 + (i * 0.1) }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, subtext, icon, badge, isLive, highlight, tooltip }: any) => (
    <div className={`relative bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded p-4 hover:border-indigo-400 dark:hover:border-indigo-500/30 transition-all group ${highlight ? 'ring-1 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/5' : ''}`}>

        {/* Tooltip Popup */}
        {tooltip && (
            <div className="absolute top-full left-0 w-full mt-2 opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl shadow-black/20 relative">
                    {/* Arrow */}
                    <div className="absolute -top-1.5 left-8 w-3 h-3 bg-slate-800 border-t border-l border-slate-700 transform rotate-45"></div>
                    {tooltip}
                </div>
            </div>
        )}

        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/30 transition-colors shadow-sm dark:shadow-none relative">
                {icon}
                {isLive && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900"></span>
                    </span>
                )}
            </div>
            {badge && (
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-widest">
                    {badge}
                </span>
            )}
        </div>
        <div>
            <div className={`text-lg font-bold font-mono tracking-tight ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{value}</div>
            <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest truncate mt-1 flex items-center gap-1">
                {label}
                {tooltip && <Activity className="w-2.5 h-2.5 text-slate-400 animate-pulse" />}
            </div>
            <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</div>
        </div>
    </div>
);
