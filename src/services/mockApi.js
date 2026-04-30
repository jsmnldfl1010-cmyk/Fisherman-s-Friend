import { isSupabaseConfigured, loadMarineWeatherAlerts } from './supabaseRest';

export async function getSeaConditions() {
  let alerts = [];

  if (isSupabaseConfigured) {
    try {
      alerts = await loadMarineWeatherAlerts();
    } catch {
      alerts = [];
    }
  }

  return {
    location: 'General Santos harbor',
    weather: 'Partly cloudy',
    temperature: '29 C',
    tide: 'Rising',
    waveHeight: '0.8 m',
    wind: '11 kt NE',
    advisory: 'Good nearshore visibility until late afternoon.',
    source: 'PAGASA marine forecast bridge',
    issuedAt: '2026-04-30T06:00:00.000Z',
    alerts,
  };
}
