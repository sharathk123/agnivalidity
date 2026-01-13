import React from 'react';

interface HSSearchTerminalProps {
    query: string;
    setQuery: (query: string) => void;
    onSearch: (e: React.FormEvent) => void;
    loading: boolean;
}

export const HSSearchTerminal: React.FC<HSSearchTerminalProps> = ({ query, setQuery, onSearch, loading }) => {
    return (
        <div className={`relative z-20 transition-all duration-300 rounded-xl p-1 bg-slate-900/40 backdrop-blur-md border ${query.length === 10 ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-700/50 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.2)]'}`}>
            <div className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 flex items-center justify-center text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800">
                    {query.length === 10 ? (
                        <svg className="w-6 h-6 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    )}
                </div>
                <form onSubmit={onSearch} className="flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ENTER 10-DIGIT HS CODE OR PRODUCT KEY..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-white placeholder-slate-600 outline-none uppercase tracking-widest font-mono"
                    />
                </form>

                {query.length === 10 && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black uppercase tracking-widest text-emerald-400 mr-2">
                        <span>Verified Schema</span>
                    </div>
                )}

                <button
                    onClick={(e) => onSearch(e)}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                >
                    {loading ? 'SCANNING...' : 'INITIATE'}
                </button>
            </div>
        </div>
    );
};
