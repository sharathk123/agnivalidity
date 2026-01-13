import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'ERROR';
    source: string;
    message: string;
}

export const LogConsole: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mock log stream for demo (Replace with SSE later)
    useEffect(() => {
        const interval = setInterval(() => {
            const sources = ['DGFT_WORKER', 'ICEGATE_GUARD', 'TRADESTAT_SCRAPER'];
            const levels: ('INFO' | 'WARNING' | 'ERROR')[] = ['INFO', 'INFO', 'INFO', 'WARNING'];
            const msgs = [
                'Fetching page 1...',
                'Parsed 50 records successfully',
                'Rate limit approach (80%)',
                'Connection reset by peer, retrying...',
                'Schema validation passed (v1.5)',
                'Skipping duplicate record'
            ];

            const newLog: LogEntry = {
                timestamp: new Date().toISOString().split('T')[1].split('.')[0],
                level: levels[Math.floor(Math.random() * levels.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                message: msgs[Math.floor(Math.random() * msgs.length)]
            };

            setLogs(prev => [...prev.slice(-49), newLog]);
        }, 2000);

        return () => clearInterval(interval);
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
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                        <span className={`shrink-0 w-20 ${log.level === 'ERROR' ? 'text-red-500' :
                                log.level === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
                            }`}>{log.level}</span>
                        <span className="text-gray-500 shrink-0 w-32">[{log.source}]</span>
                        <span className="text-gray-300">{log.message}</span>
                    </div>
                ))}
                <div className="animate-pulse text-green-500">_</div>
            </div>
        </div>
    );
};
