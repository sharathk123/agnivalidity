import React from 'react';
import { Globe } from 'lucide-react';

export const GlobalHeatmap: React.FC = () => {
    return (
        <div className="bg-slate-900 border border-slate-700/50 p-8 h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">Demand Heatmap</h4>
                <Globe className="w-4 h-4 text-emerald-500/50" />
            </div>

            <div className="flex-1 relative z-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-full grid grid-cols-2 gap-4">
                    <RegionCard region="North America" sentiment="High" color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                    <RegionCard region="European Union" sentiment="Moderate" color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                    <RegionCard region="MENA Region" sentiment="Stable" color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
                    <RegionCard region="ASEAN" sentiment="Growing" color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
                </div>

                <div className="w-full mt-4 p-4 border border-slate-800 bg-slate-950/50 rounded-lg">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Live Export Volume</div>
                    <div className="flex items-end gap-1 h-16">
                        {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-400/40 transition-colors rounded-sm relative group" style={{ height: `${h}%` }}>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] font-mono text-emerald-400 transition-opacity">{h}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RegionCard = ({ region, sentiment, color, bg, border }: any) => (
    <div className={`p-4 rounded border ${bg} ${border} transition-all hover:scale-[1.02] cursor-default`}>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{region}</div>
        <div className={`text-sm font-bold ${color} uppercase tracking-wide`}>{sentiment}</div>
    </div>
);
