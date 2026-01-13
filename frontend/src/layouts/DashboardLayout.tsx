import React from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 font-sans flex text-slate-100">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative">

                {/* Header (HUD Status Ribbon) */}
                <header className="h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-40 px-8 flex items-center justify-between shadow-none">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Enterprise Terminal</span>
                        <span className="text-slate-700">|</span>
                        <div className="flex items-center text-slate-500 text-[11px] font-bold uppercase tracking-tight font-mono">
                            <span>Analysis</span>
                            <span className="mx-2 text-slate-700">/</span>
                            <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Scoring Engine</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border-l border-r border-slate-700/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">ICES 1.5 Sync: OK</span>
                        </div>

                        <div className="h-4 w-px bg-slate-800"></div>

                        <button className="text-slate-500 hover:text-indigo-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden pb-12 bg-slate-950">
                    {children}
                </main>

                {/* Regulatory Patch Footer (Sticky) */}
                <div className="fixed bottom-0 left-64 right-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 text-white py-2 px-6 z-40">
                    <div className="flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-emerald-400">ICES 1.5 ACTIVE (SYNC: OK)</span>
                        </span>
                        <span className="text-slate-700">|</span>
                        <span className="text-slate-400">2026 MANDATORY JSON V1.1 VALIDATION ACTIVE</span>
                        <span className="text-slate-700">|</span>
                        <span className="text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">QUARANTINE PROTOCOLS ENGAGED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
