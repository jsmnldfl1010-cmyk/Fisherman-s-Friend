import { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { useAppData } from '../services/AppDataContext';
import { getSeaConditions } from '../services/mockApi';
import { formatDate } from '../utils/sampleData';
import { getNewsItems, getWeatherSnapshot, loadOfflinePack } from '../services/fishingAssistant';

export default function DashboardPage({ onNavigate }) {
  const { alerts, dataSource, error, isLoading, logs, products, productiveZones, voiceCommands } = useAppData();
  const [conditions, setConditions] = useState(null);
  const [smartWeather, setSmartWeather] = useState(getWeatherSnapshot(6.12, 125.17));
  const news = getNewsItems();
  const offlinePack = loadOfflinePack();

  useEffect(() => {
    let mounted = true;
    getSeaConditions().then((data) => {
      if (mounted) setConditions(data);
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mounted) {
            setSmartWeather(getWeatherSnapshot(position.coords.latitude, position.coords.longitude));
          }
        },
        () => {}
      );
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-grid">
      <section className="dashboard-grid">
        <Card className="hero-panel">
          <div className="hero-logo-card" aria-hidden="true">
            <img src="/Nautical Logo with Fishing Elements.png" alt="" />
          </div>
          <CardHeader
            title="Voice-first trip decisions for crews already at sea."
            description="Cebuano and Hiligaynon prompts surface PAGASA alerts, trusted fishing zones, logs, and market signals with large weatherproof controls."
          />
          <div className="hero-illustration" aria-hidden="true">
            <span className="sun-disc" />
            <span className="wave-line wave-line-one" />
            <span className="wave-line wave-line-two" />
            <span className="boat-shape" />
          </div>
          <div className="hero-actions">
            <Button variant="ghost" onClick={() => onNavigate('tools')}>Open sea mode</Button>
            <Button variant="ghost" onClick={() => onNavigate('logs')}>Voice catch log</Button>
          </div>
        </Card>
        <Card className="weather-alert-card">
          <CardHeader title="PAGASA marine alerts" description={conditions?.source ?? 'Loading latest harbor snapshot'} />
          {conditions ? (
            <div className="list">
              <div className="list-item"><span>Weather</span><strong>{conditions.weather}, {conditions.temperature}</strong></div>
              <div className="list-item"><span>Tide</span><strong>{conditions.tide}</strong></div>
              <div className="list-item"><span>Wave height</span><strong>{conditions.waveHeight}</strong></div>
              <div className="list-item"><span>Wind</span><strong>{conditions.wind}</strong></div>
              <p className="card-description">{conditions.advisory}</p>
              {conditions.alerts.length ? conditions.alerts.map((alert) => (
                <article className="alert-strip" key={alert.id}>
                  <span className="badge badge-warning">{alert.severity}</span>
                  <div>
                    <p className="list-item-title">{alert.title}</p>
                    <p className="list-item-meta">{alert.message}</p>
                  </div>
                </article>
              )) : <p className="card-description">No active Supabase marine alerts found.</p>}
            </div>
          ) : (
            <p className="card-description">Checking cached and network sources...</p>
          )}
        </Card>
      </section>

      <section className="stats-grid" aria-label="Current system metrics">
        <MetricCard icon="CE" label="Catch entries" value={logs.length} note={`Stored in ${dataSource}`} />
        <MetricCard icon="ML" label="Market listings" value={products.length} note="Synced for buyers" />
        <MetricCard icon="TZ" label="Trusted zones" value={productiveZones.length} note="Shared by cooperative networks" />
        <MetricCard icon="OF" label="Offline pack" value={offlinePack ? 'Yes' : 'No'} note="Maps, weather, fish guide" />
      </section>
      {error ? <p className="status-error">{error}</p> : null}
      {isLoading ? <p className="card-description">Loading cooperative data from Supabase...</p> : null}

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Voice commands" description="Designed for wet hands, glare, and quick confirmation." action={<Button variant="secondary" onClick={() => onNavigate('tools')}>Use</Button>} />
          <div className="list">
            {voiceCommands.slice(0, 3).map((command) => (
              <div className="list-item" key={command.phrase}>
                <div>
                  <p className="list-item-title">{command.phrase}</p>
                  <p className="list-item-meta">{command.intent}</p>
                </div>
                <span className="badge">{command.language}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Smart weather and hazard" action={<Button variant="secondary" onClick={() => onNavigate('tools')}>Open</Button>} />
          <div className="list">
            <div className="list-item"><span>Wind and wave</span><strong>{smartWeather.windKts} kts / {smartWeather.waveM} m</strong></div>
            <div className="list-item"><span>Risk level</span><span className={`badge ${smartWeather.hazard ? 'badge-warning' : 'badge-success'}`}>{smartWeather.hazard ? 'Caution' : 'Normal'}</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Priority alerts" action={<Button variant="secondary" onClick={() => onNavigate('community')}>Post</Button>} />
          <div className="list">
            {alerts.slice(0, 3).map((alert) => (
              <article className="list-item community-alert" key={alert.id}>
                <div>
                  <p className="list-item-title">{alert.title}</p>
                  <p className="list-item-meta">{alert.message}</p>
                </div>
                <span className="badge badge-warning">{alert.level}</span>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Productive fishing zones" description="Locations are visible only inside trusted cooperative sharing rules." action={<Button variant="secondary" onClick={() => onNavigate('tools')}>Map</Button>} />
          <div className="list">
            {productiveZones.slice(0, 2).map((zone) => (
              <div className="list-item" key={zone.id}>
                <div>
                  <p className="list-item-title">{zone.name}</p>
                  <p className="list-item-meta">{zone.distance} - {zone.lastCatch}</p>
                </div>
                <span className="badge badge-success">{zone.confidence}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent catch logs" action={<Button variant="secondary" onClick={() => onNavigate('logs')}>View</Button>} />
          <div className="list">
            {logs.slice(0, 2).map((log) => (
              <div className="list-item" key={log.id}>
                <div>
                  <p className="list-item-title">{log.species}</p>
                  <p className="list-item-meta">{log.weight} - {log.location}</p>
                </div>
                <span className="badge">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section className="two-column-grid">
        <Card>
          <CardHeader title="News and updates" action={<Button variant="secondary" onClick={() => onNavigate('news')}>Read</Button>} />
          <div className="list">
            {news.slice(0, 2).map((item) => (
              <article className="list-item" key={item.id}>
                <div>
                  <p className="list-item-title">{item.title}</p>
                  <p className="list-item-meta">{item.text}</p>
                </div>
                <span className="badge">{item.type}</span>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
