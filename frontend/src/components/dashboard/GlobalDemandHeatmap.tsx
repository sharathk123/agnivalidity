import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, TrendingUp, Ship, Navigation } from 'lucide-react';

const demandOrbs = [
    { id: 1, name: "Rotterdam, NL", lat: 51.9225, lng: 4.47917, volume: 88, growth: "+12%" },
    { id: 2, name: "Jebel Ali, UAE", lat: 24.9857, lng: 55.0273, volume: 94, growth: "+18%" },
    { id: 3, name: "Ho Chi Minh, VN", lat: 10.7626, lng: 106.6601, volume: 76, growth: "+22%" },
    { id: 4, name: "Hamburg, DE", lat: 53.5511, lng: 9.9937, volume: 82, growth: "+9%" },
    { id: 5, name: "New York, USA", lat: 40.7128, lng: -74.0060, volume: 65, growth: "+5%" },
    { id: 6, name: "Singapore", lat: 1.3521, lng: 103.8198, volume: 91, growth: "+14%" },
    { id: 7, name: "Shanghai, CN", lat: 31.2304, lng: 121.4737, volume: 55, growth: "+2%" }, // Lower growth example
];

const expansionMarkets = [
    { country: "Vietnam", growth: "22%", goods: "Cotton Yarn, Spices" },
    { country: "UAE", growth: "18%", goods: "Rice, Fresh Veg" },
    { country: "Germany", growth: "14%", goods: "Engineering Goods" },
    { country: "Netherlands", growth: "12%", goods: "Chemicals" },
    { country: "Australia", growth: "11%", goods: "Pharma" },
];

export const GlobalDemandHeatmap: React.FC = () => {
    return (
        <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg h-full flex overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none z-0"></div>

            {/* Sidebar Ticker (25%) */}
            <div className="w-1/4 border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col z-10 relative">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                            <Globe className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Global Demand</h3>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
                        Live Inbound Volume Analysis
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        Top 5 Expansion Markets (2026)
                    </div>

                    {expansionMarkets.map((market, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/50 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-slate-200 font-display tracking-tight">{market.country}</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">+{market.growth}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase truncate">
                                Demand: {market.goods}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
                        <Ship className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AIS Vessel Stream Active</span>
                    </div>
                </div>
            </div>

            {/* Map Engine (75%) */}
            <div className="w-3/4 relative z-0 bg-slate-950">
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false} attributionControl={false}>
                    {/* Dark Theme Tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Demand Orbs */}
                    {demandOrbs.map(orb => (
                        <CircleMarker
                            key={orb.id}
                            center={[orb.lat, orb.lng]}
                            pathOptions={{
                                color: '#10b981',
                                fillColor: '#10b981',
                                fillOpacity: 0.3,
                                weight: 1,
                            }}
                            radius={Math.sqrt(orb.volume) * 1.5} // Dynnamic size
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 bg-slate-950 text-slate-200 font-sans min-w-[150px]">
                                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1 text-emerald-400">{orb.name}</h4>
                                    <div className="flex justify-between text-[10px] font-mono">
                                        <span className="text-slate-500">Vol Growth:</span>
                                        <span className="text-white">{orb.growth}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono mt-0.5">
                                        <span className="text-slate-500">Index:</span>
                                        <span className="text-indigo-400">{orb.volume}/100</span>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                    {/* Custom Controls or overlays could go here */}
                </MapContainer>

                {/* HUD Overlay */}
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
