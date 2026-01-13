import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, CheckCircle } from 'lucide-react';

interface ComplianceGuardProps {
    icegateStatus: string; // 'IDLE', 'RUNNING', 'FAILED' (Critical)
}

export const ComplianceGuard: React.FC<ComplianceGuardProps> = ({ icegateStatus }) => {
    const isCritical = icegateStatus === 'FAILED';

    return (
        <div className={`corporate-card mb-8 transition-colors ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${isCritical ? 'bg-rose-600 text-white' : 'bg-brand-600 text-white'}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Compliance Guard (ICEGATE v1.1)
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Jan 31st Regulatory Readiness Buffer</p>
                    </div>
                </div>
                {isCritical && (
                    <div className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
                        Schema Drift Detected
                    </div>
                )}
            </div>

            <div className={`p-6 rounded border flex flex-col md:flex-row md:items-center gap-12 ${isCritical ? 'bg-white border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live ICEGATE Schema</div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold font-display ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>{isCritical ? '1.2' : '1.1'}</span>
                        {isCritical && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">DRIFT detected</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">Latency: 12ms</div>
                </div>

                <div className="hidden md:block h-10 w-px bg-slate-200"></div>

                <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Ingestion Logic</div>
                    <div className="text-2xl font-bold font-display text-slate-900">1.1</div>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Validated: Jan 2026 Fleet</div>
                </div>

                <div className="md:ml-auto text-right">
                    {isCritical ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-end gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                                <AlertTriangle size={14} /> Critical Mapping Error
                            </div>
                            <button className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded shadow-lg shadow-rose-200 transition-all flex items-center gap-2 ml-auto">
                                <Lock size={12} /> Force Schema Update
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle size={16} /> Integrity Verified
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
