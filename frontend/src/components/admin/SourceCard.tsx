import React from 'react';

interface IngestionSource {
    id: number;
    source_name: string;
    source_type: string;
    frequency: string;
    last_run_status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'IDLE';
    ingestion_strategy: string;
    records_updated: number;
}

interface SourceCardProps {
    source: IngestionSource;
    onRun: (id: number) => void;
    disabled: boolean;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, onRun, disabled }) => {
    const statusColor = {
        'SUCCESS': 'bg-green-500/10 text-green-500 border-green-500/20',
        'FAILED': 'bg-red-500/10 text-red-500 border-red-500/20',
        'RUNNING': 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse',
        'IDLE': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${source.last_run_status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : source.last_run_status === 'SUCCESS' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <h4 className="font-semibold text-gray-900 text-sm">{source.source_name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{source.ingestion_strategy}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColor[source.last_run_status]}`}>
                    {source.last_run_status}
                </span>
            </div>

            <div className="flex justify-between items-end mt-4">
                <div className="text-xs text-gray-500">
                    <div className="mb-0.5">{source.frequency}</div>
                    <div>{source.records_updated.toLocaleString()} records</div>
                </div>

                <div className="flex gap-2">
                    {/* 
                     <button 
                        onClick={() => onToggle(source.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                        disabled={disabled}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </button>
                    */}
                    <button
                        onClick={() => onRun(source.id)}
                        disabled={disabled || source.last_run_status === 'RUNNING'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        RUN NOW
                    </button>
                </div>
            </div>
        </div>
    );
};
