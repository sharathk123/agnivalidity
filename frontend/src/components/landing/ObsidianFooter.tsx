import { Github, FileText, Globe, Shield, Code } from 'lucide-react';

const ObsidianFooter: React.FC = () => {
    return (
        <footer className="bg-[#020617] text-slate-400 relative border-t border-slate-800">
            {/* 1. Compliance Ticker (Heartbeat) */}
            <div className="h-10 bg-slate-900/50 backdrop-blur-sm border-b border-indigo-500/20 overflow-hidden flex items-center relative z-10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee">
                    <TickerItem label="LIVE_NODES" value="18/18" />
                    <TickerItem label="ICES_1.5_SYNC" value="ACTIVE" color="text-emerald-400" />
                    <TickerItem label="SCHEMA_v1.1" value="VALIDATED" color="text-indigo-400" />
                    <TickerItem label="LATENCY" value="0.4ms" />
                    <TickerItem label="LAST_SYNC" value={new Date().toLocaleTimeString('en-US', { hour12: false })} />
                    <TickerItem label="TOTAL_RECORDS" value="1,402,931" />
                    <TickerItem label="QUARANTINE_PROTOCOL" value="ENGAGED" color="text-rose-400" />
                    {/* Duplicate for seamless loop */}
                    <TickerItem label="LIVE_NODES" value="18/18" />
                    <TickerItem label="ICES_1.5_SYNC" value="ACTIVE" color="text-emerald-400" />
                    <TickerItem label="SCHEMA_v1.1" value="VALIDATED" color="text-indigo-400" />
                    <TickerItem label="LATENCY" value="0.4ms" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* 2. Structural Navigation & Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-slate-800/50">
                    <FooterColumn title="Analysis Modules">
                        <FooterLink href="#" label="Price Discovery Engine" />
                        <FooterLink href="#" label="Duty Drawback Calculator" />
                        <FooterLink href="#" label="RoDTEP Scraper" />
                        <FooterLink href="#" label="Harmonized System Search" />
                    </FooterColumn>

                    <FooterColumn title="Compliance Core">
                        <FooterLink href="#" label="ICES 1.5 Integration" />
                        <FooterLink href="#" label="Shipping Bill Validator" />
                        <FooterLink href="#" label="e-BRC Realization" />
                        <FooterLink href="#" label="GST Refund Scroll" />
                    </FooterColumn>

                    <FooterColumn title="Company">
                        <FooterLink href="#" label="About Agni" />
                        <FooterLink href="#" label="Strategic Partners" />
                        <FooterLink href="#" label="System Status" />
                        <FooterLink href="#" label="Security Protocols" />
                    </FooterColumn>

                    <FooterColumn title="Legal & Policy">
                        <FooterLink href="#" label="Data Privacy (DPDP 2023)" />
                        <FooterLink href="#" label="Terms of Service" />
                        <FooterLink href="#" label="API Usage Policy" />

                        {/* Agni Guarantee Badge */}
                        <div className="mt-8 p-4 border border-slate-800 bg-slate-900/40 rounded-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Agni Guarantee</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                                Engineered for the <span className="text-indigo-400">2026 Indian EXIM Transition</span>. Zero-latency compliance for high-velocity exporters.
                            </p>
                        </div>
                    </FooterColumn>
                </div>

                {/* 3. Branding & Status Anchor */}
                <div className="border-t border-slate-800 py-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Left Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/20 rounded-sm hover:border-emerald-500/40 transition-colors cursor-help group">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase font-mono group-hover:text-emerald-400">IC_1.5_READY</span>
                    </div>

                    {/* Center Copyright & Signature */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <SocialIcon icon={<Github className="w-4 h-4" />} label="GitHub" />
                            <SocialIcon icon={<FileText className="w-4 h-4" />} label="Docs" />
                            <SocialIcon icon={<Globe className="w-4 h-4" />} label="Network" />
                        </div>
                        <p className="text-[10px] text-slate-600 font-mono tracking-wide">
                            © 2026 AGNI EXIM INSIGHTS. <span className="text-slate-500">Built for Exporters, by Exporters.</span>
                        </p>
                    </div>

                    {/* Right Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-950/20 border border-indigo-500/20 rounded-sm hover:border-indigo-500/40 transition-colors cursor-help group">
                        <Code className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-500 tracking-widest uppercase font-mono group-hover:text-indigo-400">JSON_v1.1_COMPLIANT</span>
                    </div>
                </div>
            </div>

            {/* Global Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
        </footer>
    );
};

const TickerItem = ({ label, value, color = "text-slate-200" }: { label: string, value: string, color?: string }) => (
    <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-slate-600 font-bold">{label}:</span>
        <span className={`${color} font-bold tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}>{value}</span>
    </div>
);

const FooterColumn = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="py-12 px-6 flex flex-col gap-4">
        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] font-display mb-2">{title}</h4>
        <div className="flex flex-col gap-3">
            {children}
        </div>
    </div>
);

const FooterLink = ({ href, label }: { href: string, label: string }) => (
    <a href={href} className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group w-fit">
        <span className="w-1 h-1 bg-slate-800 rounded-full group-hover:bg-indigo-500 transition-colors"></span>
        {label}
    </a>
);

const SocialIcon = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <a href="#" className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" aria-label={label}>
        {icon}
    </a>
);

export default ObsidianFooter;
