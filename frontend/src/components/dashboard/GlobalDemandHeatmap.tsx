import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, TrendingUp, Ship, Navigation, RefreshCw, Layers, Box, Activity } from 'lucide-react';
import api from '../../services/api';

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
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/30 p-2.5 rounded shadow-2xl flex flex-col min-w-[100px] border-l-2 border-l-indigo-500">
        <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-indigo-400/80">{icon}</span>
        </div>
        <div className="text-md font-display font-black text-white leading-none">
            {value}
        </div>
    </div>
));

const ExpansionMarketCard: React.FC<{ market: ExpansionMarket; index: number }> = React.memo(({ market, index }) => (
    <div
        className="p-4 bg-slate-950/50 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all animate-in fade-in slide-in-from-right-2 duration-300"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-slate-200 font-display tracking-tight">{market.country}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">+{market.growth}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono uppercase truncate">
            Demand: {market.goods}
        </div>
    </div>
));

const DemandTooltip: React.FC<{ orb: DemandOrb }> = ({ orb }) => (
    <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl p-5 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden min-w-[240px]">
        {/* Signature ODOP Corner Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-30 bg-emerald-500 pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Intel</span>
                    <h4 className="text-lg font-bold text-white font-display uppercase tracking-tight leading-tight">{orb.name}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{orb.growth}</span>
            </div>

            <div className="space-y-3">
                <div className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Product</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 truncate max-w-[140px]">{orb.product || "General Trade"}</span>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Volume</div>
                        <div className="text-sm font-mono font-bold text-white">{orb.volume}/100</div>
                    </div>
                    <div className="flex-1 bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg border-l-2 border-l-emerald-500/50">
                        <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Trend</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">Stable</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
                <Activity className="w-3 h-3 text-indigo-500" />
                Live Demand Signal
            </div>
        </div>
    </div>
);

// --- Main Component ---

export const GlobalDemandHeatmap: React.FC = () => {
    const [orbs, setOrbs] = useState<DemandOrb[]>([]);
    const [markets, setMarkets] = useState<ExpansionMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<string>('00:00:00');
    const [hoveredOrb, setHoveredOrb] = useState<number | null>(null);

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
        <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg h-full flex overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none z-0"></div>

            {/* Sidebar Ticker (25%) */}
            <div className="w-1/4 border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col z-10 relative">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                                <Globe className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Global Demand</h3>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
                            {loading ? "Establishing Uplink..." : `Last Sync: ${lastSync}`}
                        </div>
                    </div>
                    <button
                        onClick={fetchDemand}
                        disabled={loading}
                        className="bg-slate-800/50 hover:bg-slate-700/50 p-1.5 rounded-full border border-slate-700/50 transition-all active:scale-95 disabled:opacity-50"
                        title="Sync Now"
                    >
                        <RefreshCw className={`w-3 h-3 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        Top 5 Expansion Markets (2026)
                    </div>

                    {markets.map((market, idx) => (
                        <ExpansionMarketCard key={market.country} market={market} index={idx} />
                    ))}

                    {markets.length === 0 && !loading && (
                        <div className="text-[10px] text-slate-500 font-mono text-center py-4 border border-dashed border-slate-800 rounded">
                            NO UPWARD TRENDS DETECTED
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
                        <Ship className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {loading ? "SCANNING SHIPMENTS..." : "AIS VESSEL STREAM ACTIVE"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Engine (75%) */}
            <div className="w-3/4 relative z-0 bg-slate-950">
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false} attributionControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

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
                                    fillOpacity: 1,
                                    weight: 0,
                                }}
                                radius={9}
                                className="animate-glow cursor-pointer"
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={hoveredOrb === orb.id} className="glass-tooltip">
                                    <DemandTooltip orb={orb} />
                                </Tooltip>
                            </CircleMarker>
                        </React.Fragment>
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
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/80 bg-slate-950/80 px-2 py-1 rounded backdrop-blur">
                        <Navigation className="w-3 h-3" />
                        <span>COORDINATES LOCK: ENABLED</span>
                    </div>
                    <div className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest bg-slate-950/50 px-2 py-1 rounded backdrop-blur">
                        SYSTEM_ID: AGNI-01
                    </div>
                </div>
            </div>
        </div>
    );
};
