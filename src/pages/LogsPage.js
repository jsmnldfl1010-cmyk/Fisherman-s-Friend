import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';
import { formatDate } from '../utils/sampleData';

const initialForm = { species: '', weight: '', location: '', notes: '' };

export default function LogsPage() {
  const { addLog, dataSource, error, isLoading, logs } = useAppData();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await addLog(form);
      setForm(initialForm);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-grid">
      <Card>
        <CardHeader title="Add catch log" description="Record catch details directly in Supabase for cooperative reporting." />
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Species</span>
            <input className="input" name="species" onChange={handleChange} required value={form.species} />
          </label>
          <label className="field">
            <span className="label">Weight or count</span>
            <input className="input" name="weight" onChange={handleChange} required value={form.weight} />
          </label>
          <label className="field field-full">
            <span className="label">Location</span>
            <input className="input" name="location" onChange={handleChange} required value={form.location} />
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
