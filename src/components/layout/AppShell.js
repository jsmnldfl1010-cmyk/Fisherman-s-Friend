import { Button } from '../ui/Button';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { id: 'logs', label: 'Catch logs', icon: 'CL' },
  { id: 'marketplace', label: 'Market', icon: '$' },
  { id: 'community', label: 'Alerts', icon: '!' },
  { id: 'tools', label: 'Sea tools', icon: '+' },
];

const titles = {
  dashboard: 'Harbor dashboard',
  logs: 'Catch tracking',
  marketplace: 'Coastal marketplace',
  community: 'Community alerts',
  tools: 'Sea tools',
};

export function AppShell({ activeRoute, children, onNavigate }) {
  return (
    <div className="app-shell">
      <Button className="skip-link" variant="secondary" onClick={() => document.getElementById('main-content')?.focus()}>
        Skip to content
      </Button>
      <div className="app-layout">
        <aside className="sidebar" aria-label="Primary">
          <div className="brand">
            <div className="brand-mark">
              <img src="/Nautical Logo with Fishing Elements.png" alt="Fisherman's Friend logo" />
            </div>
            <div>
              <p className="brand-name">Fisherman's Friend</p>
              <p className="brand-subtitle">Blue-water crew companion</p>
            </div>
          </div>
          <nav className="nav-list">
            {navigation.map((item) => (
              <button
                aria-current={activeRoute === item.id ? 'page' : undefined}
                className={`nav-button ${activeRoute === item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-status" aria-label="Offline status">
            <span className="status-icon" aria-hidden="true">OK</span>
            <p className="status-label">Offline ready</p>
            <p className="status-value">Last PAGASA alert, logs, and trusted zones stay available.</p>
          </div>
        </aside>

        <div className="content-wrap">
          <header className="topbar">
            <div>
              <h1>{titles[activeRoute]}</h1>
              <p className="topbar-meta">Built for Cebuano and Hiligaynon crews using minimal controls at sea.</p>
            </div>
            <Button onClick={() => onNavigate('tools')}>Sea mode</Button>
          </header>
          <main id="main-content" className="main-content" tabIndex="-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
