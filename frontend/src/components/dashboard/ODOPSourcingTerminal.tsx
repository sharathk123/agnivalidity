import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Boxes, BadgeCheck, Scale } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const ODOPSourcingTerminal: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

    // Real-world coordinates [lat, lon] for Leaflet (SimpleMaps was lon, lat)
    const districts = [
        {
            id: 'ODOP-UP-AGRA-001',
            name: 'Agra',
            state: 'Uttar Pradesh',
            product: 'Leather Footwear',
            gi: true,
            deh: true,
            localPrice: 850,
            globalPrice: 1200,
            coordinates: [27.1767, 78.0081],
            hsCode: '640320',
            premiumPotential: 65,
            brandLineage: 'Mughal Heritage Craft',
            giStatus: 'REGISTERED',
            capacity: 'HIGH'
        },
        {
            id: 'ODOP-TN-CHE-045',
            name: 'Chennai',
            state: 'Tamil Nadu',
            product: 'Automotive Parts',
            gi: false,
            deh: true,
            localPrice: 450,
            globalPrice: 580,
            coordinates: [13.0827, 80.2707],
            hsCode: '870810',
            premiumPotential: 20,
            brandLineage: 'Detroit of Asia',
            giStatus: 'N/A',
            capacity: 'HIGH'
        },
        {
            id: 'ODOP-GJ-SUR-012',
            name: 'Surat',
            state: 'Gujarat',
            product: 'Synthetic Textiles',
            gi: false,
            deh: true,
            localPrice: 210,
            globalPrice: 340,
            coordinates: [21.1702, 72.8311],
            hsCode: '540752',
            premiumPotential: 35,
            brandLineage: 'Silk City Excellence',
            giStatus: 'N/A',
            capacity: 'DEVELOPING'
        },
        {
            id: 'ODOP-WB-DAR-089',
            name: 'Darjeeling',
            state: 'West Bengal',
            product: 'Orthodox Tea',
            gi: true,
            deh: false,
            localPrice: 1200,
            globalPrice: 2800,
            coordinates: [27.0360, 88.2627],
            hsCode: '090240',
            premiumPotential: 98,
            brandLineage: 'Invaluable Treasures of Incredible India',
            giStatus: 'REGISTERED',
            capacity: 'HIGH'
        },
        {
            id: 'ODOP-TS-NIZ-022',
            name: 'Nizamabad',
            state: 'Telangana',
            product: 'Turmeric',
            gi: true,
            deh: true,
            localPrice: 9000,
            globalPrice: 14500,
            coordinates: [18.6725, 78.0982],
            hsCode: '091030',
            premiumPotential: 92,
            brandLineage: 'Golden Spice of Telangana',
            giStatus: 'REGISTERED',
            capacity: 'HIGH'
        }
    ];

    const activeData = districts.find(d => d.name === hoveredDistrict) || null;
    const arbitrage = activeData ? ((activeData.globalPrice - activeData.localPrice) / activeData.localPrice * 100).toFixed(1) : '0.0';

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
        <div className="bg-slate-950/90 border border-slate-700/50 rounded-lg h-full flex overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>

            <div className="flex w-full h-full relative z-10">
                {/* 1. Interactive Map Area (60%) */}
                <div className="w-[60%] border-r border-slate-800/50 relative bg-slate-900/20 z-0">
                    <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
                        <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-display">Sourcing Map</h3>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">One District One Product • India</div>
                    </div>

                    <MapContainer
                        center={[22.5937, 78.9629]}
                        zoom={5}
                        style={{ height: '100%', width: '100%', background: '#020617' }}
                        zoomControl={false}
                        attributionControl={false}
                    >
                        {/* Dark Theme Tiles */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* ODOP Data Points */}
                        {districts.map((d) => (
                            <CircleMarker
                                key={d.id}
                                center={d.coordinates as [number, number]}
                                pathOptions={{
                                    color: d.gi ? '#10b981' : '#fbbf24',
                                    fillColor: d.gi ? '#10b981' : '#fbbf24',
                                    fillOpacity: hoveredDistrict === d.name ? 0.8 : 0.4,
                                    weight: hoveredDistrict === d.name ? 2 : 1,
                                }}
                                radius={hoveredDistrict === d.name ? 8 : 5}
                                eventHandlers={{
                                    mouseover: () => setHoveredDistrict(d.name),
                                    mouseout: () => setHoveredDistrict(null),
                                    click: () => setHoveredDistrict(d.name)
                                }}
                            />
                        ))}
                    </MapContainer>

                    {/* Pop-over Inlay (On Hover) */}
                    {activeData && (
                        <div className="absolute bottom-24 right-6 bg-slate-900/90 border border-slate-700 backdrop-blur-md p-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] z-[1000] w-64 animate-fade-in text-left">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{activeData.state}</div>
                                    <div className="text-lg font-bold text-white font-display uppercase tracking-tight">{activeData.name}</div>
                                </div>
                                {activeData.gi && <BadgeCheck className="w-5 h-5 text-emerald-400" />}
                            </div>
                            <div className="border-t border-slate-800 my-2"></div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase">Primary ODOP</div>
                                    <div className="text-xs font-mono text-indigo-400 font-bold truncate">{activeData.product}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-[9px] text-slate-500 font-bold uppercase">Sourcing Capacity</div>
                                    <div className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${activeData.capacity === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        {activeData.capacity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="absolute bottom-6 left-6 flex gap-4 z-[1000] bg-slate-950/50 p-2 rounded-md border border-slate-800/50 backdrop-blur-sm pointer-events-none">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase">GI Tagged</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Not GI Tagged</span>
                        </div>
                    </div>
                </div>

                {/* 2. Intelligence Panel (40%) */}
                <div className="w-[40%] bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col z-10">
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
                                        <div className="text-[9px] text-slate-500 mb-0.5">Global Price</div>
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

