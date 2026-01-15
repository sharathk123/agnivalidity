import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import LandingPage from './components/landing/LandingPage';
import { IntelligenceDashboard } from './components/dashboard/IntelligenceDashboard';
import { MarketIntelligence } from './components/dashboard/MarketIntelligence';
import { GlobalDemandHeatmap } from './components/dashboard/GlobalDemandHeatmap';
import { ODOPSourcingTerminal } from './components/dashboard/ODOPSourcingTerminal';
import { PricePredictionWidget } from './components/dashboard/PricePredictionWidget';
import { AdminCommandCenter } from './components/admin/CommandCenter';

/** Wrapper for the Pricing Engine page with local state */
const PricingEngineWrapper = () => {
  const [baseCost, setBaseCost] = useState(1000);
  const [logistics, setLogistics] = useState(150);
  const [incoterm, setIncoterm] = useState('FOB');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuote = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="max-w-4xl w-full">
      <h2 className="text-3xl font-black font-display text-white tracking-tighter uppercase mb-6 text-center">
        Smart Quote Architect
      </h2>
      <PricePredictionWidget
        baseCost={baseCost}
        setBaseCost={setBaseCost}
        logistics={logistics}
        setLogistics={setLogistics}
        incoterm={incoterm}
        setIncoterm={setIncoterm}
        insight={null}
        onGenerateQuote={handleGenerateQuote}
        isGeneratingQuote={isGenerating}
      />
    </div>
  );
};

function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/landing';

  // Public routes (no layout)
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    );
  }

  // Authenticated routes (with dashboard layout)
  return (
    <DashboardLayout>
      <Routes>
        {/* User Routes - Strategic Operations */}
        <Route path="/user/intelligence" element={<IntelligenceDashboard />} />
        <Route path="/user/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/user/global-demand" element={
          <div className="p-8 h-screen animate-fade-in w-full">
            <GlobalDemandHeatmap />
          </div>
        } />
        <Route path="/user/odop-sourcing" element={
          <div className="p-8 h-[calc(100vh-5rem)] animate-fade-in w-full">
            <ODOPSourcingTerminal />
          </div>
        } />
        <Route path="/user/pricing-engine" element={
          <div className="p-8 h-screen animate-fade-in flex flex-col items-center">
            <PricingEngineWrapper />
          </div>
        } />

        {/* Admin Routes - Executive Oversight */}
        <Route path="/admin/command-center" element={<AdminCommandCenter />} />

        {/* Fallback */}
        <Route path="*" element={<IntelligenceDashboard />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
