import { useMemo, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getNewsItems } from '../services/fishingAssistant';

export default function NewsPage() {
  const items = useMemo(() => getNewsItems(), []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <div className="page-grid">
      <Card>
        <CardHeader
          title="Philippines fishing news and advisories"
          description="Regulation updates, seasonal restrictions, and environmental advisories with priority alert notifications."
          action={<Button onClick={() => setNotificationsEnabled((current) => !current)} type="button">{notificationsEnabled ? 'Disable alerts' : 'Enable alerts'}</Button>}
        />
        <p className="card-description">
          {notificationsEnabled
            ? 'Important updates will trigger in-app priority notifications.'
            : 'Enable alerts to receive immediate high-priority policy and weather updates.'}
        </p>
      </Card>
      <Card>
        <CardHeader title="Latest updates" />
        <div className="list">
          {items.map((item) => (
            <article className="list-item community-alert" key={item.id}>
              <div>
                <p className="list-item-title">{item.title}</p>
                <p className="list-item-meta">{item.text}</p>
                <p className="list-item-meta">{item.date}</p>
              </div>
              <span className="badge">{item.type}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
