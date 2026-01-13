import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
    timestamp: string;
    level: string;
    source: string;
    message: string;
}

export const LogConsole: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // SSE Connection
        const eventSource = new EventSource('http://localhost:8000/admin/ingestion/stream');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLogs(prev => [...prev.slice(-99), data]); // Keep last 100 logs
            } catch (e) {
                console.error("Failed to parse log", e);
            }
        };

        eventSource.onerror = (e) => {
            console.error("SSE Error", e);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black rounded-lg border border-gray-800 font-mono text-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 font-semibold">TERMINAL OUTPUT</span>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
            </div>
            <div ref={scrollRef} className="p-4 overflow-y-auto flex-1 space-y-1">
                {logs.length === 0 && <div className="text-gray-600 italic">Waiting for connection...</div>}

                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 text-xs md:text-sm">
                        <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                        <span className={`shrink-0 w-16 font-bold ${log.level === 'ERROR' ? 'text-red-500' :
                                log.level === 'WARNING' ? 'text-yellow-500' :
                                    log.level === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'
                            }`}>{log.level}</span>
                        <span className="text-gray-500 shrink-0 w-32 truncate">[{log.source}]</span>
                        <span className="text-gray-300 break-all">{log.message}</span>
                    </div>
                ))}
                <div className="animate-pulse text-green-500">_</div>
            </div>
        </div>
    );
};
