import React from 'react';
import { Activity, Globe, TrendingUp } from 'lucide-react';

export const GlobalMarketPulse: React.FC = () => {
    return (
        <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.05)]">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight">Global Market Pulse</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Feed
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">LATENCY: 480ms</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 text-right">
                    <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-display">Verified Data Partners</div>
                        <div className="text-xl font-display font-bold text-white tracking-tight">24<span className="text-slate-600">/28</span></div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-display" title="Shows how stable global prices are for your selected product">Market Stability</div>
                        <div className="text-xl font-display font-bold text-emerald-400 tracking-tight">Low</div>
                    </div>
                </div>
            </div>

            {/* Content Utility Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Metric Cards */}
                <MetricCard
                    label="Rice (Non-Basmati)"
                    value="+12.4%"
                    subtext="Strong EU Demand"
                    icon={<Globe className="w-4 h-4 text-indigo-400" />}
                />
                <MetricCard
                    label="Spices (Turmeric)"
                    value="+8.2%"
                    subtext="Stable Output"
                    icon={<Activity className="w-4 h-4 text-indigo-400" />}
                />
                <MetricCard
                    label="Cotton Yarn 40s"
                    value="+2.1%"
                    subtext="Price Recovery"
                    icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
                />

                {/* Regional Heatmap (Visual Mock) */}
                <div className="bg-slate-950/50 border border-slate-800 rounded p-4 relative overflow-hidden group">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Regional Heatmap</div>
                    <div className="flex items-end gap-1 h-[40px] mt-4">
                        {[40, 60, 30, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:opacity-80 transition-opacity" style={{ height: `${h}%`, opacity: 0.6 + (i * 0.1) }}></div>
                        ))}
                    </div>
                    <div className="text-right text-[9px] font-mono text-emerald-400 mt-2 font-bold">+4.5% Aggregate</div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, subtext, icon }: any) => (
    <div className="bg-slate-950/50 border border-slate-800 rounded p-4 hover:border-indigo-500/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-900 rounded border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                {icon}
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono tracking-tight">{value}</div>
        </div>
        <div>
            <div className="text-[10px] font-black text-slate-200 uppercase tracking-widest truncate">{label}</div>
            <div className="text-[9px] font-medium text-slate-500 mt-0.5">{subtext}</div>
        </div>
    </div>
);
