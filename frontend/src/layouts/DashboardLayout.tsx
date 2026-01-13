import React from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">

                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center text-slate-400 text-sm">
                        <span>Passage</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-800 font-medium">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-brand-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-brand-500/20 active:scale-95">
                            + New Export
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-8 flex-1 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
