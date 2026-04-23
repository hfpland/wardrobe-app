import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 80 }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <p style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>Settings</p>
      </div>

      {/* Profile */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', margin: '0 16px 16px', background: '#f9fafb', borderRadius: 14 }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          )}
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>{user.displayName}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{user.email}</p>
          </div>
        </div>
      )}

      {/* Menu items */}
      <button onClick={() => navigate('/settings/wardrobe-setup')}
        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={1.8} style={{ width: 22, height: 22, flexShrink: 0 }}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#111827' }}>Wardrobe Setup</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Custom sizes, materials, layers</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0 16px 20px' }}>
        <button onClick={logout}
          style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
