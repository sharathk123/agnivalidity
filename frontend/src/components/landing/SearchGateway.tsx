import React, { useState } from 'react';
import { Zap, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchGateway: React.FC = () => {
    const [hsCode, setHsCode] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate or trigger analysis
        const url = new URL('/dashboard', window.location.origin);
        if (hsCode) {
            url.searchParams.set('hscode', hsCode);
        }
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto z-20">
            {/* Floating Intelligence HUD - Left (ICES 1.5) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -left-32 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-md"
            >
                <div className="relative flex items-center justify-center w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    ICES 1.5 Sync
                    <span className="block text-[9px] text-emerald-500">Optimal</span>
                </div>
            </motion.div>

            {/* Floating Intelligence HUD - Right (Schema Validated) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -right-36 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-md"
            >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    2026 Schema
                    <span className="block text-[9px] text-brand-400">Validated</span>
                </div>
            </motion.div>

            {/* Main Search Component */}
            <motion.form
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSearch}
                className={`flex items-center p-1 bg-slate-900/40 backdrop-blur-xl border border-slate-700 rounded-lg transition-all duration-300 ${isFocused ? 'shadow-[0_0_15px_rgba(79,70,229,0.3)] border-brand-500/50' : 'shadow-2xl shadow-black/50'
                    }`}
            >
                <input
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter HS Code (e.g., 10063020) to analyze 2026 incentives..."
                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-6 py-4 font-mono text-sm outline-none w-full"
                />

                <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-md font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/25 active:scale-95 group"
                >
                    <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Initialize</span>
                </button>
            </motion.form>

            {/* Live Data Ticker */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 flex justify-center gap-6"
            >
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Activity className="w-3 h-3 text-slate-600" />
                    <span>LIVE_INGEST: <span className="text-slate-300">14,203 RECORDS/SEC</span></span>
                </div>
            </motion.div>
        </div>
    );
};

export default SearchGateway;
