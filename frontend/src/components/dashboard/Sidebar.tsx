import React from 'react';
import { Cpu, LayoutGrid, BarChart3, Settings, Database, Server, Activity, TrendingUp, DollarSign, Globe } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const path = window.location.pathname;

    const navigate = (newPath: string) => {
        window.history.pushState({}, '', newPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

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
                <div className="pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4 font-display">Mission Terminal</div>
                <NavItem
                    active={path === '/user/intelligence' || path === '/dashboard' || path === '/'}
                    onClick={() => navigate('/user/intelligence')}
                    icon={<Cpu className="w-5 h-5" />}
                    label="Export Intelligence"
                />
                <NavItem
                    active={path === '/user/system-control'}
                    onClick={() => navigate('/user/system-control')}
                    icon={<Server className="w-5 h-5" />}
                    label="System Control"
                />
                <NavItem
                    active={path === '/user/market-trends'}
                    onClick={() => navigate('/user/market-trends')}
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Market Trends"
                />
                <NavItem
                    active={path === '/user/global-demand'}
                    onClick={() => navigate('/user/global-demand')}
                    icon={<Globe className="w-5 h-5" />}
                    label="Global Demand Map"
                />
                <NavItem
                    active={path === '/user/pricing-engine'}
                    onClick={() => navigate('/user/pricing-engine')}
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Pricing Engine"
                />

                <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4 font-display">SaaS Management</div>
                <NavItem
                    active={path === '/admin/command-center'}
                    onClick={() => navigate('/admin/command-center')}
                    icon={<Activity className="w-5 h-5" />}
                    label="Command Center"
                />

                <div className="pt-6 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4 font-display">Configuration</div>
                <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
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
