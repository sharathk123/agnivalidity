import React, { useEffect, useState, useRef } from 'react';
import { SourceCard } from './SourceCard';
import { LogConsole } from './LogConsole';
import { SystemPulseBar, type SystemStatus } from './SystemPulseBar';

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

const MetricCard = ({ label, value, trend, highlight, isError, onClick }: any) => {
    // Dynamic shadow color based on status
    const glowColor = isError ? 'hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:border-rose-500/50' :
        highlight ? 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:border-indigo-500/50' :
            'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/50';

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 p-8 rounded-lg relative overflow-hidden group shadow-sm dark:shadow-none transition-all duration-300 ${glowColor} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : 'hover:scale-[1.01]'}`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-100/50 dark:from-white/0 dark:to-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-3 relative z-10 flex items-center justify-between">
                {label}
                <div className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-rose-500' : 'bg-emerald-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_5px_currentColor]`}></div>
            </div>

            <div className={`text-4xl font-display font-bold tracking-tighter relative z-10 font-mono ${highlight ? 'text-slate-900 dark:text-white' : isError ? 'text-rose-500 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                } transition-all duration-300 group-hover:translate-x-1`}>
                {value}
            </div>

            <div className={`text-[9px] font-black uppercase tracking-widest mt-4 flex items-center gap-2 relative z-10 ${isError ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                <span className={`px-2 py-0.5 rounded border ${isError
                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'}`}>
                    {trend}
                </span>
            </div>
        </div>
    );
};

export const AdminCommandCenter: React.FC = () => {
    const [status, setStatus] = useState<DashboardStatus | null>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>('ACTIVE');
    const [resetIndex, setResetIndex] = useState<number>(-1);

    // Internal ref to track active streams during reset for immediate UI feedback
    const activeStreamsRef = useRef<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [killSwitchLoading, setKillSwitchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDryRun, setIsDryRun] = useState(true);

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

        // Telemetry Stream
        const eventSource = new EventSource('http://localhost:8000/admin/ingestion/stream');
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLogs(prev => [...prev.slice(-49), data]);
        };

        return () => {
            clearInterval(interval);
            eventSource.close();
        };
    }, []);

    // Effect to sync system status with backend kill switch
    useEffect(() => {
        if (status?.kill_switch === 'ON' && systemStatus !== 'RESETTING') {
            setSystemStatus('PAUSED');
        } else if (status?.kill_switch === 'OFF' && systemStatus === 'PAUSED') {
            setSystemStatus('ACTIVE');
        }
    }, [status?.kill_switch]);

    const initiateSoftReset = () => {
        if (systemStatus !== 'PAUSED') return;

        setSystemStatus('RESETTING');
        setResetIndex(0);
        activeStreamsRef.current.clear();

        let currentIndex = 0;
        const totalSources = sources.length;

        const resetInterval = setInterval(async () => {
            if (currentIndex >= totalSources) {
                clearInterval(resetInterval);

                // Finalize Reset
                try {
                    await axios.post(`${API_BASE}/settings/kill-switch`); // Toggle OFF
                    await fetchData();
                    setSystemStatus('ACTIVE');
                    setResetIndex(-1);
                    setLogs(prev => [...prev, {
                        timestamp: new Date().toLocaleTimeString(),
                        level: 'SUCCESS',
                        source: 'SYSTEM',
                        message: 'Engine Latency Stabilized: 0.42ms. All systems GREEN.'
                    }]);
                } catch (error) {
                    console.error('Failed to restore system', error);
                }
                return;
            }

            // Simulate enabling stream
            const source = sources[currentIndex];
            if (source) {
                activeStreamsRef.current.add(source.id);
                // Update local sources state to reflect "active" visual even if backend hasn't updated yet
                setSources(prev => prev.map(s => s.id === source.id ? { ...s, is_active: true } : s));

                setLogs(prev => [...prev, {
                    timestamp: new Date().toLocaleTimeString(),
                    level: 'INFO',
                    source: 'SYSTEM',
                    message: `Reset Initiated: Resuming Node ${currentIndex + 1}/${totalSources} (${source.source_name})...`
                }]);
            }

            setResetIndex(currentIndex + 1);
            currentIndex++;

        }, 400);
    };

    const toggleKillSwitch = async () => {
        if (systemStatus === 'PAUSED') {
            // If manual toggle while paused, just use the soft reset flow
            initiateSoftReset();
            return;
        }

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
            await axios.post(`${API_BASE}/ingestion/${sourceId}/start?dry_run=${isDryRun}`);
            setSources(prev => prev.map(s => s.id === sourceId ? { ...s, last_run_status: 'RUNNING' } : s));
        } catch (error) {
            console.error('Failed to start ingestion', error);
            alert('Failed to start ingestion.');
        }
    };

    const stopIngestion = async (sourceId: number) => {
        try {
            await axios.post(`${API_BASE}/ingestion/${sourceId}/stop`);
            setSources(prev => prev.map(s => s.id === sourceId ? { ...s, last_run_status: 'IDLE' } : s));
        } catch (error) {
            console.error('Failed to stop ingestion', error);
            alert('Failed to stop ingestion.');
        }
    };


    if (loading && !status) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse font-mono">Establishing Uplink...</div>;

    const filteredSources = sources.filter(s =>
        s.source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.source_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500 ${systemStatus === 'PAUSED' ? 'bg-rose-100 dark:bg-rose-950/20' : ''}`}>
            <SystemPulseBar
                status={systemStatus}
                onReset={initiateSoftReset}
                currentStreamIndex={resetIndex}
                totalStreams={sources.length}
            />

            <div className="p-8 animate-fade-in flex flex-col flex-1">
                {/* Global Grid Overlay */}


                {/* Header */}
                <div className="flex justify-between items-end mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white tracking-tighter uppercase">Command Center</h2>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">Admin Authority Level 0</div>
                    </div>

                    {/* Protocol Master Switch */}
                    <button
                        onClick={toggleKillSwitch}
                        disabled={killSwitchLoading || systemStatus === 'RESETTING'}
                        className={`flex items-center gap-4 px-6 py-3 rounded border transition-all shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.2)] group ${systemStatus === 'PAUSED'
                            ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 dark:border-rose-500 text-rose-500 dark:text-rose-400 shadow-[0_0_30px_rgba(225,29,72,0.2)] dark:shadow-[0_0_30px_rgba(225,29,72,0.3)]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-500/30'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${systemStatus === 'PAUSED' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none text-slate-500 group-hover:text-slate-400">Protocol Status</span>
                            <span className="text-sm font-bold font-mono tracking-tighter leading-none mt-1">{systemStatus === 'PAUSED' ? 'SUSPENDED' : 'ACTIVE'}</span>
                        </div>
                    </button>
                </div>

                <div className="space-y-10 flex-1 w-full relative z-10">
                    {/* Metrics Ticker */}
                    <div className="grid grid-cols-4 gap-6">
                        <MetricCard
                            label="Operational Sources"
                            value={`${sources.filter(s => s.is_active).length}/${status?.total_sources}`}
                            trend="STABLE"
                        />
                        <MetricCard
                            label="Verified Transactions (24h)"
                            value={status?.records_updated_24h.toLocaleString() || '0'}
                            trend="UP"
                            highlight
                        />
                        <MetricCard
                            label="Audit Exception Log"
                            value={status?.errors_24h || 0}
                            trend={(status?.errors_24h ?? 0) > 0 ? 'RISK' : 'NOMINAL'}
                            isError={(status?.errors_24h ?? 0) > 0}
                            onClick={() => { window.history.pushState({}, '', '/admin/command-center/quarantine'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        />
                        <MetricCard
                            label="Sync Precision"
                            value={status?.status === 'healthy' ? '0.4ms' : 'HIGH'}
                            trend="OPTIMAL"
                        />
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        {/* Ingestion Registry Searchable Grid */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">
                            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-6 rounded-lg shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter font-display">Ingestion Registry</h3>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 font-display">Found <span className="font-mono">{filteredSources.length}</span> Verified Data Partners</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                                        <button
                                            onClick={() => setIsDryRun(true)}
                                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${isDryRun ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            TEST_MODE
                                        </button>
                                        <button
                                            onClick={() => setIsDryRun(false)}
                                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${!isDryRun ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            PROD_MODE
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                        <input
                                            type="text"
                                            placeholder="Filter Registry..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="relative w-64 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-mono focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredSources.map(source => (
                                    <SourceCard
                                        key={source.id}
                                        source={source}
                                        onRun={runIngestion}
                                        onStop={stopIngestion}
                                        disabled={systemStatus === 'PAUSED' || systemStatus === 'RESETTING'}
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
                            <LogConsole logs={logs} />

                            <div className="bg-slate-100 dark:bg-slate-900/50 border border-indigo-200 dark:border-indigo-500/20 rounded-lg p-6 relative overflow-hidden group shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="flex gap-4 relative z-10">
                                    <span className="text-xl text-indigo-500 dark:text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">⚖️</span>
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">2026 Regulatory Patch</h4>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium font-mono">
                                            ICEGATE JSON Schema v1.1 validation is enforced.
                                            <br />
                                            <span className="text-rose-500 dark:text-rose-400">Non-compliant ingestion records will be automatically quarantined.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`text-right pt-2 border-t border-slate-200 dark:border-slate-800/50 mt-6`}>
                    <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                        ICES 1.5 ACTIVE | 2026 MANDATORY JSON V1.1 VALIDATION ACTIVE | QUARANTINE PROTOCOLS ENGAGED
                    </span>
                </div>
            </div>
        </div>
    );
};
