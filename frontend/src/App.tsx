import { useState, useEffect } from 'react';
import { AdminCommandCenter } from './components/admin/CommandCenter';
import { AdminControl } from './components/admin/AdminControl';
import { QuarantineTerminal } from './components/admin/QuarantineTerminal';
import { IntelligenceDashboard } from './components/dashboard/IntelligenceDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import LandingPage from './components/landing/LandingPage';
import { MarketTrends } from './components/dashboard/MarketTrends';
import { PricePredictionWidget } from './components/dashboard/PricePredictionWidget';
import { GlobalDemandHeatmap } from './components/dashboard/GlobalDemandHeatmap';

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

const usePath = () => {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return path;
};

function App() {
  const path = usePath();

  if (path === '/' || path === '/landing') {
    return <LandingPage />;
  }



  return (
    <DashboardLayout>
      {path === '/user/system-control' ? <AdminControl /> :
        path === '/admin/command-center' ? <AdminCommandCenter /> :
          path === '/admin/command-center/quarantine' ? <QuarantineTerminal /> :
            path === '/user/market-trends' ? (
              <div className="p-8 h-screen animate-fade-in"><MarketTrendsWrapper /></div>
            ) :
              path === '/user/global-demand' ? (
                <div className="p-8 h-screen animate-fade-in w-full"><GlobalDemandHeatmap /></div>
              ) :
                path === '/user/pricing-engine' ? (
                  <div className="p-8 h-screen animate-fade-in flex flex-col items-center justify-center"><PricingEngineWrapper /></div>
                ) :
                  <IntelligenceDashboard />}
    </DashboardLayout>
  );
}

export default App;
