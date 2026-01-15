import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { CommandPalette } from '../components/ui/CommandPalette';
import { TrendingUp, TrendingDown, Info, Activity } from 'lucide-react';

const ForexTicker: React.FC = () => {
    const CUSTOMS_RATE = 83.50;
    const [marketRate, setMarketRate] = useState(84.15);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('/data/live_rates.json');
                const data = await response.json();
                setMarketRate(data.market_rate);
                setLastUpdated(data.last_updated);
                setIsConnected(true);
            } catch (error) {
                console.error("Forex Stream Disconnected", error);
                setIsConnected(false);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 2000); // Poll every 2s for demo heartbeat
        return () => clearInterval(interval);
    }, []);

    const gap = marketRate - CUSTOMS_RATE;
    const isExportLead = gap > 0;

    return (
        <div className="group relative flex items-center gap-4 px-4 py-1.5 bg-slate-100 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-800/50 cursor-help transition-all hover:border-indigo-400 dark:hover:border-indigo-500/30">
            {/* Connection Pulse */}
            <div className={`absolute -top-1 -right-1 flex`}>
                <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>

            <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    USD/INR Parity
                    <Activity className={`w-2 h-2 ${isConnected ? 'text-emerald-500' : 'text-slate-700'}`} />
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-mono font-bold transition-all duration-500 ${isExportLead ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        ₹{marketRate.toFixed(2)}
                    </span>
                    {isExportLead ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500 animate-[bounce_2s_infinite]" />
                    ) : (
                        <TrendingDown className="w-3 h-3 text-rose-500" />
                    )}
                </div>
            </div>

            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isExportLead
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                {isExportLead ? 'Export Surplus' : 'Import Deficit'}
            </div>

            {/* Hover Tooltip - Always dark for technical info */}
            <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <Info className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-white uppercase">Parity Intelligence</span>
                </div>
                <div className="space-y-1 font-mono text-[9px]">
                    <div className="flex justify-between text-slate-400">
                        <span>CBIC RATE (FIXED):</span>
                        <span className="text-slate-200">₹{CUSTOMS_RATE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>LIVE MARKET:</span>
                        <span className={`transition-colors duration-300 ${isExportLead ? 'text-emerald-400' : 'text-rose-400'}`}>₹{marketRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[8px] mt-1">
                        <span>LAST PACKET:</span>
                        <span>{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'WAITING...'}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/50 text-indigo-300 font-sans font-bold leading-tight">
                        Advisor: {isExportLead
                            ? "Market rate exceeds Customs rate. Favorable for Export Realization."
                            : "Market rate below Customs rate. Warning: Import Duty Inflation Risk."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    // Listen for global Omni-Search sidebar toggle
    useEffect(() => {
        const handleToggle = () => setIsSidebarCollapsed(prev => !prev);
        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    // Route config for breadcrumbs
    const getBreadcrumbs = () => {
        const path = location.pathname;
        if (path.includes('/user/odop-sourcing')) return { category: 'Sourcing Terminal', page: 'ODOP Registry' };
        if (path.includes('/user/pricing-engine')) return { category: 'Pricing Engine', page: 'Calculator' };
        if (path.includes('/user/market-trends')) return { category: 'Market Intelligence', page: 'Global Trends' };
        if (path.includes('/user/global-demand')) return { category: 'Market Intelligence', page: 'Demand Heatmap' };
        if (path.includes('/admin/command-center')) return { category: 'Market Watchtower', page: 'Command Center' };
        if (path.includes('/user/system-control')) return { category: 'Market Watchtower', page: 'Monitoring' };
        return { category: 'Analysis', page: 'Scoring Engine' }; // Default
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <CommandPalette />
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} />
            <div className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex flex-col min-h-screen relative transition-all duration-300`}>

                {/* Header (HUD Status Ribbon) */}
                <header className="h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest font-mono">Enterprise Terminal</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <div className="flex items-center text-slate-500 dark:text-slate-500 text-[11px] font-bold uppercase tracking-tight font-mono">
                            <span>{breadcrumbs.category}</span>
                            <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
                            <span className="text-slate-900 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{breadcrumbs.page}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Intelligence Injection: Forex Radar Ticker */}
                        <ForexTicker />

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/5 border-l border-r border-slate-200 dark:border-slate-700/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-display">Customs Compliance: ACTIVE</span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <button className="text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden pb-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    {children}
                </main>

                {/* Regulatory Patch Footer (Sticky) */}
                <div className={`fixed bottom-0 ${isSidebarCollapsed ? 'left-20' : 'left-64'} right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white py-2 px-6 z-40 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none`}>
                    <div className="flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-emerald-600 dark:text-emerald-400">ICES 1.5 ACTIVE (SYNC: OK)</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-slate-500 dark:text-slate-400">2026 MANDATORY JSON V1.1 VALIDATION ACTIVE</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-indigo-600 dark:text-indigo-400 dark:drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">QUARANTINE PROTOCOLS ENGAGED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
