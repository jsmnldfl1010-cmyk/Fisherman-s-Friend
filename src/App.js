import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import './App.css';
import { AppShell } from './components/layout/AppShell';
import { PageLoader } from './components/ui/PageLoader';
import { AppDataProvider } from './services/AppDataContext';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const SosPage = lazy(() => import('./pages/SosPage'));
const FuelPage = lazy(() => import('./pages/FuelPage'));

const pages = {
  dashboard: DashboardPage,
  logs: LogsPage,
  marketplace: MarketplacePage,
  community: CommunityPage,
  tools: ToolsPage,
  news: NewsPage,
  sos: SosPage,
  fuel: FuelPage,
};

function getInitialRoute() {
  const hashRoute = window.location.hash.replace('#', '');
  return pages[hashRoute] ? hashRoute : 'dashboard';
}

function App() {
  const [activeRoute, setActiveRoute] = useState(getInitialRoute);

  const handleNavigate = useCallback((route) => {
    setActiveRoute(route);
    window.history.replaceState(null, '', `#${route}`);
  }, []);

  const ActivePage = useMemo(() => pages[activeRoute] ?? DashboardPage, [activeRoute]);

  return (
    <AppDataProvider>
      <AppShell activeRoute={activeRoute} onNavigate={handleNavigate}>
        <Suspense fallback={<PageLoader />}>
          <ActivePage onNavigate={handleNavigate} />
        </Suspense>
      </AppShell>
    </AppDataProvider>
  );
}

export default App;
