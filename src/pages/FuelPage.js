import { useMemo, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  buildGoogleMapsEmbedUrl,
  cacheFuelSnapshot,
  getFuelStations,
  getFuelTrendLabel,
  hasGoogleMapsKey,
  loadFuelSnapshot,
} from '../services/fishingAssistant';

export default function FuelPage() {
  const [fuelType, setFuelType] = useState('diesel');
  const [priceLimit, setPriceLimit] = useState('55');
  const [alertMessage, setAlertMessage] = useState('');
  const [satellite, setSatellite] = useState(false);
  const [cached, setCached] = useState(loadFuelSnapshot());
  const stations = useMemo(() => getFuelStations(), []);

  const sorted = useMemo(() => {
    const key = fuelType === 'diesel' ? 'diesel' : 'gas';
    return [...stations].sort((a, b) => a[key] - b[key]);
  }, [stations, fuelType]);

  const dieselToday = useMemo(() => sorted[0]?.diesel ?? 0, [sorted]);
  const gasNearYou = useMemo(() => sorted[0]?.gas ?? 0, [sorted]);

  const mapCenter = sorted[0] ?? { lat: 10.747, lng: 121.941 };
  const mapUrl = buildGoogleMapsEmbedUrl(mapCenter.lat, mapCenter.lng, satellite);

  const handleSetAlert = () => {
    const threshold = Number(priceLimit);
    const hit = stations.find((item) => item.diesel <= threshold);
    if (hit) {
      setAlertMessage(`Diesel alert: ${hit.name} is now PHP ${hit.diesel.toFixed(2)}/L.`);
      if ('vibrate' in navigator) navigator.vibrate([140, 80, 140]);
    } else {
      setAlertMessage(`No station below PHP ${threshold.toFixed(2)}/L yet.`);
    }
  };

  const handleCache = () => {
    cacheFuelSnapshot(stations);
    setCached(loadFuelSnapshot());
  };

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <Card>
          <CardHeader title="⛽ Diesel Today" />
          <p className="metric-value">PHP {dieselToday.toFixed(2)}/L</p>
        </Card>
        <Card>
          <CardHeader title="🚗 Gas Near You" />
          <p className="metric-value">PHP {gasNearYou.toFixed(2)}/L</p>
        </Card>
        <Card>
          <CardHeader title="📦 Offline Cache" />
          <p className="card-description">{cached?.cachedAt ? `Last saved: ${new Date(cached.cachedAt).toLocaleString()}` : 'No cached fuel prices yet.'}</p>
          <Button onClick={handleCache} type="button">Save last-known prices</Button>
        </Card>
      </section>

      <Card>
        <CardHeader title="Fuel station map" description="Antique and nearby coastal stations for fishing operations." />
        <div className="map-controls">
          <button className={`pill-toggle ${!satellite ? 'active' : ''}`} onClick={() => setSatellite(false)} type="button">Road</button>
          <button className={`pill-toggle ${satellite ? 'active' : ''}`} onClick={() => setSatellite(true)} type="button">Satellite</button>
        </div>
        {hasGoogleMapsKey() ? (
          <iframe className="live-map" src={mapUrl} title="Fuel station map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="map-preview" role="img" aria-label="Fuel stations map fallback">
            {stations.map((station, index) => (
              <span className={`map-pin ${station.nearPort ? 'map-pin-high' : 'map-pin-medium'}`} key={station.id} style={{ left: `${24 + index * 17}%`, top: `${26 + (index % 2) * 28}%` }} />
            ))}
          </div>
        )}
      </Card>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Price comparison" description="Cheapest to most expensive." />
          <div className="map-controls">
            <button className={`pill-toggle ${fuelType === 'diesel' ? 'active' : ''}`} onClick={() => setFuelType('diesel')} type="button">Diesel</button>
            <button className={`pill-toggle ${fuelType === 'gas' ? 'active' : ''}`} onClick={() => setFuelType('gas')} type="button">Gasoline</button>
          </div>
          <div className="list">
            {sorted.map((station) => (
              <article className="list-item" key={station.id}>
                <div>
                  <p className="list-item-title">{station.name}</p>
                  <p className="list-item-meta">{station.area}</p>
                  <p className="list-item-meta">{station.nearPort ? 'Near port/coastal zone' : 'Inland nearby'}</p>
                </div>
                <div className="zone-meta">
                  <span className="badge badge-success">Diesel PHP {station.diesel.toFixed(2)}</span>
                  <span className="badge">Gas PHP {station.gas.toFixed(2)}</span>
                  <span className={`badge ${station.trend === 'rising' ? 'badge-warning' : 'badge-success'}`}>{getFuelTrendLabel(station.trend)}</span>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Diesel price alert" description="Notify when diesel drops below your target." />
          <label className="field">
            <span className="label">Alert below (PHP/L)</span>
            <input className="input" min="1" onChange={(event) => setPriceLimit(event.target.value)} type="number" value={priceLimit} />
          </label>
          <div className="hero-actions">
            <Button onClick={handleSetAlert} type="button">Set alert</Button>
          </div>
          <p className="card-description">{alertMessage || 'No alert checks yet.'}</p>
          <p className="card-description">If offline, cached prices remain available with timestamp reference.</p>
        </Card>
      </section>
    </div>
  );
}

