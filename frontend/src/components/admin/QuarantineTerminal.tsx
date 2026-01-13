import React, { useState } from 'react';
import { ChevronLeft, Terminal, AlertTriangle, Play, Trash2, FileJson } from 'lucide-react';

export const QuarantineTerminal: React.FC = () => {
    // Mock Data for Rejection Feed
    const [rejections, setRejections] = useState([
        { id: 1, timestamp: '2026-01-13 18:42:12', source: 'SRC-001/ICEGATE_LINK', error: 'ERR_SCHEMA_MISMATCH', payload: '{ "hsn": "1006.30", "val": "INVALID" }' },
        { id: 2, timestamp: '2026-01-13 18:42:15', source: 'SRC-004/GSTN_API', error: 'ERR_AUTH_FAILURE', payload: '{ "gstin": "29AAAAA0000A1Z5", "token": "***" }' },
        { id: 3, timestamp: '2026-01-13 18:42:45', source: 'SRC-001/ICEGATE_LINK', error: 'ERR_FIELD_MISSING', payload: '{ "shipping_bill_no": null }' },
        { id: 4, timestamp: '2026-01-13 18:43:01', source: 'SRC-002/DGFT_SCRUB', error: 'ERR_TIMEOUT', payload: '{ "retry_count": 3 }' },
        { id: 5, timestamp: '2026-01-13 18:43:55', source: 'SRC-003/BANK_IRM', error: 'ERR_CURRENCY_INVALID', payload: '{ "currency": "INR", "expected": "USD" }' },
    ]);

    const [selectedRejection, setSelectedRejection] = useState<any>(null);

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-[1920px] mx-auto min-h-screen flex flex-col bg-slate-950/80 relative">
            {/* Global Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-4 relative z-10">
                <button
                    onClick={() => { window.history.pushState({}, '', '/admin/command-center'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                    className="p-2 border border-slate-700/50 rounded bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-black font-display text-white tracking-tighter uppercase flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Quarantine Terminal
                    </h2>
                    <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest mt-1">
                        Active Containment Protocol • {rejections.length} Records Held
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-1 relative z-10">
                {/* Left Panel: Analytics & Controls (40%) */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900/50 border border-border border-rose-500/30 rounded-lg">
                            <div className="text-[10px] font-black text-rose-400/70 uppercase tracking-widest mb-2">Total Rejected</div>
                            <div className="text-4xl font-mono font-bold text-rose-500 tracking-tighter drop-shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                                {rejections.length}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Auto-Resolved</div>
                            <div className="text-4xl font-mono font-bold text-emerald-500 tracking-tighter opacity-50">
                                0
                            </div>
                        </div>
                    </div>

                    {/* Global Actions */}
                    <div className="p-6 bg-rose-950/10 border border-rose-500/20 rounded-lg space-y-4">
                        <div className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            Review & resolution
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                            Select a record from the feed to inspect the raw JSON payload divergence.
                            Records can be patched and re-injected or purged.
                        </p>

                        <div className="pt-4 border-t border-rose-500/10 flex gap-4">
                            <button className="flex-1 py-3 bg-rose-500/10 border border-rose-500 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.1)] flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Purge All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Rejection Feed (60%) */}
                <div className="col-span-12 lg:col-span-7 h-full min-h-[500px] flex flex-col">
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Rejection Stream</span>
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Live</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {rejections.map(item => (
                                <div key={item.id} className="group flex items-center gap-4 p-3 hover:bg-slate-900/50 rounded border border-transparent hover:border-slate-700/50 transition-all font-mono text-[10px] text-slate-400">
                                    <div className="w-32 opacity-50">{item.timestamp.split(' ')[1]}</div>
                                    <div className="w-40 font-bold text-slate-300">{item.source}</div>
                                    <div className="w-40 text-rose-500 font-bold">{item.error}</div>
                                    <div className="flex-1 text-slate-500 truncate group-hover:text-slate-300 transition-colors">
                                        {item.payload}
                                    </div>
                                    <button
                                        onClick={() => setSelectedRejection(item)}
                                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded hover:bg-indigo-500 hover:text-white transition-all uppercase font-bold tracking-wider"
                                    >
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for JSON Review */}
            {selectedRejection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <div className="flex items-center gap-3">
                                <FileJson className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">{selectedRejection.error}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{selectedRejection.source} • {selectedRejection.timestamp}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRejection(null)} className="text-slate-500 hover:text-white transition-colors text-xl">×</button>
                        </div>
                        <div className="p-6 bg-slate-950">
                            <pre className="font-mono text-xs text-emerald-400 bg-slate-900/50 p-4 rounded border border-slate-800 overflow-x-auto">
                                {JSON.stringify(JSON.parse(selectedRejection.payload), null, 2)}
                            </pre>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                            <button onClick={() => setSelectedRejection(null)} className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-2">
                                <Play className="w-3 h-3" />
                                Retry Injection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-right pt-4 border-t border-slate-800/50 mt-auto">
                <span className="text-[10px] font-mono font-black text-rose-900/50 uppercase tracking-widest">
                    SYSTEM_ID: AGNI-01
                </span>
            </div>
        </div>
    );
};
