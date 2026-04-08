import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import WardrobePage from './pages/WardrobePage';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import SettingsPage from './pages/SettingsPage';

const HIDE_NAV = ['/', '/splash'];

function Layout() {
  const location = useLocation();
  const showNav = !HIDE_NAV.includes(location.pathname);

  return (
    <div className="flex flex-col flex-1">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add" element={<AddItemPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/stylist" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
