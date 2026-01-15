import React, { useState } from 'react';
import { ShieldCheck, FileText, Zap, AlertTriangle, CheckCircle2, Award, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FTAData } from '../../data/ftaData';

// --- Types ---
interface FTANavigatorProps {
    activeMarket: FTAData | null;
    shipmentValue?: number;
}

// --- HUD Component: Savings Overlay ---
export const FTASavingsOverlay: React.FC<{ market: FTAData; value?: number }> = ({ market, value = 50000 }) => {
    const savings = (market.standardRate - market.dutyRate) * (value / 100);

    return (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl p-5 rounded-xl shadow-xl dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] min-w-[280px] font-mono border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-500/10 rounded border border-amber-200 dark:border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">FTA Intelligence</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{market.agreementName}</h4>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-500">STANDARD MFN RATE</span>
                    <span className="text-rose-500 dark:text-rose-400 font-bold">{market.standardRate}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-500">AGNI FTA RATE</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{market.dutyRate}%</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded mt-4">
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-500/70 font-black uppercase mb-1">Potential Net Gain</div>
                    <div className="text-xl text-emerald-600 dark:text-emerald-400 font-bold tracking-tighter">
                        ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[8px] text-slate-500 dark:text-slate-500 mt-1 uppercase">Based on ${value.toLocaleString()} Shipment</div>
                </div>
            </div>

            {market.specialFlags && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {market.specialFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded text-[8px] text-indigo-600 dark:text-indigo-300 font-bold uppercase">
                            <Award className="w-2.5 h-2.5" />
                            {flag}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- HUD Component: NZ Bio-Security Shield ---
export const NZBioSecurityShield: React.FC<{ market: FTAData }> = ({ market }) => {
    if (market.country !== "New Zealand") return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 font-mono"
        >
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Bio-Security Compliance</span>
            </div>

            <div className="space-y-2">
                {market.specialChecklist?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-3 h-3 border border-slate-300 dark:border-slate-700 rounded-sm flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                            <CheckCircle2 className="w-2 h-2 text-emerald-500 opacity-0 group-hover:opacity-100" />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">{item}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-2 bg-amber-100 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[9px] text-amber-700 dark:text-amber-400/80 leading-relaxed capitalize">
                    Phytosanitary rules strictly enforced. Mandatory AYUSH pathway active for 2026 wellness exports.
                </p>
            </div>
        </motion.div>
    );
};

// --- Main Container Component ---
export const FTANavigator: React.FC<FTANavigatorProps> = ({ activeMarket }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleGenerateCoO = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        }, 2000);
    };

    if (!activeMarket) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Advantage Badge (Pulsing) */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
                    <div className="relative p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full border border-amber-300 dark:border-amber-500/40">
                        <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] animate-pulse">FTA Advantage Active</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{activeMarket.agreementName}</h3>
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded">
                    <div className="text-[8px] text-slate-500 dark:text-slate-500 uppercase font-bold mb-1">Standard MFN</div>
                    <div className="text-xl font-bold text-rose-500 dark:text-rose-400 font-mono">{activeMarket.standardRate}%</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded">
                    <div className="text-[8px] text-emerald-600 dark:text-emerald-500/70 uppercase font-bold mb-1">Agni Optima</div>
                    <div className="text-xl font-bold text-emerald-500 dark:text-emerald-400 font-mono">{activeMarket.dutyRate}%</div>
                </div>
            </div>

            {/* Bio-Security for NZ */}
            {activeMarket.country === "New Zealand" && <NZBioSecurityShield market={activeMarket} />}

            {/* UAE Logistics Flag */}
            {activeMarket.country === "UAE" && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-lg flex items-center gap-3">
                    <Truck className="w-5 h-5 text-indigo-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-indigo-400 uppercase">Logistics Multiplier</span>
                        <span className="text-[10px] text-slate-300">Direct-to-UAE routing identified. 12% lead time reduction.</span>
                    </div>
                </div>
            )}

            {/* Action Button: e-CoO */}
            <button
                onClick={handleGenerateCoO}
                disabled={isGenerating}
                className={`mt-2 w-full py-4 rounded-lg font-mono font-black text-[11px] uppercase tracking-widest transition-all overflow-hidden relative group ${isSuccess ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div
                            key="loading"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            exit={{ y: -20 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            SYNERGIZING DGFT_DATA...
                        </motion.div>
                    ) : isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            E-COO GENERATED
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ y: 0 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            Generate e-CoO (DGFT Portal)
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Bar background if generating */}
                {isGenerating && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2 }}
                        className="absolute bottom-0 left-0 h-1 bg-amber-500 opacity-50"
                    />
                )}
            </button>

            <div className="text-[8px] text-slate-500 dark:text-slate-600 text-center font-mono uppercase tracking-widest">
                Automated certificate generation uses ICES 2.0 encrypted pathways
            </div>
        </div>
    );
};
