import { Card } from './Card';

export function MetricCard({ icon, label, note, value }) {
  return (
    <Card>
      <div className="metric">
        <span className="metric-icon" aria-hidden="true">{icon ?? 'FF'}</span>
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
        <span className="metric-note">{note}</span>
      </div>
    </Card>
  );
}
