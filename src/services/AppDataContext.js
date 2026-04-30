import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createCatchLog,
  createCommunityAlert,
  createMarketplaceListing,
  isSupabaseConfigured,
  loadSupabaseAppData,
} from './supabaseRest';
import { initialAlerts, initialLogs, initialProducts, productiveZones, voiceCommands } from '../utils/sampleData';

const emptyData = {
  alerts: initialAlerts,
  logs: initialLogs,
  products: initialProducts,
  productiveZones,
  voiceCommands,
};

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [data, setData] = useState(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState(isSupabaseConfigured ? 'Supabase' : 'Not configured');
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(emptyData);
      setIsLoading(false);
      setDataSource('Offline-first local dataset');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const nextData = await loadSupabaseAppData();
      setData(nextData);
      setDataSource('Supabase');
    } catch (requestError) {
      setError(requestError.message);
      setDataSource('Supabase unavailable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addLog = useCallback(async (log) => {
    if (!isSupabaseConfigured) {
      const offlineLog = { ...log, id: `log-local-${Date.now()}`, createdAt: new Date().toISOString() };
      setData((current) => ({ ...current, logs: [offlineLog, ...current.logs] }));
      return;
    }
    const savedLog = await createCatchLog(log);
    setData((current) => ({ ...current, logs: [savedLog, ...current.logs] }));
  }, []);

  const addProduct = useCallback(async (product) => {
    if (!isSupabaseConfigured) {
      const offlineProduct = { ...product, id: `product-local-${Date.now()}`, icon: product.category === 'Fish' ? '<>' : product.category === 'Equipment' ? '[]' : '#' };
      setData((current) => ({ ...current, products: [offlineProduct, ...current.products] }));
      return;
    }
    const savedProduct = await createMarketplaceListing(product);
    setData((current) => ({ ...current, products: [savedProduct, ...current.products] }));
  }, []);

  const addAlert = useCallback(async (alert) => {
    if (!isSupabaseConfigured) {
      const offlineAlert = { ...alert, id: `alert-local-${Date.now()}`, createdAt: new Date().toISOString() };
      setData((current) => ({ ...current, alerts: [offlineAlert, ...current.alerts] }));
      return;
    }
    const savedAlert = await createCommunityAlert(alert);
    setData((current) => ({ ...current, alerts: [savedAlert, ...current.alerts] }));
  }, []);

  const value = useMemo(
    () => ({
      addAlert,
      addLog,
      addProduct,
      alerts: data.alerts,
      dataSource,
      error,
      isLoading,
      logs: data.logs,
      products: data.products,
      productiveZones: data.productiveZones,
      refreshData,
      voiceCommands: data.voiceCommands,
    }),
    [addAlert, addLog, addProduct, data, dataSource, error, isLoading, refreshData]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return value;
}
