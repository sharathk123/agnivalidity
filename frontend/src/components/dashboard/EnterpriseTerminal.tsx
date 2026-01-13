import { TelemetryStream } from './TelemetryStream';
import { ProductInsightView } from '../ProductInsightView';
import { MarketTrends } from './MarketTrends';

export const EnterpriseTerminal: React.FC = () => {
    return (
        <div className="p-6 space-y-6 animate-fade-in max-w-[1920px] mx-auto min-h-screen flex flex-col">
            <div className="grid grid-cols-12 gap-6 flex-1">
                {/* Primary Intelligence View (Top Left) */}
                <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
                    <ProductInsightView />
                </div>

                {/* Telemetry Stream (Top Right) */}
                <div className="col-span-12 xl:col-span-3 h-[600px] xl:h-auto">
                    <TelemetryStream />
                </div>

                {/* Market Trends HUD (Bottom Row) */}
                <div className="col-span-12">
                    <MarketTrends />
                </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-800/50">
                <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest">SYSTEM_ID: AGNI-01</span>
            </div>
        </div>
    );
};
