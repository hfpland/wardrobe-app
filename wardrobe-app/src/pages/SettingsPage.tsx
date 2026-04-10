import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
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
