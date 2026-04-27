import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
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
    path: '/wardrobe',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 32px 20px' }}>
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '4px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--text)' : 'var(--text-tertiary)',
                transition: 'color 0.15s',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => navigate('/add')}
          aria-label="Add item"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{
            width: 52,
            height: 52,
            background: 'var(--text)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 4px var(--bg), 0 0 0 5px var(--border-strong)',
            transition: 'transform 0.15s',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth={2.5} style={{ width: 24, height: 24 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </button>
      </div>
    </nav>
  );
}
