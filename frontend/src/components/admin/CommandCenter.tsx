import React, { useEffect, useState } from 'react';
import { SourceCard } from './SourceCard';
import { LogConsole } from './LogConsole';
import axios from 'axios';

interface DashboardStatus {
    status: string;
    kill_switch: string;
    sources: Record<string, number>;
    total_sources: number;
    errors_24h: number;
    records_updated_24h: number;
    icegate_version: {
        status: string;
        supported_version: string;
        configured_version: string;
    };
    timestamp: string;
}

const API_BASE = 'http://localhost:8000/admin';

const MetricCard = ({ label, value, trend, highlight, isError }: any) => (
    <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">{label}</div>
        <div className={`text-4xl font-display font-bold tracking-tight relative z-10 ${highlight ? 'text-white' : isError ? 'text-rose-400' : 'text-indigo-400'
            } drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]`}>
            {value}
        </div>
        <div className={`text-[9px] font-black uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10 ${isError ? 'text-rose-400' : 'text-emerald-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_5px_currentColor]`}></span>
            {trend}
        </div>
    </div>
);

export const AdminCommandCenter: React.FC = () => {
    const [status, setStatus] = useState<DashboardStatus | null>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [killSwitchLoading, setKillSwitchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const [statusRes, sourcesRes] = await Promise.all([
                axios.get(`${API_BASE}/health/dashboard`),
                axios.get(`${API_BASE}/ingestion/status`)
            ]);
            setStatus(statusRes.data);
            setSources(sourcesRes.data.sources);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleKillSwitch = async () => {
        setKillSwitchLoading(true);
        try {
            await axios.post(`${API_BASE}/settings/kill-switch`);
            await fetchData();
        } catch (error) {
            console.error('Failed to toggle kill switch', error);
        } finally {
            setKillSwitchLoading(false);
        }
    };

    const runIngestion = async (sourceId: number) => {
        try {
            await axios.post(`${API_BASE}/ingestion/${sourceId}/start?dry_run=true`);
            setSources(prev => prev.map(s => s.id === sourceId ? { ...s, last_run_status: 'RUNNING' } : s));
        } catch (error) {
            console.error('Failed to start ingestion', error);
            alert('Failed to start ingestion.');
        }
    };

    if (loading && !status) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse font-mono">Establishing Uplink...</div>;

    const isSystemPaused = status?.kill_switch === 'ON';
    const filteredSources = sources.filter(s =>
        s.source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.source_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-0 animate-fade-in flex flex-col min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Global Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-indigo-950/20 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

            {/* Top Status Bar (Obsidian Style) */}
            <div className={`h-16 flex items-center justify-between px-8 border-b transition-all duration-500 z-10 sticky top-0 backdrop-blur-md ${isSystemPaused
                ? 'bg-rose-950/90 border-rose-900 text-white shadow-[0_0_30px_rgba(225,29,72,0.15)]'
                : 'bg-slate-950/80 border-slate-800 text-white shadow-none'
                }`}>
                {/* Scan-line overlay for Kill Switch */}
                {isSystemPaused && (
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none animate-scan"></div>
                )}

                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-base font-black uppercase tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Command Ledger</h2>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${isSystemPaused ? 'text-rose-200/50' : 'text-slate-600'}`}>
                            EXIM-INT-JAN-2026
                        </span>
                    </div>
                    {isSystemPaused && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded font-black text-[9px] uppercase tracking-widest border border-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            PROTOCOL SUSPENDED
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-10 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isSystemPaused ? 'text-rose-300' : 'text-slate-500'}`}>Compliance Sync</div>
                            <div className="flex items-center gap-1.5 justify-end">
                                <span className={`text-[11px] font-bold tracking-tight font-mono ${isSystemPaused ? 'text-white' : 'text-emerald-400'}`}>ICES 1.5 READY</span>
                            </div>
                        </div>
                        <div className={`h-8 w-px ${isSystemPaused ? 'bg-rose-800' : 'bg-slate-800'}`}></div>
                        <button
                            onClick={toggleKillSwitch}
                            disabled={killSwitchLoading}
                            className={`h-10 px-8 rounded font-black text-[10px] uppercase tracking-widest transition-all relative overflow-hidden group ${isSystemPaused
                                ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white border border-rose-700/50 shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]'
                                : 'bg-slate-900 text-rose-500 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 hover:text-rose-400'
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSystemPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-20"></span>}
                                {isSystemPaused ? 'RESUME TRAFFIC' : 'INITIATE KILL SWITCH'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-10 space-y-10 flex-1 max-w-7xl mx-auto w-full relative z-10">
                {/* Metrics Ticker */}
                <div className="grid grid-cols-4 gap-6">
                    <MetricCard
                        label="Operational Sources"
                        value={`${sources.filter(s => s.is_active).length}/${status?.total_sources}`}
                        trend="STABLE"
                    />
                    <MetricCard
                        label="Lifecycle Records (24h)"
                        value={status?.records_updated_24h.toLocaleString() || '0'}
                        trend="UP"
                        highlight
                    />
                    <MetricCard
                        label="Interruption Cycles"
                        value={status?.errors_24h || 0}
                        trend={(status?.errors_24h ?? 0) > 0 ? 'RISK' : 'NOMINAL'}
                        isError={(status?.errors_24h ?? 0) > 0}
                    />
                    <MetricCard
                        label="Engine Latency"
                        value={status?.status === 'healthy' ? '0.4ms' : 'HIGH'}
                        trend="OPTIMAL"
                    />
                </div>

                <div className="grid grid-cols-12 gap-10">
                    {/* Ingestion Registry Searchable Grid */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-sm rounded-lg">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest font-display">Ingestion Registry</h3>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Found {filteredSources.length} Active Streams</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <input
                                    type="text"
                                    placeholder="Filter Registry..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="relative w-72 bg-slate-950/50 border border-slate-800 rounded px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSources.map(source => (
                                <SourceCard
                                    key={source.id}
                                    source={source}
                                    onRun={runIngestion}
                                    disabled={isSystemPaused}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Vertical Control Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest font-display">System Telemetry</h3>
                            <div className="flex gap-1.5 items-center px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Link</span>
                            </div>
                        </div>
                        <LogConsole />

                        <div className="bg-slate-900/50 border border-indigo-500/20 rounded-lg p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="flex gap-4 relative z-10">
                                <span className="text-xl text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">⚖️</span>
                                <div>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">2026 Regulatory Patch</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium font-mono">
                                        ICEGATE JSON Schema v1.1 validation is enforced.
                                        <br />
                                        <span className="text-rose-400">Non-compliant ingestion records will be automatically quarantined.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
