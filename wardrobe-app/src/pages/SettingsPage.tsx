import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg)', paddingBottom: 80 }}>
      {/* Profile header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 20px', gap: 10 }}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--border-strong)' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user?.displayName || 'User'}</p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-tertiary)' }}>{user?.email}</p>
        </div>
      </div>

      {/* Settings section */}
      <div style={{ padding: '0 0 8px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', padding: '0 16px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</p>

        {/* Wardrobe Setup */}
        <button onClick={() => navigate('/settings/wardrobe-setup')}
          style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={1.8} style={{ width: 20, height: 20, flexShrink: 0 }}>
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Wardrobe Setup</p>
            <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>Custom sizes, materials, layers</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dark mode */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={1.8} style={{ width: 20, height: 20, flexShrink: 0 }}>
            {dark
              ? <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>
              : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            }
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{dark ? 'Light Mode' : 'Dark Mode'}</p>
          </div>
          <button onClick={toggle}
            style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', padding: 2, background: dark ? '#3b82f6' : 'var(--border-strong)', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: dark ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={logout}
          style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: '1px solid #ef4444', background: 'var(--bg)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
