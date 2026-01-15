import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, TrendingUp, Ship, RefreshCw, Layers, Box, Activity, Award, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { ftaMarkets } from '../../data/ftaData';
import type { FTAData } from '../../data/ftaData';
import { FTANavigator, FTASavingsOverlay } from './FTANavigator';
import { useTheme } from '../../contexts/ThemeContext';

// --- Types ---
interface DemandOrb {
    id: number;
    name: string;
    lat: number;
    lng: number;
    volume: number;
    growth: string;
    product?: string;
}

interface ExpansionMarket {
    country: string;
    growth: string;
    goods: string;
    score: number;
}

// --- Sub-Components ---

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = React.memo(({ label, value, icon }) => (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/30 p-2.5 rounded shadow-lg dark:shadow-2xl flex flex-col min-w-[100px] border-l-2 border-l-indigo-500">
        <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-indigo-600 dark:text-indigo-400/80">{icon}</span>
        </div>
        <div className="text-md font-display font-black text-slate-900 dark:text-white leading-none">
            {value}
        </div>
    </div>
));

const ExpansionMarketCard: React.FC<{ market: ExpansionMarket; index: number; isFTA?: boolean }> = React.memo(({ market, index, isFTA }) => (
    <div
        className={`p-4 bg-white dark:bg-slate-950/50 border rounded group transition-all animate-in fade-in slide-in-from-right-2 duration-300 ${isFTA ? 'border-amber-400 dark:border-amber-500/20 hover:border-amber-500' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/30'
            }`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-display tracking-tight flex items-center gap-2">
                    {market.country}
                    {isFTA && <Award className="w-3 h-3 text-amber-500" />}
                </span>
                {isFTA && <span className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">FTA ACTIVE</span>}
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{market.growth}</span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono uppercase truncate">
            Demand: {market.goods}
        </div>
    </div>
));

const FTAListItem: React.FC<{ market: FTAData; onClick: () => void; index: number }> = React.memo(({ market, onClick, index }) => (
    <div
        onClick={onClick}
        className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/50 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-slate-900/50 rounded cursor-pointer group transition-all duration-300 animate-in fade-in slide-in-from-right-2"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-display flex items-center gap-2">
                {market.country}
                <Award className="w-3 h-3 text-amber-500/70 dark:text-amber-500/50 group-hover:text-amber-500 transition-colors" />
            </span>
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-500/80 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 truncate max-w-[120px]">
                {market.agreementName}
            </span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono uppercase">
                Duty: <span className="text-emerald-600 dark:text-emerald-400">{market.dutyRate}%</span> <span className="text-slate-400 dark:text-slate-600">vs</span> <span className="text-red-500 dark:text-red-400/70 line-through decoration-red-500/50">{market.standardRate}%</span>
            </span>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500/80 uppercase tracking-wider">SAVINGS ACTIVE</span>
        </div>
    </div>
));

const DemandTooltip: React.FC<{ orb: DemandOrb }> = ({ orb }) => (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 backdrop-blur-xl p-5 rounded-xl shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden min-w-[240px]">
        {/* Signature ODOP Corner Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-30 bg-emerald-500 pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Market Intel</span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight leading-tight">{orb.name}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">{orb.growth}</span>
            </div>

            <div className="space-y-3">
                <div className="bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase">Product</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 truncate max-w-[140px]">{orb.product || "General Trade"}</span>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Volume</div>
                        <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">{orb.volume}/100</div>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg border-l-2 border-l-emerald-500/50">
                        <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Trend</div>
                        <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">Stable</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/50 flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest leading-none">
                <Activity className="w-3 h-3 text-indigo-500" />
                Live Demand Signal
            </div>
        </div>
    </div>
);



// --- Main Component ---

export const GlobalDemandHeatmap: React.FC = () => {
    const { theme } = useTheme();
    const [orbs, setOrbs] = useState<DemandOrb[]>([]);
    const [markets, setMarkets] = useState<ExpansionMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<string>('00:00:00');
    const [hoveredOrb, setHoveredOrb] = useState<number | null>(null);
    const [focusedFTA, setFocusedFTA] = useState<FTAData | null>(null);

    // Dynamic map tile URL based on theme
    const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const metrics = useMemo(() => {
        const uniqueProducts = new Set(orbs.map(o => o.product).filter(Boolean));
        const avgGrowth = orbs.length > 0
            ? Math.round(orbs.reduce((acc, curr) => acc + parseInt(curr.growth.replace('+', '').replace('%', '')), 0) / orbs.length)
            : 0;
        return {
            totalOrbs: orbs.length,
            uniqueProducts: uniqueProducts.size,
            avgGrowth: avgGrowth
        };
    }, [orbs]);

    const fetchDemand = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/global-demand');
            setOrbs(res.data.orbs);
            setMarkets(res.data.expansion_markets);
            setLastSync(res.data.last_sync);
        } catch (error) {
            console.error("Failed to fetch demand data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDemand();
        const interval = setInterval(fetchDemand, 60000);
        return () => clearInterval(interval);
    }, [fetchDemand]);

    return (
        <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-lg h-full flex overflow-hidden shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] relative transition-colors duration-300">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none z-0"></div>

            {/* Sidebar Ticker (25%) */}
            <div className="w-1/4 border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col z-10 relative transition-colors duration-300">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded border border-indigo-200 dark:border-indigo-500/20">
                                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest font-display">Agni Intelligence</h3>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest pl-1">
                            {loading ? "Establishing Uplink..." : `Last Sync: ${lastSync}`}
                        </div>
                    </div>
                    <button
                        onClick={fetchDemand}
                        disabled={loading}
                        className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 disabled:opacity-50"
                        title="Sync Now"
                    >
                        <RefreshCw className={`w-3 h-3 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {focusedFTA ? (
                            <motion.div
                                key="fta-nav"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                        <Award className="w-3 h-3" />
                                        FTA Optimizer Active
                                    </div>
                                    <button
                                        onClick={() => setFocusedFTA(null)}
                                        className="text-[9px] text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase font-bold"
                                    > Close </button>
                                </div>
                                <FTANavigator activeMarket={focusedFTA} />

                                {/* Intelligence Injection: Sanction Check Logic */}
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verified Buyer Network (Sanction Scan)
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'BUY-001', name: 'Global Logistics GmbH', risk: 'SAFE' },
                                            { id: 'BUY-002', name: 'Oceanic Trade Ltd', risk: 'SAFE' },
                                            { id: 'BUY-003', name: 'North Sea Import Co', risk: 'HIGH_RISK' }
                                        ].map((buyer) => (
                                            <div key={buyer.id} className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{buyer.name}</div>
                                                    <div className="text-[9px] font-mono text-slate-500 dark:text-slate-500">{buyer.id}</div>
                                                </div>

                                                {buyer.risk === 'SAFE' ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase">Sanctioned</span>
                                                    </div>
                                                )}

                                                {/* Block Overlay for Risk */}
                                                {buyer.risk === 'HIGH_RISK' && (
                                                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[1px] flex items-center justify-center rounded border border-rose-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-not-allowed">
                                                        <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            Contact Blocked
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="market-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" />
                                    Top 5 Expansion Markets (2026)
                                </div>

                                {markets.map((market, idx) => {
                                    const isFTA = ftaMarkets.some(f => f.country.toLowerCase() === market.country.toLowerCase());
                                    return (
                                        <div key={market.country} onClick={() => {
                                            const fta = ftaMarkets.find(f => f.country.toLowerCase() === market.country.toLowerCase());
                                            if (fta) setFocusedFTA(fta);
                                        }} className="cursor-pointer">
                                            <ExpansionMarketCard market={market} index={idx} isFTA={isFTA} />
                                        </div>
                                    );
                                })}

                                {markets.length === 0 && !loading && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono text-center py-4 border border-dashed border-slate-300 dark:border-slate-800 rounded">
                                        NO UPWARD TRENDS DETECTED
                                    </div>
                                )}

                                <div className="pt-6 pb-2 border-t border-slate-200 dark:border-slate-800/50">
                                    <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Award className="w-3 h-3" />
                                        Strategic FTA Partners
                                    </div>
                                    <div className="space-y-3">
                                        {ftaMarkets.map((market, idx) => (
                                            <FTAListItem
                                                key={market.country}
                                                market={market}
                                                index={idx}
                                                onClick={() => setFocusedFTA(market)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 animate-pulse">
                        <Ship className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">
                            {loading ? "SCANNING SHIPMENTS..." : "AIS VESSEL STREAM ACTIVE"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Engine (75%) */}
            <div className={`w-3/4 relative z-0 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'}`}>
                <MapContainer center={[20, 0]} zoom={2.5} minZoom={2.5} maxZoom={6} maxBounds={[[-85, -180], [85, 180]]} maxBoundsViscosity={1.0} style={{ height: '100%', width: '100%', background: theme === 'light' ? '#f1f5f9' : '#020617' }} zoomControl={false} attributionControl={false}>
                    <TileLayer key={theme} url={tileUrl} />

                    {/* Standard Demand Orbs */}
                    {orbs.map(orb => (
                        <React.Fragment key={orb.id}>
                            <CircleMarker
                                center={[orb.lat, orb.lng]}
                                eventHandlers={{
                                    mouseover: () => setHoveredOrb(orb.id),
                                    mouseout: () => setHoveredOrb(null),
                                }}
                                pathOptions={{
                                    color: 'transparent',
                                    fillColor: '#10b981',
                                    fillOpacity: 0.8,
                                    weight: 0,
                                }}
                                radius={7}
                                className="animate-glow cursor-pointer"
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={hoveredOrb === orb.id} className="glass-tooltip">
                                    <DemandTooltip orb={orb} />
                                </Tooltip>
                            </CircleMarker>
                        </React.Fragment>
                    ))}

                    {/* FTA Special Markers */}
                    {ftaMarkets.map(market => (
                        <CircleMarker
                            key={`fta-${market.country}`}
                            center={[market.lat, market.lng]}
                            eventHandlers={{
                                click: () => setFocusedFTA(market),
                            }}
                            pathOptions={{
                                color: 'transparent',
                                fillColor: '#fbbf24', // Gold-400
                                fillOpacity: 1,
                                weight: 0,
                            }}
                            radius={7}
                            className="animate-pulse cursor-pointer"
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="glass-tooltip" sticky>
                                <FTASavingsOverlay market={market} />
                            </Tooltip>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* 📊 Metrics HUD Overlay */}
                {!loading && metrics.totalOrbs > 0 && (
                    <div className="absolute bottom-6 left-6 z-[1000] flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 pointer-events-none">
                        <MetricCard label="Demand Hubs" value={metrics.totalOrbs} icon={<Layers className="w-3 h-3" />} />
                        <MetricCard label="Market Products" value={metrics.uniqueProducts} icon={<Box className="w-3 h-3" />} />
                        <MetricCard label="Avg Growth" value={`+${metrics.avgGrowth}%`} icon={<Activity className="w-3 h-3" />} />
                    </div>
                )}

                {/* Status Overlay */}
                <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500/80 bg-slate-950/80 px-2 py-1 rounded backdrop-blur border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                        <Award className="w-3 h-3 animate-spin duration-3000" />
                        <span>FTA ADVANTAGE MODE: ACTIVE</span>
                    </div>
                    <div className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest bg-slate-950/50 px-2 py-1 rounded backdrop-blur">
                        BUILD_VERSION: 2.0.26_HUD
                    </div>
                </div>
            </div>
        </div>
    );
};
