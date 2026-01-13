import React from 'react';
import { Check, ShieldCheck, Zap } from 'lucide-react';

const ObsidianPricing: React.FC = () => {
    return (
        <section className="bg-slate-950 py-32 relative overflow-hidden" id="pricing">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/80 to-slate-950 pointer-events-none"></div>

            <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">2026 Compliance Ready</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tighter mb-6">
                        Clearance Levels.
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Select your operational tier. All plans include the <span className="text-indigo-400 font-semibold">Jan 31st Regulatory Patch</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Tier 1: The Scout */}
                    <PricingCard
                        title="The Scout"
                        description="For individual SME exporters testing the waters."
                        price="₹0"
                        features={[
                            "Basic HS Search (8-digit)",
                            "Manual Market Scoring",
                            "ICEGATE 1.5 Schema Check (Manual)",
                            "Standard Support Email",
                            "5 Lookups / Day"
                        ]}
                    />

                    {/* Tier 2: The Commander (Primary) */}
                    <PricingCard
                        title="The Commander"
                        description="Active exporters needing margin protection."
                        price="₹4,999"
                        isPrimary
                        features={[
                            "10-digit Precision Intelligence",
                            "Full Profitability Architect",
                            "Automated RoDTEP/DBK Realization",
                            "Unlimited PDF Pro Forma Generation",
                            "Priority HS Classification",
                            "Real-time Compliance Alerts"
                        ]}
                    />

                    {/* Tier 3: The Fleet Admiral */}
                    <PricingCard
                        title="The Fleet Admiral"
                        description="Large export houses managing high-volume ingestion."
                        price="Custom"
                        features={[
                            "Full API Access (JSON v1.1)",
                            "Mission Control Dashboard (Admin)",
                            "Real-time 0.4ms Ingestion Feeds",
                            "Prioritized ICES 1.5 Syncing",
                            "Dedicated Account Manager",
                            "Custom ERP Integration"
                        ]}
                        footer="UPLINK_STATUS: PRIORITY_NODE"
                    />
                </div>

                {/* Guarantee Badge */}
                <div className="mt-24 text-center">
                    <div className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-950/10 px-4 py-2 rounded border border-emerald-900/50">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">2026 Compliance Guarantee Active</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({
    title,
    description,
    price,
    features,
    isPrimary,
    footer
}: {
    title: string,
    description: string,
    price: string,
    features: string[],
    isPrimary?: boolean,
    footer?: string
}) => {
    return (
        <div className={`
            relative p-8 rounded-lg border flex flex-col h-full bg-[#0f172a] transition-all duration-300
            ${isPrimary
                ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)] scale-105 z-10'
                : 'border-slate-700/50 hover:border-slate-600'
            }
        `}>
            {isPrimary && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        Protocol Maximized
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-[0.1em] mb-2">
                    {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed min-h-[40px]">
                    {description}
                </p>
            </div>

            {/* Price */}
            <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-display font-bold text-white tracking-tight">
                    {price}
                </span>
                {price !== "Custom" && (
                    <span className="text-slate-500 font-mono text-xs">/month</span>
                )}
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 ${isPrimary ? 'text-indigo-400' : 'text-slate-500'}`}>
                            <Check className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium ${isPrimary ? 'text-slate-200' : 'text-slate-400'}`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <button className={`
                w-full py-4 px-6 rounded text-xs font-black uppercase tracking-[0.2em] transition-all
                ${isPrimary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                }
            `}>
                {isPrimary ? 'Deploy System' : 'Initialize'}
            </button>

            {/* Technical Footer (Enterprise) */}
            {footer && (
                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-500 tracking-widest uppercase animate-pulse">
                        {footer}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ObsidianPricing;
