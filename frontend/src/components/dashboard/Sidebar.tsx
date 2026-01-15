import React from 'react';
import { Cpu, Settings, Activity, DollarSign, Boxes, Globe, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
    const path = window.location.pathname;

    const navigate = (newPath: string) => {
        window.history.pushState({}, '', newPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col border-r border-slate-200 dark:border-white/5 z-50 transition-all duration-300 shadow-2xl shadow-slate-200/50 dark:shadow-none`}>
            {/* Header */}
            <div className={`p-6 border-b border-slate-200/50 dark:border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} h-[88px] relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] flex-shrink-0 relative z-10">A</div>
                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap relative z-10">
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white font-display uppercase tracking-widest leading-none">
                            Agni EXIM
                        </h1>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mt-1 dark:drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">Intelligence</div>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                {!isCollapsed && <div className="pb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-4 font-display whitespace-nowrap">Strategic Operations</div>}
                <NavItem
                    active={path === '/user/market-intelligence'}
                    onClick={() => navigate('/user/market-intelligence')}
                    icon={<Activity className="w-5 h-5" />}
                    label="Market Intelligence"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    active={path === '/user/global-demand'}
                    onClick={() => navigate('/user/global-demand')}
                    icon={<Globe className="w-5 h-5" />}
                    label="Global Demand"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    active={path === '/user/odop-sourcing'}
                    onClick={() => navigate('/user/odop-sourcing')}
                    icon={<Boxes className="w-5 h-5" />}
                    label="ODOP Sourcing"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    active={path === '/user/intelligence' || path === '/dashboard' || path === '/'}
                    onClick={() => navigate('/user/intelligence')}
                    icon={<Cpu className="w-5 h-5" />}
                    label="Export Overview"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    active={path === '/user/pricing-engine'}
                    onClick={() => navigate('/user/pricing-engine')}
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Smart Quote Architect"
                    isCollapsed={isCollapsed}
                />

                {!isCollapsed && <div className="pt-6 pb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-4 font-display whitespace-nowrap">Executive Oversight</div>}
                {isCollapsed && <div className="h-4"></div>}
                <NavItem
                    active={path === '/admin/command-center'}
                    onClick={() => navigate('/admin/command-center')}
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    label="Command Center"
                    isCollapsed={isCollapsed}
                />

                {!isCollapsed && <div className="pt-6 pb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-4 font-display whitespace-nowrap">Configuration</div>}
                {isCollapsed && <div className="h-4"></div>}
                <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" isCollapsed={isCollapsed} />
            </nav>

            {/* System ID */}
            <div className={`px-6 pb-2 ${isCollapsed ? 'hidden' : ''}`}>
                <div className="text-[8px] font-mono text-slate-400 dark:text-slate-600/50 uppercase tracking-widest text-right whitespace-nowrap">SYSTEM_ID: AGNI-01</div>
            </div>

            {/* Profile */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-md transition-colors duration-300">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)] flex-shrink-0">
                        SB
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Sharath Babu</div>
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-500 font-bold uppercase tracking-tight">Enterprise User</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm z-50 hover:scale-110 active:scale-90 transition-all duration-200"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, isCollapsed: boolean }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-4 px-6'} py-4 transition-all duration-200 group border-l-2 active:scale-[0.98] ${active
            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-[inset_10px_0_20px_-10px_rgba(99,102,241,0.1)] dark:shadow-[inset_10px_0_20px_-10px_rgba(99,102,241,0.2)]'
            : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'
            }`}
    >
        <span className={`${active ? 'text-indigo-600 dark:text-indigo-400 dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400'} transition-all duration-300`}>
            {icon}
        </span>
        {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] font-display whitespace-nowrap transition-opacity duration-300">{label}</span>}
    </button>
);
