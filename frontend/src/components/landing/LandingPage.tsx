import React from 'react';
import { motion } from 'framer-motion';
import SearchGateway from './SearchGateway';
import FeatureBento from './FeatureBento';
import ObsidianFooter from './ObsidianFooter';

const LandingPage: React.FC = () => {
    // Countdown timer removed as per Obsidian Hero design

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden relative">
            {/* Regulatory Patch Footer (Sticky) */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white py-2 px-4 z-[100] border-t border-slate-800">
                <div className="container mx-auto flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ICES 1.5 ACTIVE (SYNC: OK)
                    </span>
                    <span className="text-slate-700">|</span>
                    <span>2026 MANDATORY JSON V1.1 VALIDATION ACTIVE</span>
                    <span className="text-slate-700">|</span>
                    <span className="text-brand-400">QUARANTINE PROTOCOLS ENGAGED</span>
                </div>
            </div>

            {/* Navigation (Dark Mode for Hero) */}
            <nav className="absolute top-0 left-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(79,70,229,0.5)]">A</div>
                        <div>
                            <h1 className="text-xl font-bold font-display uppercase tracking-widest leading-none text-white">
                                Agni EXIM
                            </h1>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Intelligence</div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <NavLink href="#features" isDark>Terminal</NavLink>
                        <NavLink href="#compliance" isDark>Compliance</NavLink>
                        <NavLink href="#pricing" isDark>Pricing</NavLink>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">Login</button>
                        {/* 'Enter Terminal' removed as it is now the primary action in SearchGateway */}
                    </div>
                </div>
            </nav>

            {/* Obsidian Hero Section (The Data Void) */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-slate-950 overflow-hidden pt-20">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/80 to-slate-950"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto"
                    >
                        {/* Tagline */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Agni Engine v2.0 Live</span>
                        </div>

                        {/* Command Statement Headline */}
                        <h2 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                            Export Intelligence, <br />
                            Commanded.
                        </h2>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-normal">
                            Automate your 2026 compliance. Secure hidden margins. <br className="hidden md:block" />
                            Outpace the <span className="text-white font-semibold">Jan 31st ICEGATE migration</span> with the Agni Engine.
                        </p>

                        {/* Obsidian Search Gateway */}
                        <div className="mb-20">
                            <SearchGateway />
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator (Adjusted z-index and position) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                >
                    <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent"></div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Scroll to Command</span>
                </motion.div>
            </section>

            {/* Obsidian Feature Bento */}
            <FeatureBento />

            {/* Ingestion Stream Section */}
            <section className="bg-slate-900 py-24 text-white overflow-hidden relative" id="compliance">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="max-w-xl">
                            <h3 className="text-4xl font-display font-bold leading-none tracking-tight mb-6">
                                18/18 Live <br />
                                Ingestion Streams.
                            </h3>
                            <p className="text-slate-400 text-lg">
                                Our Mission Control monitors the heartbeat of global trade data.
                                Zero latency, zero compliance drift.
                            </p>
                        </div>
                        <div className="flex gap-8">
                            <Metric value="18/18" label="Stable Sources" />
                            <Metric value="0.4ms" label="Avg Latency" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <SourceTag name="APEDA" status="Stable" />
                        <SourceTag name="DGFT" status="Stable" />
                        <SourceTag name="Commerce" status="Stable" />
                        <SourceTag name="Tradestat" status="Active" />
                        <SourceTag name="ICEGATE" status="Synced" />
                        <SourceTag name="GSTN" status="Active" />
                    </div>

                    <div className="mt-20 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                        <div className="h-64 rounded-md bg-slate-950 p-6 font-mono text-sm overflow-hidden relative">
                            <div className="text-emerald-500 mb-2">AGNI://TELEMETRY_STREAM - [JAN 13, 2026]</div>
                            <div className="text-slate-500 space-y-1">
                                <div>[10:50:28] INITIALIZING ICES 1.5 HANDSHAKE...</div>
                                <div>[10:50:29] PAYLOAD SIGNATURE VERIFIED: SHA-256</div>
                                <div>[10:50:30] STREAM_SYNC: DGFT_LIVE (OK)</div>
                                <div>[10:50:30] STREAM_SYNC: ICEGATE_V2 (OK)</div>
                                <div>[10:50:31] UPDATING REGULATORY PATCH V1.1...</div>
                                <div>[10:50:32] COMPLIANCE_CHECK: ALL SYSTEMS OPTIMAL</div>
                                <div className="text-brand-400 animate-pulse">[10:50:33] WAITING FOR NEXT INGESTION CYCLE...</div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Obsidian Verdict Section */}
            <section className="bg-slate-950 py-32 border-t border-slate-900 relative overflow-hidden" id="features">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                        {/* Left Column: Verdict Intelligence */}
                        <div className="space-y-12">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Live Verdict Engine</span>
                                </div>
                                <h3 className="text-5xl font-display font-bold leading-tight tracking-tighter text-white mb-6">
                                    Instant AI Intelligence. <br />
                                    <span className="text-slate-500">Data-Driven Decisions.</span> <br />
                                    Margin-First Trading.
                                </h3>
                                <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                                    Stop relying on intuition. The Agni Engine processes 18 regulatory streams to deliver binary "GO/NO-GO" trading mandates.
                                </p>
                            </div>

                            {/* Vertical Bento Stack */}
                            <div className="space-y-4">
                                <ObsidianVerdictRow
                                    title="Basmati Rice Dehradun Premium"
                                    hsn="1006.30.20"
                                    verdict="GO"
                                    color="emerald"
                                />
                                <ObsidianVerdictRow
                                    title="Organic Soybean Meal V2"
                                    hsn="2304.00.10"
                                    verdict="AVOID"
                                    color="rose"
                                />
                                <ObsidianVerdictRow
                                    title="Frozen Shrimp (Vannamei)"
                                    hsn="0306.17.20"
                                    verdict="CAUTION"
                                    color="amber"
                                />
                            </div>
                        </div>

                        {/* Right Column: Enterprise Calculator (Obsidian Style) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-800">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Profitability Architect</div>
                                    <div className="text-sm font-bold text-white">Scenario: EXIM-2026-A</div>
                                </div>
                                <div className="p-2 bg-slate-800 rounded text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Unit Cost (FOB)</label>
                                        <span className="text-white font-mono font-bold">₹1,240</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 w-3/4 relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow cursor-pointer"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Advantages</div>
                                        <div className="text-lg font-bold text-emerald-500 font-mono">+₹240.00</div>
                                    </div>
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Margin Benefit</div>
                                        <div className="text-lg font-bold text-indigo-400 font-mono">+24.00%</div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-800">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Recommended Target FOB</div>
                                    <div className="text-4xl font-display font-bold text-white tracking-tight">₹1,000.00</div>
                                    <div className="text-[9px] text-slate-500 font-medium mt-2 max-w-xs leading-relaxed">
                                        *Includes RoDTEP & DBK benefits. Margin protected at 2026 rates.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Footer */}

            </section>

            {/* Obsidian Footer */}
            <ObsidianFooter />
        </div>
    );
};

const NavLink = ({ href, children, isDark }: { href: string, children: React.ReactNode, isDark?: boolean }) => (
    <a href={href} className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-brand-600'}`}>{children}</a>
);



const Metric = ({ value, label }: { value: string, label: string }) => (
    <div className="text-right">
        <div className="text-2xl font-display font-bold text-white leading-none">{value}</div>
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{label}</div>
    </div>
);

const SourceTag = ({ name, status }: { name: string, status: string }) => (
    <div className="px-4 py-3 bg-slate-800/50 border border-slate-800 rounded flex flex-col gap-1">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{name}</div>
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
            {status}
        </div>
    </div>
);

const ObsidianVerdictRow = ({ title, hsn, verdict, color }: { title: string, hsn: string, verdict: 'GO' | 'AVOID' | 'CAUTION', color: 'emerald' | 'rose' | 'amber' }) => {
    const colorStyles = {
        emerald: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        rose: { border: 'border-l-rose-500', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
        amber: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' }
    };

    return (
        <div className={`p-5 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-between hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all group ${colorStyles[color].border} border-l-2`}>
            <div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center gap-2">
                    <span className="text-indigo-500">HSN:</span>
                    <span className="tracking-wider">{hsn}</span>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest ${colorStyles[color].badge}`}>
                {verdict}
            </div>
        </div>
    );
};




export default LandingPage;
