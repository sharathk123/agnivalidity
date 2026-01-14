import React, { useEffect, useRef } from 'react';

interface LogConsoleProps {
    logs: any[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    /* Removed internal EventSource logic to allow parent control */

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-slate-950/80 backdrop-blur border border-indigo-500/30 rounded-lg shadow-2xl flex flex-col h-[400px] overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-indigo-500/20 bg-slate-900/50">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 shadow-[0_0_5px_rgba(225,29,72,0.5)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2 font-mono flex-1 text-center">Agni://Telemetry_Stream</div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent"
            >
                {logs.length === 0 ? (
                    <div className="text-indigo-400/50 animate-pulse flex items-center justify-center h-full">
                        <span className="mr-2">⚡</span> Establishing uplink to system nodes...
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-l border-indigo-500/20 pl-3 group hover:bg-indigo-500/5 transition-colors p-1 rounded-r">
                            <span className="text-slate-500 shrink-0 select-none group-hover:text-slate-400 transition-colors">[{log.timestamp}]</span>
                            <span className={`font-bold shrink-0 ${log.level === 'ERROR' || log.level === 'CRITICAL' ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(225,29,72,0.5)]' :
                                log.level === 'SUCCESS' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]'
                                }`}>
                                {log.level}
                            </span>
                            <span className="text-white font-bold shrink-0">{log.source}</span>
                            <span className="text-slate-400">{log.message}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Status Line */}
            <div className="h-6 bg-indigo-950/30 border-t border-indigo-500/20 flex items-center justify-between px-3 text-[9px] font-mono text-indigo-300/50">
                <span>STATUS: LISTENING</span>
                <span>PORT: 8000</span>
            </div>
        </div>
    );
};
