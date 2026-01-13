import React from 'react';

export const Sidebar: React.FC = () => {
    const path = window.location.pathname;

    return (
        <div className="w-64 bg-slate-950 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700/50 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">A</div>
                <div>
                    <h1 className="text-sm font-bold text-white font-display uppercase tracking-widest leading-none">
                        Agni EXIM
                    </h1>
                    <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">Intelligence</div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <NavItem
                    active={path === '/dashboard'}
                    onClick={() => { window.history.pushState({}, '', '/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                    icon={<ChartIcon />}
                    label="Dashboard"
                />
                <NavItem
                    active={path === '/admin'}
                    onClick={() => { window.history.pushState({}, '', '/admin'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                    icon={<ShieldIcon />}
                    label="Admin Control"
                />

                <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4 font-display">Analysis Modules</div>
                <NavItem icon={<MarketIcon />} label="Market Trends" />
                <NavItem icon={<PriceIcon />} label="Pricing Engine" />

                <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4 font-display">Configuration</div>
                <NavItem icon={<SettingsIcon />} label="Settings" />
            </nav>

            <div className="px-6 pb-2">
                <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest text-right">SYSTEM_ID: AGNI-01</div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                        SB
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200 truncate">Sharath Babu</div>
                        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight">Enterprise User</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 group border-l-2 ${active
            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-[inset_10px_0_20px_-10px_rgba(99,102,241,0.2)]'
            : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300 border-transparent'
            }`}
    >
        <span className={`${active ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'text-slate-600 group-hover:text-slate-400'} transition-all duration-300`}>
            {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-display">{label}</span>
    </button>
);

// Minimal Icons
const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
);

const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const MarketIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

const PriceIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
