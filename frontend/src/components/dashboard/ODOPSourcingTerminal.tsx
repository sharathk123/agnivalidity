import React, { useState, useMemo, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Boxes, BadgeCheck, Scale, MousePointer2, RefreshCw } from 'lucide-react';

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
// import { scaleLinear } from 'd3-scale'; // Unused for now, kept for future heatmap scaling

const INDIA_TOPO_JSON = "/india-districts.json"; // Ensure this file exists in public/



// Type Definition
interface OdopRecord {
    id: string;
    name: string;
    state: string;
    product: string;
    product_name?: string; // Add support for both if needed, but registry uses product_name
    hsCode: string;
    hs_code?: string;

    gi: boolean;
    deh: boolean;
    localPrice: number;
    globalPrice: number;
    premiumPotential: number;
    brandLineage: string;
    giStatus: string;
    capacity: string;
    lat: number;
    lng: number;
}

// Global cache to prevent re-fetching/re-parsing 9.4MB JSON on every mount
let cachedIndiaData: any = null;

export const ODOPSourcingTerminal: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const [registry, setRegistry] = useState<Record<string, OdopRecord>>({});
    const [geoData, setGeoData] = useState<any>(cachedIndiaData);
    const [loading, setLoading] = useState(true);

    // Fetch ODOP Data from Backend
    const fetchRegistry = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/odop-registry');
            if (response.ok) {
                const data = await response.json();
                setRegistry(data);
            }
        } catch (error) {
            console.error("Failed to fetch ODOP registry:", error);
        } finally {
            if (cachedIndiaData) setLoading(false);
        }
    };

    // Load GeoData with caching
    useEffect(() => {
        const loadGeoData = async () => {
            if (cachedIndiaData) {
                setGeoData(cachedIndiaData);
                return;
            }

            try {
                const response = await fetch(INDIA_TOPO_JSON);
                const data = await response.json();
                cachedIndiaData = data;
                setGeoData(data);
            } catch (err) {
                console.error("Failed to load map data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadGeoData();
    }, []);

    // Metrics Calculation
    const metrics = useMemo(() => {
        const hubs = Object.values(registry);
        return {
            totalHubs: hubs.length,
            totalDistricts: new Set(hubs.map(h => h.name)).size,
            totalProducts: new Set(hubs.map(h => h.product || h.product_name)).size
        };
    }, [registry]);

    useEffect(() => {
        fetchRegistry();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchRegistry, 60000);
        return () => clearInterval(interval);
    }, []);

    const activeDistrictName = selectedDistrict || hoveredDistrict;
    const activeData = activeDistrictName ? registry[activeDistrictName] : null;

    // Calculate arbitrage safely
    const arbitrage = activeData
        ? ((activeData.globalPrice - activeData.localPrice) / activeData.localPrice * 100).toFixed(1)
        : '0.0';

    const handleInitiateSourcing = () => {
        if (!activeData) return;

        const params = new URLSearchParams({
            hs_code: activeData.hsCode || '',
            base_cost: activeData.localPrice.toString(),
            product_name: activeData.product,
            gi_status: activeData.giStatus
        });

        navigate(`/user/pricing-engine?${params.toString()}`);
    };

    return (
        <div className="bg-slate-950/90 border border-slate-700/50 rounded-lg h-full flex overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] relative select-none">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>

            <div className="flex w-full h-full relative z-10">
                {/* 1. Interactive Map Area (65%) */}
                <div className="w-[65%] border-r border-slate-800/50 relative bg-slate-900/40 z-0 overflow-hidden">

                    <div className="absolute top-6 left-6 z-[10] flex justify-between w-[calc(100%-48px)] pointer-events-none">
                        <div>
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Sourcing Map</h3>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                                {loading ? "Syncing with Invest India..." : `One District One Product • India • ${metrics.totalHubs} Verified Hubs Active`}
                            </div>

                        </div>
                        <button
                            onClick={() => fetchRegistry()}
                            disabled={loading}
                            className="pointer-events-auto bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 p-2 rounded-full transition-all group active:scale-90 disabled:opacity-50"
                            title="Sync Data"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {!geoData ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950/20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generating Sourcing Hubs...</span>
                            </div>
                        </div>
                    ) : (
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 1100,
                                center: [82, 23] // Center of India
                            }}
                            className="w-full h-full"
                            style={{ background: 'transparent' }}
                        >
                            <ZoomableGroup center={[82, 23]} zoom={1} minZoom={0.5} maxZoom={4}>
                                <Geographies geography={geoData}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            // TopoJSON property for district name.
                                            // geoBoundaries (ADM2) uses 'shapeName' 
                                            const districtName = geo.properties.shapeName || geo.properties.district || geo.properties.dtname || geo.properties.NAME_2;
                                            const hasData = registry[districtName];
                                            // const isHovered = hoveredDistrict === districtName; 
                                            // const isSelected = selectedDistrict === districtName; 

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    onMouseEnter={() => setHoveredDistrict(districtName)}
                                                    onMouseLeave={() => setHoveredDistrict(null)}
                                                    onClick={() => setSelectedDistrict(districtName === selectedDistrict ? null : districtName)}
                                                    style={{
                                                        default: {
                                                            fill: hasData ? (hasData.gi ? '#065f46' : '#92400e') : '#0f172a', // More vibrant Green/Amber for hubs
                                                            stroke: hasData ? (hasData.gi ? '#10b981' : '#f59e0b') : '#334155',
                                                            strokeWidth: hasData ? 2 : 0.5,
                                                            outline: 'none',
                                                            transition: 'all 0.3s ease'
                                                        },
                                                        hover: {
                                                            fill: hasData ? (hasData.gi ? '#067a5a' : '#b45309') : '#1e293b',
                                                            stroke: '#ffffff',
                                                            strokeWidth: 1.5,
                                                            outline: 'none',
                                                            cursor: hasData ? 'pointer' : 'default'
                                                        },
                                                        pressed: {
                                                            fill: '#1e1b4b',
                                                            stroke: '#6366f1',
                                                            outline: 'none'
                                                        }
                                                    }}

                                                />
                                            );
                                        })
                                    }
                                </Geographies>

                                {/* Dynamic Markers for ODOP Hubs */}
                                {Object.values(registry).map((d) => (
                                    <Marker
                                        key={d.id}
                                        coordinates={[d.lng, d.lat]}
                                        onMouseEnter={() => setHoveredDistrict(d.name)}
                                        onMouseLeave={() => setHoveredDistrict(null)}
                                        // @ts-ignore
                                        onClick={() => setSelectedDistrict(d.name === selectedDistrict ? null : d.name)}
                                    >
                                        {/* Constant Pulse for all Hubs */}
                                        <circle
                                            r={10}
                                            fill={d.gi ? "#10b981" : "#f59e0b"}
                                            opacity={0.3}
                                            className="animate-pulse-slow"
                                        />

                                        {/* Main Hub Node */}
                                        <circle
                                            r={4.5}
                                            fill={d.gi ? "#10b981" : "#f59e0b"}
                                            stroke="#ffffff"
                                            strokeWidth={1.5}
                                            className="cursor-pointer transition-transform hover:scale-150 active:scale-95 animate-glow"
                                        />


                                        {/* Interactive Echo */}
                                        {hoveredDistrict === d.name && (
                                            <circle
                                                r={15}
                                                fill="none"
                                                stroke={d.gi ? "#10b981" : "#f59e0b"}
                                                strokeWidth={1.5}
                                                className="animate-ping"
                                            />
                                        )}
                                    </Marker>
                                ))}


                            </ZoomableGroup>
                        </ComposableMap>
                    )}

                    {/* 📊 Metrics HUD Overlay - Compact Version */}
                    {!loading && metrics.totalHubs > 0 && (
                        <div className="absolute bottom-6 left-6 z-[10] flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {[
                                { label: 'Locations', value: metrics.totalHubs, icon: '📍' },
                                { label: 'Districts', value: metrics.totalDistricts, icon: '🏛️' },
                                { label: 'Products', value: metrics.totalProducts, icon: '📦' }
                            ].map((m, i) => (
                                <div key={i} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/30 p-2.5 rounded-lg shadow-xl flex flex-col min-w-[90px] group hover:border-brand-500/50 transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                                        <span className="text-[10px] opacity-70">{m.icon}</span>
                                    </div>
                                    <div className="text-lg font-display font-black text-white mt-0.5 group-hover:text-brand-400 transition-colors">
                                        {m.value}
                                    </div>
                                    <div className="h-0.5 w-full bg-slate-800/50 mt-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 w-1/3 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}




                    {/* Legend - Moved to Right */}
                    <div className="absolute bottom-6 right-6 flex gap-4 z-[20] bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 backdrop-blur-md pointer-events-none shadow-2xl">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white/30 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">GI HUB</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-white/30"></span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">NON-GI</span>
                        </div>
                    </div>


                    {/* Inlay Popover - Attached to Cursor or Fixed */}
                    {activeData && (
                        <div className="absolute top-24 right-6 w-72 pointer-events-none z-20 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl p-5 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                {/* Glow Effect */}
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-40 ${activeData.gi ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeData.state}</span>
                                            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight">{activeData.name}</h2>
                                        </div>
                                        {activeData.gi && <BadgeCheck className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Product</span>
                                            <span className="text-xs font-mono font-bold text-indigo-300 truncate max-w-[120px]">{activeData.product}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg">
                                                <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Local Rate</div>
                                                <div className="text-sm font-mono font-bold text-white">₹{activeData.localPrice}</div>
                                            </div>
                                            <div className="flex-1 bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg border-l-2 border-l-emerald-500/50">
                                                <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Prem. Score</div>
                                                <div className="text-sm font-mono font-bold text-emerald-400">{activeData.premiumPotential}/100</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-[10px] text-slate-400 italic">
                                        <MousePointer2 className="w-3 h-3" />
                                        <span>Click region to lock/unlock selection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Intelligence Panel (35%) */}
                <div className="w-[35%] bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col z-10 border-l border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                            <Boxes className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Cluster Intelligence</h3>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">District Export Hub Analysis</div>
                        </div>
                    </div>

                    {activeData ? (
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar animate-fade-in">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sourcing ID</label>
                                <div className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 inline-block rounded border border-indigo-500/20">{activeData.id}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Product</label>
                                    <div className="text-sm font-bold text-white leading-tight">{activeData.product}</div>
                                    <div className="text-[9px] font-mono text-slate-500 mt-1">HS: {activeData.hsCode}</div>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</label>
                                    <div className="flex flex-col gap-2">
                                        {activeData.gi ? (
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <BadgeCheck className="w-4 h-4" />
                                                <span className="text-[9px] font-bold uppercase">GI Confirmed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <BadgeCheck className="w-4 h-4" />
                                                <span className="text-[9px] font-bold uppercase">Not GI Tagged</span>
                                            </div>
                                        )}
                                        {activeData.deh && (
                                            <div className="flex items-center gap-1.5 text-amber-400">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-[9px] font-bold uppercase">Export Hub</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Premium Potential Gauge */}
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premium Potential</label>
                                    <span className={`text-xs font-bold ${activeData.premiumPotential > 80 ? 'text-emerald-400' : activeData.premiumPotential > 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {activeData.premiumPotential}/100
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${activeData.premiumPotential > 80 ? 'bg-emerald-500' : activeData.premiumPotential > 50 ? 'bg-amber-500' : 'bg-slate-600'}`}
                                        style={{ width: `${activeData.premiumPotential}%` }}
                                    ></div>
                                </div>
                                {activeData.gi && (
                                    <div className="mt-3 pt-3 border-t border-slate-800">
                                        <div className="text-[9px] text-slate-400 italic">"{activeData.brandLineage}"</div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 bg-slate-950 border border-slate-800 rounded relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Scale className="w-12 h-12 text-slate-600" />
                                </div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Arbitrage Opportunity
                                </label>

                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-right">
                                        <div className="text-[9px] text-slate-500 mb-0.5">District Price</div>
                                        <div className="text-lg font-mono font-bold text-slate-300">₹{activeData.localPrice}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-mono text-slate-500 mb-0.5">Global Price</div>
                                        <div className="text-lg font-mono font-bold text-indigo-400">₹{activeData.globalPrice}</div>
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400">Projected Margin</span>
                                    <span className="text-xl font-bold font-mono text-emerald-400">+{arbitrage}%</span>
                                </div>
                            </div>

                            {/* Fee Advice */}
                            {!activeData.gi && (
                                <div className="mt-2 text-[9px] font-mono text-amber-500/80 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                                    * GI REGISTRATION FEE REDUCED TO ₹1,000. RECOMMENDED.
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <MapPin className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
                            <p className="text-xs font-bold text-slate-400">Hover over a cluster node to analyze.</p>
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-slate-800/50">
                        <button
                            onClick={handleInitiateSourcing}
                            disabled={!activeData}
                            className={`w-full h-10 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeData
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            Initiate Sourcing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
