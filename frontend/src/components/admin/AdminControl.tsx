import React from 'react';
import { GlobalMarketPulse } from '../dashboard/GlobalMarketPulse';
import { TelemetryStream } from '../dashboard/TelemetryStream';

export const AdminControl: React.FC = () => {
    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-[1920px] mx-auto min-h-screen flex flex-col">

            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-black font-display text-white tracking-tighter uppercase">Market Watchtower</h2>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Global Surveillance Hub</div>
                </div>
            </div>

            {/* 1. Global Market Pulse (Top Widget) */}
            <div className="w-full">
                <GlobalMarketPulse />
            </div>

            {/* 2. Telemetry Stream (Bottom Widget) */}
            <div className="flex-1 w-full min-h-[400px] border-t border-slate-800/50 pt-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] font-display">Live Verification Feed</span>
                    <div className="h-px bg-indigo-500/20 flex-1"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <TelemetryStream />
            </div>

            <div className="text-right pt-4 border-t border-slate-800/50 mt-auto">
                <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">
                    SYSTEM_ID: AGNI-01
                </span>
            </div>
        </div>
    );
};
