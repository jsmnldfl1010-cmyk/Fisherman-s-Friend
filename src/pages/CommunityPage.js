import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';
import { formatDate } from '../utils/sampleData';

const initialForm = { title: '', level: 'Safety', message: '' };

export default function CommunityPage() {
  const { addAlert, alerts, dataSource, error, isLoading } = useAppData();
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
      await addAlert(form);
      setForm(initialForm);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="two-column-grid">
      <Card>
        <CardHeader title="Post alert" description="Share safety, market, weather, or operations updates in Supabase." />
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field field-full">
            <span className="label">Title</span>
            <input className="input" name="title" onChange={handleChange} required value={form.title} />
          </label>
          <label className="field field-full">
            <span className="label">Level</span>
            <select className="select" name="level" onChange={handleChange} value={form.level}>
              <option>Safety</option>
              <option>Weather</option>
              <option>Market</option>
              <option>Operations</option>
            </select>
          </label>
          <label className="field field-full">
            <span className="label">Message</span>
            <textarea className="textarea" name="message" onChange={handleChange} required value={form.message} />
          </label>
          <div className="field-full">
            <Button disabled={isSaving} type="submit">{isSaving ? 'Sharing...' : 'Share alert'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Alert feed" description={`Posts are stored in ${dataSource}.`} />
        {error ? <p className="status-error">{error}</p> : null}
        {isLoading ? <p className="card-description">Loading alerts from Supabase...</p> : null}
        <div className="list">
          {alerts.map((alert) => (
            <article className="list-item community-alert" key={alert.id}>
              <div>
                <p className="list-item-title">{alert.title}</p>
                <p className="list-item-meta">{alert.message}</p>
                <p className="list-item-meta">{formatDate(alert.createdAt)}</p>
              </div>
              <span className="badge badge-warning">{alert.level}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
