import React from 'react';
import { CloudRain, Sun, Ship, Activity } from 'lucide-react';

const mockMonthlyData = [85, 88, 92, 98, 110, 115, 108, 95, 90, 88, 86, 84]; // Price Index

export const SeasonalitySignalCard: React.FC = () => {
    const currentMonthIndex = new Date().getMonth();


    // Normalize data for SVG path (height 60px)
    const maxVal = Math.max(...mockMonthlyData);
    const minVal = Math.min(...mockMonthlyData);
    const range = maxVal - minVal;

    const points = mockMonthlyData.map((val, idx) => {
        const x = (idx / 11) * 300; // Width 300px
        const y = 60 - ((val - minVal) / range) * 50; // Invert Y, keep padding
        return `${x},${y}`;
    }).join(' ');

    // Determine Phase
    let phase = 'SOWING';
    let phaseIcon = <CloudRain className="w-4 h-4 text-emerald-400" />;
    let phaseColor = 'text-emerald-400';

    if (currentMonthIndex >= 0 && currentMonthIndex <= 2) {
        phase = 'PEAK TRADING'; // Jan-Mar (Post Harvest)
        phaseIcon = <Activity className="w-4 h-4 text-indigo-400" />;
        phaseColor = 'text-indigo-400';
    } else if (currentMonthIndex >= 3 && currentMonthIndex <= 5) {
        phase = 'PEAK EXPORT';
        phaseIcon = <Ship className="w-4 h-4 text-emerald-400" />;
        phaseColor = 'text-emerald-400';
    } else if (currentMonthIndex >= 9) {
        phase = 'HARVEST';
        phaseIcon = <Sun className="w-4 h-4 text-amber-400" />;
        phaseColor = 'text-amber-400';
    }

    return (
        <div className="relative w-full bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50 p-4 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-slate-300 tracking-tighter font-display">SEASONALITY SIGNAL</h4>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border bg-slate-950/50 border-slate-700/50 ${phaseColor}`}>
                    {phaseIcon}
                    <span className="text-[9px] font-black uppercase tracking-widest">{phase}</span>
                </div>
            </div>

            <div className="relative h-[80px] w-full mb-2">
                {/* Sine Wave */}
                <svg width="100%" height="100%" viewBox="0 0 300 60" overflow="visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="seasonGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                    <path d={`M0,60 L${points} L300,60 Z`} fill="url(#seasonGradient)" fillOpacity="0.1" stroke="none" />
                    <path d={`M ${points}`} fill="none" stroke="url(#seasonGradient)" strokeWidth="2" strokeLinecap="round" />

                    {/* Current Month Indicator Line */}
                    <line
                        x1={(currentMonthIndex / 11) * 300} y1="0"
                        x2={(currentMonthIndex / 11) * 300} y2="60"
                        stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3"
                    />
                    <circle cx={(currentMonthIndex / 11) * 300} cy={60 - ((mockMonthlyData[currentMonthIndex] - minVal) / range) * 50} r="3" fill="#6366f1" />
                </svg>

                {/* Current Month Label */}
                <div className="absolute bottom-0 text-[9px] font-mono font-bold text-indigo-400 transform -translate-x-1/2" style={{ left: `${(currentMonthIndex / 11) * 100}%` }}>
                    TODAY
                </div>
            </div>

            <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                <span>Confidence: 92%</span>
                <span>Src: Tradestat_V2</span>
            </div>
        </div>
    );
};
