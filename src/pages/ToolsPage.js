import { useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppData } from '../services/AppDataContext';

export default function ToolsPage() {
  const { productiveZones, voiceCommands } = useAppData();
  const [locationStatus, setLocationStatus] = useState('GPS waiting');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS unavailable on this device');
      return;
    }

    setLocationStatus('Requesting GPS lock...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      },
      () => setLocationStatus('GPS permission needed')
    );
  };

  return (
    <div className="page-grid sea-mode">
      <Card>
        <CardHeader
          title="Cooperative fishing zone map"
          description="GPS-based productive zones are shared only inside trusted cooperative networks."
          action={<Button onClick={requestLocation}>Use GPS</Button>}
        />
        <div className="sea-status-bar" aria-live="polite">
          <span>Current position</span>
          <strong>{locationStatus}</strong>
        </div>
        <div className="map-preview" aria-label="Trusted productive fishing zone map preview" role="img">
          {productiveZones.map((zone) => (
            <span
              className={`map-pin map-pin-${zone.confidence.toLowerCase()}`}
              key={zone.id}
              style={{ left: zone.left, top: zone.top }}
              title={`${zone.name} - ${zone.trustLevel}`}
            />
          ))}
        </div>
      </Card>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Trusted zones" description="Share catches without exposing locations outside the cooperative." />
          <div className="list">
            {productiveZones.map((zone) => (
              <article className="list-item zone-item" key={zone.id}>
                <div>
                  <p className="list-item-title">{zone.name}</p>
                  <p className="list-item-meta">{zone.cooperative}</p>
                  <p className="list-item-meta">{zone.lastCatch}</p>
                  <p className="list-item-meta">{zone.coordinates}</p>
                </div>
                <div className="zone-meta">
                  <span className="badge badge-success">{zone.confidence}</span>
                  <span className="badge">{zone.distance}</span>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card className="voice-panel">
          <CardHeader title="Voice-first sea controls" description="Cebuano and Hiligaynon commands keep the interface usable in rain, glare, and rolling water." />
          <div className="voice-command-grid">
            {voiceCommands.map((command) => (
              <button className="voice-command" key={command.phrase} type="button">
                <span>{command.language}</span>
                <strong>{command.phrase}</strong>
                <small>{command.intent}</small>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="feature-grid">
        <Card>
          <CardHeader title="PAGASA alert handoff" description="Ready for real-time marine weather, push alerts, and offline replay of the last valid bulletin." />
        </Card>
        <Card>
          <CardHeader title="Weatherproof operation" description="Large targets, high contrast, short labels, and hands-free flows for small boats." />
        </Card>
        <Card>
          <CardHeader title="Coop privacy" description="Zone visibility can be scoped by cooperative membership, vessel role, and trusted sharing rules." />
        </Card>
      </section>
    </div>
  );
}
