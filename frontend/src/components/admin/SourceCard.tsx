import React from 'react';
import { Play, Square } from 'lucide-react';


interface IngestionSource {
    id: number;
    source_name: string;
    source_type: string;
    frequency: string;
    last_run_status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'IDLE';
    ingestion_strategy: string;
    records_updated: number;
    is_active: boolean;
    last_run_at: string | null;
}

interface SourceCardProps {
    source: IngestionSource;
    onRun: (id: number) => void;
    onStop: (id: number) => void;
    disabled: boolean;
}


export const SourceCard: React.FC<SourceCardProps> = ({ source, onRun, onStop, disabled }) => {

    const isRunning = source.last_run_status === 'RUNNING';

    // Status logic for glowing pulse dots
    const statusColor =
        source.last_run_status === 'FAILED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]' :
            !source.is_active ? 'bg-slate-600' :
                isRunning ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]' :
                    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';

    return (
        <div className={`bg-slate-900 border border-slate-700/50 rounded-lg p-6 group transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden ${!source.is_active ? 'opacity-60 grayscale' : ''}`}>

            {/* Background Gradient for Active State */}
            {source.is_active && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative flex">
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
                        {isRunning && (
                            <div className="absolute -inset-1.5 rounded-full bg-indigo-500 opacity-20 animate-ping"></div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase font-display">{source.source_name.replace(/_/g, ' ')}</h4>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 font-mono">{source.ingestion_strategy}</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onRun(source.id)}
                        disabled={disabled || !source.is_active || isRunning}
                        className={`p-2 rounded transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)] ${isRunning
                                ? 'text-slate-600 bg-slate-800/50 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-indigo-600 opacity-0 group-hover:opacity-100'
                            }`}
                    >
                        <Play size={14} fill="currentColor" />
                    </button>

                    {isRunning && (
                        <button
                            onClick={() => onStop(source.id)}
                            disabled={disabled}
                            className="p-2 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-all shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    )}
                </div>


            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 mb-4 relative z-10">
                <div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Frequency</div>
                    <div className="text-[11px] font-bold text-slate-300 font-mono">{source.frequency}</div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Records Tracking</div>
                    <div className="text-[11px] font-bold text-indigo-400 font-mono">{source.records_updated.toLocaleString()}</div>
                </div>
            </div>

            <div className={`flex justify-between items-center bg-slate-950/50 -mx-6 -mb-6 px-6 py-3 border-t border-slate-800 mt-2 relative z-10`}>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Last Run Registry</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {source.last_run_at ? new Date(source.last_run_at).toLocaleDateString() : 'NEVER RUN'}
                    </span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${source.last_run_status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    source.last_run_status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        isRunning ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                            'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                    {source.last_run_status || 'IDLE'}
                </div>
            </div>
        </div>
    );
};
