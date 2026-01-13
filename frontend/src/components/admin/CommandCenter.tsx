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

export const AdminCommandCenter: React.FC = () => {
    const [status, setStatus] = useState<DashboardStatus | null>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [killSwitchLoading, setKillSwitchLoading] = useState(false);

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
        const interval = setInterval(fetchData, 5000); // Poll every 5s
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
            // Optimistic update
            setSources(prev => prev.map(s => s.id === sourceId ? { ...s, last_run_status: 'RUNNING' } : s));

            // Show toast (mock)
            console.log(`Started ingestion for source ${sourceId}`);
        } catch (error) {
            console.error('Failed to start ingestion', error);
            alert('Failed to start ingestion. Check console for details.');
        }
    };

    if (loading && !status) return <div className="p-8 text-center">Loading Mission Control...</div>;

    const isSystemPaused = status?.kill_switch === 'ON';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
            {/* TOP BAR */}
            <div className={`bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm ${isSystemPaused ? 'bg-red-50 border-red-200' : ''}`}>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">EXIM COMMAND CONTROL</h1>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">v1.2.0-2026</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* ICEGATE GUARD */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status?.icegate_version.status === 'OK'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${status?.icegate_version.status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        ICEGATE JSON v{status?.icegate_version.supported_version}
                    </div>

                    {/* KILL SWITCH */}
                    <button
                        onClick={toggleKillSwitch}
                        disabled={killSwitchLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm shadow-sm transition-all ${isSystemPaused
                            ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300 ring-offset-2'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {isSystemPaused ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                SYSTEM PAUSED (RESUME)
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                KILL SWITCH (PAUSE ALL)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 py-8">

                {/* METRICS GRID */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-sm font-medium mb-1">Active Sources</div>
                        <div className="text-3xl font-bold text-gray-900">{sources.filter(s => s.is_active).length}/{status?.total_sources}</div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-sm font-medium mb-1">Records Today</div>
                        <div className="text-3xl font-bold text-indigo-600">{status?.records_updated_24h.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-sm font-medium mb-1">Error Rate (24h)</div>
                        <div className={`text-3xl font-bold ${status?.errors_24h ?? 0 > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {status?.errors_24h}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full"></div>
                        <div className="text-gray-500 text-sm font-medium mb-1">System Health</div>
                        <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {status?.status === 'healthy' ? 'OPTIMAL' : 'DEGRADED'}
                            <span className={`w-3 h-3 rounded-full ${status?.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOURCE GRID */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-gray-900">Ingestion Sources</h2>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-500">Government</span>
                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-500">Multilateral</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sources.map(source => (
                                <SourceCard
                                    key={source.id}
                                    source={source}
                                    onRun={runIngestion}
                                    disabled={isSystemPaused}
                                />
                            ))}
                        </div>
                    </div>

                    {/* LOG CONSOLE */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Command Terminal</h2>
                        <LogConsole />

                        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h3 className="text-yellow-800 font-bold text-sm mb-1">⚠️ 2026 Compliance Notice</h3>
                            <p className="text-yellow-700 text-xs leading-relaxed">
                                ICEGATE JSON filing becomes mandatory on <strong>Jan 31, 2026</strong>.
                                Ensure all ingestion workers are validated using the 'JSON_SCHEMA_MONITOR' strategy strictly.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
