import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface LogEntry {
    id: number;
    timestamp: string;
    source: string;
    event: string;
    status: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
}

export const TelemetryStream: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 1, timestamp: '14:20:01', source: 'ACES_GATEWAY', event: 'Handshake Established', status: 'SUCCESS' },
        { id: 2, timestamp: '14:20:05', source: 'INGEST_PIPE_01', event: 'Batch #4920 received', status: 'INFO' },
        { id: 3, timestamp: '14:20:12', source: 'SCHEMA_VALIDATOR', event: 'Validation Pass: 99.8%', status: 'SUCCESS' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLog: LogEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                source: ['INGEST_NODE', 'PRICING_ENGINE', 'COMPLIANCE_BOT', 'MARKET_WATCH'][Math.floor(Math.random() * 4)],
                event: ['Processing Stream', 'Recalculating FOB', 'Check 2026/Notification', 'Index Update'][Math.floor(Math.random() * 4)],
                status: Math.random() > 0.9 ? 'WARN' : 'INFO'
            };
            setLogs(prev => [newLog, ...prev].slice(0, 15));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-slate-950 border border-slate-700/50 rounded-lg p-0 flex flex-col overflow-hidden relative group">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Terminal className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-display">Telemetry Stream</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            </div>

            {/* Log Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
                {logs.map((log) => (
                    <div key={log.id} className="text-[10px] flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                        <div className="flex-1">
                            <span className={`${log.status === 'WARN' ? 'text-amber-400' : log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-indigo-300'} font-bold mr-2`}>
                                [{log.source}]
                            </span>
                            <span className="text-slate-400">{log.event}</span>
                        </div>
                    </div>
                ))}

                {/* Fade Out Gradient at Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};
