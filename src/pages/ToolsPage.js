import { useMemo, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  buildGoogleMapsEmbedUrl,
  getFishLegality,
  getFishSpeciesCatalog,
  getMapLayers,
  getNearbySafetyPoints,
  getRestrictedAreaAlert,
  getWeatherSnapshot,
  hasGoogleMapsKey,
  identifyFishFromImage,
  loadOfflinePack,
  saveOfflinePack,
} from '../services/fishingAssistant';

export default function ToolsPage() {
  const [satellite, setSatellite] = useState(false);
  const [locationStatus, setLocationStatus] = useState('GPS waiting');
  const [coords, setCoords] = useState({ lat: 6.12, lng: 125.17 });
  const [weather, setWeather] = useState(getWeatherSnapshot(6.12, 125.17));
  const [zoneAlert, setZoneAlert] = useState('');
  const [nearbyPoints, setNearbyPoints] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [fishSize, setFishSize] = useState('');
  const [fishResult, setFishResult] = useState(null);
  const [offlinePackInfo, setOfflinePackInfo] = useState(loadOfflinePack());
  const { fishingSpots, restrictedZones, safetyPoints } = useMemo(() => getMapLayers(), []);
  const speciesCatalog = useMemo(() => getFishSpeciesCatalog(), []);

  const mapUrl = useMemo(() => buildGoogleMapsEmbedUrl(coords.lat, coords.lng, satellite), [coords, satellite]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS unavailable on this device');
      return;
    }
    setLocationStatus('Requesting GPS lock...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(nextCoords);
        setLocationStatus(`${nextCoords.lat.toFixed(4)}, ${nextCoords.lng.toFixed(4)}`);
        setWeather(getWeatherSnapshot(nextCoords.lat, nextCoords.lng));
        setZoneAlert(getRestrictedAreaAlert(nextCoords.lat, nextCoords.lng) ?? 'No restricted area breach detected.');
        setNearbyPoints(getNearbySafetyPoints(nextCoords.lat, nextCoords.lng));
      },
      () => setLocationStatus('GPS permission needed')
    );
  };

  const handleAnalyze = async () => {
    if (!photoFile) return;
    const species = await identifyFishFromImage(photoFile);
    const legality = getFishLegality(species, fishSize);
    setFishResult({ species, legality });
  };

  const handleDownloadOffline = () => {
    const pack = {
      mapLayers: { fishingSpots, restrictedZones, safetyPoints },
      weather,
      speciesCatalog,
    };
    saveOfflinePack(pack);
    setOfflinePackInfo(loadOfflinePack());
  };

  return (
    <div className="page-grid sea-mode">
      <Card>
        <CardHeader
          title="Smart fishing map (Google Maps)"
          description="Satellite-ready map with protected zones, common fishing spots, reef/depth indicators, and nearby coast guard docking references."
          action={<Button onClick={requestLocation}>Use GPS</Button>}
        />
        <div className="map-controls">
          <button className={`pill-toggle ${!satellite ? 'active' : ''}`} onClick={() => setSatellite(false)} type="button">Road</button>
          <button className={`pill-toggle ${satellite ? 'active' : ''}`} onClick={() => setSatellite(true)} type="button">Satellite</button>
          <span className="map-status">Position: {locationStatus}</span>
        </div>
        {hasGoogleMapsKey() ? (
          <iframe className="live-map" src={mapUrl} title="Google map fishing view" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="map-preview" aria-label="Map fallback preview" role="img">
            {fishingSpots.map((zone) => <span className="map-pin map-pin-high" key={zone.id} style={{ left: `${35 + Number(zone.lat) % 35}%`, top: `${20 + Number(zone.lng) % 50}%` }} />)}
          </div>
        )}
        <p className="card-description">Set `REACT_APP_GOOGLE_MAPS_API_KEY` to enable live Google Maps tiles and satellite rendering.</p>
      </Card>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Hazard and zone warnings" />
          <div className="list">
            <div className="list-item"><span>Marine weather</span><strong>{weather.windKts} kts wind, {weather.waveM} m waves</strong></div>
            <div className="list-item"><span>Rain chance</span><strong>{weather.rainChance}%</strong></div>
            <article className={`alert-strip ${weather.hazard ? 'danger' : ''}`}>
              <span className="badge badge-warning">{weather.hazard ? 'Warning' : 'Advisory'}</span>
              <div><p className="list-item-meta">{weather.warning}</p></div>
            </article>
            <article className="alert-strip">
              <span className="badge">Geofence</span>
              <div><p className="list-item-meta">{zoneAlert || 'Request GPS to evaluate restricted-area entry.'}</p></div>
            </article>
          </div>
        </Card>
        <Card>
          <CardHeader title="Nearby safe points" description="Docking points and coast guard stations nearest your location." />
          <div className="list">
            {nearbyPoints.map((point) => (
              <article className="list-item" key={point.id}>
                <div>
                  <p className="list-item-title">{point.name}</p>
                  <p className="list-item-meta">{point.type}</p>
                </div>
                <span className="badge">{point.distanceKm.toFixed(1)} km</span>
              </article>
            ))}
            {!nearbyPoints.length ? <p className="card-description">Request GPS to load nearest safety points.</p> : null}
          </div>
        </Card>
      </section>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Fish camera and legality check" description="Capture a fish photo, detect likely species, then get Philippine keep-or-release guidance." />
          <div className="form-grid">
            <label className="field field-full">
              <span className="label">Fish photo</span>
              <input className="input" accept="image/*" capture="environment" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} type="file" />
            </label>
            <label className="field">
              <span className="label">Measured length (cm)</span>
              <input className="input" min="1" onChange={(event) => setFishSize(event.target.value)} type="number" value={fishSize} />
            </label>
            <div className="field">
              <Button onClick={handleAnalyze} type="button">Identify fish</Button>
            </div>
          </div>
          {fishResult ? (
            <div className="result-panel">
              <p className="list-item-title">{fishResult.species}</p>
              <p className="list-item-meta">Local name: {fishResult.legality.details.local}</p>
              <p className="list-item-meta">{fishResult.legality.details.regulation}</p>
              <p className="list-item-meta">Result: {fishResult.legality.reason}</p>
              <span className={`badge ${fishResult.legality.legal ? 'badge-success' : 'badge-warning'}`}>Recommendation: {fishResult.legality.recommendation}</span>
            </div>
          ) : null}
        </Card>
        <Card>
          <CardHeader title="Offline pack manager" description="Download map layers, weather snapshot, and fish guide for low-signal trips." />
          <Button onClick={handleDownloadOffline} type="button">Download offline pack</Button>
          <p className="card-description">
            {offlinePackInfo?.downloadedAt
              ? `Offline pack ready. Last refresh: ${new Date(offlinePackInfo.downloadedAt).toLocaleString()}`
              : 'No offline pack cached yet on this device.'}
          </p>
          <div className="list">
            {speciesCatalog.map((species) => (
              <article className="list-item" key={species.name}>
                <div>
                  <p className="list-item-title">{species.name}</p>
                  <p className="list-item-meta">Min size: {species.minSizeCm} cm</p>
                </div>
                <span className={`badge ${species.prohibited ? 'badge-warning' : 'badge-success'}`}>{species.prohibited ? 'Protected' : 'Allowed w/ limits'}</span>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
