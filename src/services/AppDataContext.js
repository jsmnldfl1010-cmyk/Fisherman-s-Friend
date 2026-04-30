import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createCatchLog,
  createCommunityAlert,
  createMarketplaceListing,
  isSupabaseConfigured,
  loadSupabaseAppData,
} from './supabaseRest';

const emptyData = {
  alerts: [],
  logs: [],
  products: [],
  productiveZones: [],
  voiceCommands: [],
};

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [data, setData] = useState(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState(isSupabaseConfigured ? 'Supabase' : 'Not configured');
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setDataSource('Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
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
    const savedLog = await createCatchLog(log);
    setData((current) => ({ ...current, logs: [savedLog, ...current.logs] }));
  }, []);

  const addProduct = useCallback(async (product) => {
    const savedProduct = await createMarketplaceListing(product);
    setData((current) => ({ ...current, products: [savedProduct, ...current.products] }));
  }, []);

  const addAlert = useCallback(async (alert) => {
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
