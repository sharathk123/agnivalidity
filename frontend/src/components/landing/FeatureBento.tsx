import React from 'react';
import { motion } from 'framer-motion';

export const FeatureBento: React.FC = () => {
    return (
        <section className="bg-slate-950 py-24 relative overflow-hidden" id="bento-features">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

            <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">System Capabilities</span>
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
                    >
                        Total Command over <br className="hidden md:block" />
                        <span className="text-slate-500">Every Variable.</span>
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {/* Card A: Intelligence Spark */}
                    <BentoCard delay={0.1}>
                        <div className="h-full flex flex-col justify-between">
                            <div className="relative flex flex-col items-center justify-center gap-4 mb-6 pt-4">
                                {/* Gauge Visual */}
                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-emerald-500 border-r-emerald-500 rotate-45 relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-white font-mono">84</div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Score</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse z-10">
                                    Verdict: GO
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold font-display text-white tracking-tight mb-2">AI-Driven Market Verdicts.</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Instant go/no-go mandates based on 18-point regulatory analysis.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card B: Profitability Architect */}
                    <BentoCard delay={0.2}>
                        <div className="h-full flex flex-col justify-between">
                            <div className="mb-6 space-y-4 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        <span>Target FOB</span>
                                        <span className="text-white">₹1,250</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Margin</div>
                                    <div className="text-sm font-bold text-emerald-400 font-mono">+24.0%</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold font-display text-white tracking-tight mb-2">Interactive Margin Protection.</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Simulate pricing scenarios with real-time incentive realization logic.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card C: Compliance Watchdog */}
                    <BentoCard delay={0.3}>
                        <div className="h-full flex flex-col justify-between relative overflow-hidden group">
                            {/* Background Code */}
                            <div className="absolute top-0 left-0 text-[8px] font-mono text-indigo-500/10 select-none pointer-events-none leading-tight">
                                {`{ "schema": "v1.1", "valid": true, "check": ["HS", "CoO"] }`}
                            </div>

                            <div className="relative h-32 flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-slate-900 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></span>
                                    ICES 1.5 SYNC: OPTIMAL
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold font-display text-white tracking-tight mb-2">Regulatory Immunity.</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Automatic validation against JSON v1.1 schemas and DGFT notifications.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card D: Ingestion Pulse */}
                    <BentoCard delay={0.4}>
                        <div className="h-full flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-2 mb-8 content-start">
                                {['DGFT', 'APEDA', 'ICEGATE', 'REUTERS'].map((src) => (
                                    <div key={src} className="p-2 bg-slate-950 border border-slate-800 rounded flex flex-col gap-1" >
                                        <div className="flex justify-between items-center">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{src}</div>
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_currentColor]"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-800 pt-3 mb-2">
                                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                                    <span>LATENCY</span>
                                    <span className="text-emerald-400">0.4ms</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold font-display text-white tracking-tight mb-2">Real-Time Trade Streams.</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Live connection to global trade data pipelines for zero-latency insights.
                                </p>
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    );
};

const BentoCard = ({ children, delay }: { children: React.ReactNode, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-slate-900 border border-indigo-500/20 p-6 rounded-xl hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300 group h-full flex flex-col"
    >
        {children}
    </motion.div>
);

export default FeatureBento;
