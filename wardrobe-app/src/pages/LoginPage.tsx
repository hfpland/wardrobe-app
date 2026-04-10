import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'white', padding: 32, gap: 32 }}>
      <div>
        <div style={{ width: 72, height: 72, background: '#111827', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ fontSize: 32 }}>👗</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', margin: '0 0 6px', color: '#111827' }}>Wardrobe</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', margin: 0 }}>Your digital closet</p>
      </div>

      <button
        onClick={signInWithGoogle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '14px 0', borderRadius: 14, border: '1px solid #e5e7eb',
          background: 'white', fontSize: 16, fontWeight: 500, cursor: 'pointer', color: '#374151',
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
