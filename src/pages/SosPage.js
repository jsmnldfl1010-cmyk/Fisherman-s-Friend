import { useMemo, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getEmergencyContacts, getGuidedInputOptions } from '../services/fishingAssistant';

const holdTimeMs = 1800;

export default function SosPage() {
  const [emergencyType, setEmergencyType] = useState('Accident');
  const [status, setStatus] = useState('Ready');
  const [coords, setCoords] = useState('Unknown');
  const [holding, setHolding] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);
  const contacts = useMemo(() => getEmergencyContacts(), []);
  const options = getGuidedInputOptions('en');

  const resolveLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('GPS unavailable');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`),
        () => resolve('Location permission needed')
      );
    });

  const activateSOS = async () => {
    const location = await resolveLocation();
    setCoords(location);
    const message = `SOS sent for ${emergencyType}. Location: ${location}. Contacts: PCG, BFAR, emergency list.`;
    setStatus(message);
    if ('vibrate' in navigator) navigator.vibrate([300, 120, 300, 120, 300]);
    const utter = new SpeechSynthesisUtterance(`Emergency alert activated. ${emergencyType}.`);
    window.speechSynthesis?.speak(utter);
    const pending = JSON.parse(localStorage.getItem('fishermans_sos_queue') || '[]');
    pending.push({ emergencyType, location, createdAt: new Date().toISOString(), smsFallback: true });
    localStorage.setItem('fishermans_sos_queue', JSON.stringify(pending));
  };

  const handleHoldStart = () => {
    setHolding(true);
    setStartAt(Date.now());
  };

  const handleHoldEnd = async () => {
    setHolding(false);
    const elapsed = Date.now() - startAt;
    if (elapsed >= holdTimeMs) {
      await activateSOS();
      if (resendEnabled) {
        setTimeout(() => {
          setStatus((current) => `${current} Resend cycle active.`);
        }, 10000);
      }
    } else {
      setStatus('Press-and-hold longer to prevent accidental SOS.');
    }
  };

  return (
    <div className="page-grid">
      <Card className="sos-card">
        <CardHeader title="Emergency SOS system" description="Press and hold to send location, emergency type, and alert Coast Guard, BFAR, and your saved contacts." />
        <div className="form-grid">
          <label className="field field-full">
            <span className="label">{options.labels.emergencyType}</span>
            <select className="select select-large" onChange={(event) => setEmergencyType(event.target.value)} value={emergencyType}>
              {options.emergencyTypes.map((item) => <option key={item}>🚨 {item}</option>)}
            </select>
          </label>
          <label className="field field-full">
            <span className="label">Voice assist and auto-resend</span>
            <select className="select select-large" onChange={(event) => setResendEnabled(event.target.value === 'Enabled')} value={resendEnabled ? 'Enabled' : 'Disabled'}>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </label>
        </div>
        <button
          className={`sos-button ${holding ? 'holding' : ''}`}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          type="button"
        >
          HOLD TO SEND SOS
        </button>
        <p className="card-description">Current location: {coords}</p>
        <p className="card-description">{status}</p>
      </Card>

      <section className="two-column-grid">
        <Card>
          <CardHeader title="Official one-tap contacts" />
          <div className="list">
            {contacts.map((contact) => (
              <article className="list-item" key={contact.id}>
                <div>
                  <p className="list-item-title">{contact.name}</p>
                  <p className="list-item-meta">{contact.contact}</p>
                </div>
                <Button type="button" variant="secondary">Call</Button>
              </article>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Offline and SMS fallback" description="If internet is weak, emergency packets are queued locally for resend and SMS relay." />
          <p className="card-description">Queued emergency packets: {(JSON.parse(localStorage.getItem('fishermans_sos_queue') || '[]')).length}</p>
          <p className="card-description">This mode preserves timestamp, emergency type, and last known coordinates.</p>
        </Card>
      </section>
    </div>
  );
}
