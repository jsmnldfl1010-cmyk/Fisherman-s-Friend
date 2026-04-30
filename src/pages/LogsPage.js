import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';
import { formatDate } from '../utils/sampleData';
import { getGuidedInputOptions, getSpeciesSuggestions } from '../services/fishingAssistant';

const initialForm = { species: 'Bangus (Milkfish)', weight: '', sizeCm: '', location: 'Sarangani Bay', method: 'Handline', catchType: 'Single catch', weather: 'Clear', notes: '', photo: null };

export default function LogsPage() {
  const { addLog, dataSource, error, isLoading, logs } = useAppData();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState('en');
  const options = getGuidedInputOptions(language);
  const speciesOptions = getSpeciesSuggestions(form.species);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const notesWithSize = `${form.sizeCm ? `Size: ${form.sizeCm} cm.` : ''} Method: ${form.method}. Catch type: ${form.catchType}. Sea: ${form.weather}. ${form.notes}`.trim();
      await addLog({ ...form, notes: notesWithSize });
      setForm(initialForm);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-grid">
      <Card>
        <CardHeader title="Add catch log" description="Guided logging with dropdowns and icon-supported choices for faster onboard use." />
        <div className="map-controls">
          <button className={`pill-toggle ${language === 'en' ? 'active' : ''}`} type="button" onClick={() => setLanguage('en')}>English</button>
          <button className={`pill-toggle ${language === 'fil' ? 'active' : ''}`} type="button" onClick={() => setLanguage('fil')}>Filipino</button>
          <button className={`pill-toggle ${language === 'ceb' ? 'active' : ''}`} type="button" onClick={() => setLanguage('ceb')}>Bisaya</button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">{options.labels.fishSpecies}</span>
            <select className="select select-large" name="species" onChange={handleChange} value={form.species}>
              {speciesOptions.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.value}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Catch photo</span>
            <input className="input" accept="image/*" capture="environment" onChange={(event) => setForm((current) => ({ ...current, photo: event.target.files?.[0] ?? null }))} type="file" />
          </label>
          <label className="field">
            <span className="label">Weight (kg)</span>
            <input className="input" name="weight" onChange={handleChange} required value={form.weight} />
          </label>
          <label className="field">
            <span className="label">{options.labels.fishingMethod}</span>
            <select className="select select-large" name="method" onChange={handleChange} value={form.method}>
              {options.fishingMethods.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.value}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Catch type</span>
            <select className="select select-large" name="catchType" onChange={handleChange} value={form.catchType}>
              {options.catchTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Sea condition</span>
            <select className="select select-large" name="weather" onChange={handleChange} value={form.weather}>
              {options.weatherConditionChoices.map((item) => <option key={item}>🌦️ {item}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Fish size (cm)</span>
            <input className="input" name="sizeCm" onChange={handleChange} value={form.sizeCm} />
          </label>
          <label className="field">
            <span className="label">{options.labels.location}</span>
            <select className="select select-large" name="location" onChange={handleChange} value={form.location}>
              {options.locations.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.value}</option>)}
            </select>
          </label>
          <label className="field field-full">
            <span className="label">Notes</span>
            <textarea className="textarea" name="notes" onChange={handleChange} value={form.notes} />
          </label>
          <div className="field-full">
            <Button disabled={isSaving} type="submit">{isSaving ? 'Saving...' : 'Save log'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Catch history" description={`Stored in ${dataSource}.`} />
        {error ? <p className="status-error">{error}</p> : null}
        {isLoading ? <p className="card-description">Loading catch logs from Supabase...</p> : null}
        <div className="list">
          {logs.map((log) => (
            <article className="list-item" key={log.id}>
              <div>
                <p className="list-item-title">{log.species}</p>
                <p className="list-item-meta">{log.weight} - {log.location} - {log.notes}</p>
              </div>
              <span className="badge">{formatDate(log.createdAt)}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
