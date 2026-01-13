import { useState, useEffect } from 'react';
import { AdminCommandCenter } from './components/admin/CommandCenter';
import { ProductInsightView } from './components/ProductInsightView';
import { DashboardLayout } from './layouts/DashboardLayout';
import LandingPage from './components/landing/LandingPage';

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
      {path === '/admin' ? <AdminCommandCenter /> : <ProductInsightView />}
    </DashboardLayout>
  );
}

export default App;
