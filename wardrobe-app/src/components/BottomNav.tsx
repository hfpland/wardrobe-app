import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  {
    label: 'Wardrobe',
    path: '/wardrobe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  // + button is rendered separately in the middle
  {
    label: 'Stylist',
    path: '/stylist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 16px 18px' }}>
        {leftTabs.map((tab) => {
          const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 64, background: 'none', border: 'none', cursor: 'pointer', color: active ? 'var(--text)' : 'var(--text-tertiary)', transition: 'color 0.15s' }}>
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
            </button>
          );
        })}

        {/* Center + button */}
        <button onClick={() => navigate('/add')} aria-label="Add item"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--text)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth={2.5} style={{ width: 22, height: 22 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </button>

        {rightTabs.map((tab) => {
          const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 64, background: 'none', border: 'none', cursor: 'pointer', color: active ? 'var(--text)' : 'var(--text-tertiary)', transition: 'color 0.15s' }}>
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
