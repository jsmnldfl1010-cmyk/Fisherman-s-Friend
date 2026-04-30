const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && process.env.NODE_ENV !== 'test');

function tableUrl(table, query = '') {
  const cleanUrl = supabaseUrl?.replace(/\/$/, '');
  return `${cleanUrl}/rest/v1/${table}${query}`;
}

async function supabaseRequest(table, { body, method = 'GET', query = '' } = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const response = await fetch(tableUrl(table, query), {
    method,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseWeight(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getMapPosition(latitude, longitude) {
  const left = 20 + Math.abs(Number(longitude) * 13) % 60;
  const top = 22 + Math.abs(Number(latitude) * 17) % 56;
  return {
    left: `${left.toFixed(0)}%`,
    top: `${top.toFixed(0)}%`,
  };
}

function mapCatchLog(row) {
  return {
    id: row.id,
    species: row.species,
    weight: row.weight_kg ? `${row.weight_kg} kg` : 'Not recorded',
    location: row.location_name ?? 'Unmarked zone',
    notes: row.notes ?? '',
    createdAt: row.created_at,
  };
}

function mapListing(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    seller: row.seller_name ?? row.landing_site ?? 'Local seller',
    icon: row.category === 'Fish' ? '<>' : row.category === 'Equipment' ? '[]' : '#',
  };
}

function mapCommunityAlert(row) {
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapZone(row, cooperativesById) {
  const position = getMapPosition(row.latitude, row.longitude);
  return {
    id: row.id,
    name: row.name,
    cooperative: cooperativesById[row.cooperative_id] ?? 'Trusted cooperative',
    trustLevel: row.visibility === 'all_members' ? 'Coop verified' : 'Trusted crews only',
    confidence: `${row.confidence.charAt(0).toUpperCase()}${row.confidence.slice(1)}`,
    lastCatch: row.last_catch_summary ?? 'No recent catch report',
    distance: row.distance_label ?? `${Math.round(row.radius_meters / 1852)} nm radius`,
    coordinates: `${Number(row.latitude).toFixed(3)} N, ${Number(row.longitude).toFixed(3)} E`,
    left: position.left,
    top: position.top,
  };
}

function mapVoiceCommand(row) {
  return {
    id: row.id,
    language: row.language,
    phrase: row.phrase,
    intent: row.intent,
  };
}

function mapMarineWeatherAlert(row) {
  return {
    id: row.id,
    severity: `${row.severity.charAt(0).toUpperCase()}${row.severity.slice(1)}`,
    title: row.title,
    message: row.message,
  };
}

export async function loadSupabaseAppData() {
  const [
    logs,
    products,
    alerts,
    cooperatives,
    zones,
    commands,
  ] = await Promise.all([
    supabaseRequest('catch_logs', { query: '?select=*&order=caught_at.desc' }),
    supabaseRequest('marketplace_listings', { query: '?select=*&order=created_at.desc' }),
    supabaseRequest('community_alerts', { query: '?select=*&order=created_at.desc' }),
    supabaseRequest('cooperatives', { query: '?select=id,name' }),
    supabaseRequest('productive_zones', { query: '?select=*&order=updated_at.desc' }),
    supabaseRequest('voice_commands', { query: '?select=*&order=language.asc,phrase.asc' }),
  ]);

  const cooperativesById = Object.fromEntries(cooperatives.map((coop) => [coop.id, coop.name]));

  return {
    alerts: alerts.map(mapCommunityAlert),
    logs: logs.map(mapCatchLog),
    products: products.map(mapListing),
    productiveZones: zones.map((zone) => mapZone(zone, cooperativesById)),
    voiceCommands: commands.map(mapVoiceCommand),
  };
}

export async function loadMarineWeatherAlerts() {
  const rows = await supabaseRequest('marine_weather_alerts', {
    query: '?select=*&order=valid_from.desc&limit=3',
  });
  return rows.map(mapMarineWeatherAlert);
}

export async function createCatchLog(log) {
  const rows = await supabaseRequest('catch_logs', {
    method: 'POST',
    body: {
      species: log.species,
      weight_kg: parseWeight(log.weight),
      location_name: log.location,
      notes: log.notes || null,
    },
  });

  return mapCatchLog(rows[0]);
}

export async function createMarketplaceListing(product) {
  const rows = await supabaseRequest('marketplace_listings', {
    method: 'POST',
    body: {
      name: product.name,
      category: product.category,
      price: product.price,
      seller_name: product.seller,
    },
  });

  return mapListing(rows[0]);
}

export async function createCommunityAlert(alert) {
  const rows = await supabaseRequest('community_alerts', {
    method: 'POST',
    body: {
      title: alert.title,
      level: alert.level,
      message: alert.message,
    },
  });

  return mapCommunityAlert(rows[0]);
}
