import React from 'react';

export const NavLink = ({ href, children, isDark }: { href: string, children: React.ReactNode, isDark?: boolean }) => (
    <a href={href} className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-brand-600'}`}>{children}</a>
);

export const Metric = ({ value, label }: { value: string, label: string }) => (
    <div className="text-right">
        <div className="text-2xl font-display font-bold text-white leading-none">{value}</div>
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{label}</div>
    </div>
);

export const SourceTag = ({ name, status }: { name: string, status: string }) => (
    <div className="px-4 py-3 bg-slate-800/50 border border-slate-800 rounded flex flex-col gap-1">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{name}</div>
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
            {status}
        </div>
    </div>
);

export const ObsidianVerdictRow = ({ title, hsn, verdict, color }: { title: string, hsn: string, verdict: 'GO' | 'AVOID' | 'CAUTION', color: 'emerald' | 'rose' | 'amber' }) => {
    const colorStyles = {
        emerald: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        rose: { border: 'border-l-rose-500', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
        amber: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' }
    };

    return (
        <div className={`p-5 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-between hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all group ${colorStyles[color].border} border-l-2`}>
            <div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center gap-2">
                    <span className="text-indigo-500">HSN:</span>
                    <span className="tracking-wider">{hsn}</span>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest ${colorStyles[color].badge}`}>
                {verdict}
            </div>
        </div>
    );
};
