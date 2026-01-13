import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AdminCommandCenter } from './components/admin/CommandCenter';
import { AdminControl } from './components/admin/AdminControl';
import { QuarantineTerminal } from './components/admin/QuarantineTerminal';
import { IntelligenceDashboard } from './components/dashboard/IntelligenceDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import LandingPage from './components/landing/LandingPage';
import { MarketTrends } from './components/dashboard/MarketTrends';
import { PricePredictionWidget } from './components/dashboard/PricePredictionWidget';
import { GlobalDemandHeatmap } from './components/dashboard/GlobalDemandHeatmap';
import { ODOPSourcingTerminal } from './components/dashboard/ODOPSourcingTerminal';

// Wrappers for focused views
const MarketTrendsWrapper = () => (
  <div className="max-w-[1920px] mx-auto h-full w-full">
    <h2 className="text-3xl font-black font-display text-white tracking-tighter uppercase mb-6">Global Market Pulse</h2>
    <MarketTrends />
  </div>
);

const PricingEngineWrapper = () => {
  // Mock props for standalone display
  const [baseCost, setBaseCost] = useState(1000);
  const [logistics, setLogistics] = useState(150);
  const [incoterm, setIncoterm] = useState('FOB');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="max-w-4xl w-full">
      <h2 className="text-3xl font-black font-display text-white tracking-tighter uppercase mb-6 text-center">Predictive Pricing Engine</h2>
      <PricePredictionWidget
        baseCost={baseCost} setBaseCost={setBaseCost}
        logistics={logistics} setLogistics={setLogistics}
        incoterm={incoterm} setIncoterm={setIncoterm}
        insight={{ verdict: 'GO', confidence: 0.95 }} // Mock insight context
        onGenerateQuote={async () => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }}
        isGeneratingQuote={isGenerating}
      />
    </div>
  );
};

function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/landing';

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/user/system-control" element={<AdminControl />} />
        <Route path="/admin/command-center" element={<AdminCommandCenter />} />
        <Route path="/admin/command-center/quarantine" element={<QuarantineTerminal />} />

        <Route path="/user/market-trends" element={
          <div className="p-8 h-screen animate-fade-in"><MarketTrendsWrapper /></div>
        } />

        <Route path="/user/global-demand" element={
          <div className="p-8 h-screen animate-fade-in w-full"><GlobalDemandHeatmap /></div>
        } />

        <Route path="/user/odop-sourcing" element={
          <div className="p-8 h-[calc(100vh-5rem)] animate-fade-in w-full"><ODOPSourcingTerminal /></div>
        } />

        <Route path="/user/pricing-engine" element={
          <div className="p-8 h-screen animate-fade-in flex flex-col items-center justify-center"><PricingEngineWrapper /></div>
        } />

        <Route path="*" element={<IntelligenceDashboard />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
