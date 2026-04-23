import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import WardrobePage from './pages/WardrobePage';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import WardrobeSetupPage from './pages/WardrobeSetupPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

const HIDE_NAV = ['/', '/splash', '/login'];

function Layout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const showNav = !HIDE_NAV.includes(location.pathname);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={user ? <Navigate to="/wardrobe" replace /> : <LoginPage />} />
        <Route path="/wardrobe" element={user ? <WardrobePage /> : <Navigate to="/login" replace />} />
        <Route path="/wardrobe/:id" element={user ? <ItemDetailPage /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
        <Route path="/add" element={user ? <AddItemPage /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
        <Route path="/settings/wardrobe-setup" element={user ? <WardrobeSetupPage /> : <Navigate to="/login" replace />} />
        <Route path="/stylist" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
