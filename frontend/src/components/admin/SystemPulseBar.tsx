import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export type SystemStatus = 'ACTIVE' | 'PAUSED' | 'RESETTING';

interface SystemPulseBarProps {
    status: SystemStatus;
    onReset: () => void;
    currentStreamIndex?: number;
    totalStreams?: number;
}

export const SystemPulseBar: React.FC<SystemPulseBarProps> = ({
    status,
    onReset,
    currentStreamIndex = 0,
    totalStreams = 18
}) => {

    if (status === 'ACTIVE') return null;

    return (
        <div className={`sticky top-0 z-[100] px-8 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-colors duration-500
            ${status === 'PAUSED' ? 'bg-rose-600 shadow-[0_4px_20px_rgba(225,29,72,0.4)] animate-pulse-slow' : 'bg-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.4)]'}
        `}>
            <div className="flex items-center gap-4 text-white">
                {status === 'PAUSED' ? <ShieldAlert className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin" />}
                <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[.2em]">
                        {status === 'PAUSED' ? 'System-Wide Emergency Override Active' : 'System Reboot Sequence Initiated'}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest leading-none mt-0.5">
                        {status === 'PAUSED'
                            ? 'All ingestion cycles suspended by internal authority'
                            : `Restoring Data Uplinks: Node ${currentStreamIndex}/${totalStreams}`
                        }
                    </span>
                </div>
            </div>

            {status === 'PAUSED' && (
                <button
                    onClick={onReset}
                    className="group relative px-6 py-2 bg-white text-rose-600 text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-rose-50 transition-all overflow-hidden border border-rose-200"
                >
                    <span className="relative z-10 font-bold flex items-center gap-2">
                        RESET ENGINE
                    </span>
                </button>
            )}

            {status === 'RESETTING' && (
                <div className="flex items-center gap-2 px-6 py-2 bg-black/20 text-white text-[10px] font-black uppercase tracking-widest rounded border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span>Stabilizing Latency...</span>
                </div>
            )}
        </div>
    );
};
