import React from 'react';

interface InsightMetrics {
    rodtep_benefit: number;
    dbk_benefit: number;
    gst_benefit: number;
    total_incentives: number;
}

interface InsightData {
    metrics: InsightMetrics;
}

interface IncentiveEngineProps {
    baseCost: number;
    insight: InsightData;
}

export const IncentiveEngine: React.FC<IncentiveEngineProps> = ({ baseCost, insight }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-8 h-full flex flex-col transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Policy Realization Table</h4>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">Values in INR (₹)</span>
            </div>
            <div className="space-y-6 flex-1">
                <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Base FOB Unit Cost</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tighter font-mono">₹{baseCost.toLocaleString()}</span>
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
                        color="bg-slate-500 dark:bg-slate-700"
                        percentage={(insight.metrics.gst_benefit / baseCost) * 100}
                    />
                </div>
                <div className="pt-8 mt-auto border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Total Advantages</span>
                        <span className="text-4xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] font-mono">₹{insight.metrics.total_incentives.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-none">Net Benefit Realization</span>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tighter mt-1 font-mono hover:scale-105 transition-transform cursor-default">
                            +{((insight.metrics.total_incentives / baseCost) * 100).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IncentiveRow = ({ label, value, color, percentage }: { label: string, value: number, color: string, percentage: number }) => (
    <div className="space-y-2 group hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded -mx-2 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{label}</span>
            </div>
            <span className={`font-mono ${value > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-200'}`}>₹{value.toLocaleString()}</span>
        </div>
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`}
                style={{ width: `${Math.min(percentage * 5, 100)}%` }}
            ></div>
        </div>
    </div>
);
