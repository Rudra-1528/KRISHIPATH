import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { UserProvider } from './UserContext';
import { NotificationProvider } from './NotificationContext';

// UBL PAGES
import Landing from './pages/Landing';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import DriverNavigation from './pages/DriverNavigation';
import DriverDocuments from './pages/DriverDocuments';
import TransporterDocuments from './pages/TransporterDocuments';
import AIChatButton from './components/AIChatButton';
import TransporterAlerts from './pages/TransporterAlerts';

// UBL WRAPPERS
import FarmerWrapper from './components/FarmerWrapper';
import DriverWrapper from './components/DriverWrapper';
import TransporterWrapper from './components/TransporterWrapper';

// ADMIN PAGES
import Dashboard from './pages/Dashboard';
import RouteAnalysis from './pages/RouteAnalysis'; 
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Fleet from './pages/Fleet';

// --- ROUTE WRAPPER (no-op now; always renders children) ---
const RedirectToUBL = ({ children }) => {
  return children;
};
// --- STANDALONE WRAPPER (Provides context for pages outside Layout) ---
const StandaloneWrapper = ({ lang }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Provide context via Outlet (just like Layout does)
  return <Outlet context={{ lang, isMobile }} />;
};
function App() {
  const [lang, setLang] = React.useState(() => {
    const saved = localStorage.getItem('harvest_lang');
    return saved || 'en';
  });

  // Listen for storage changes from other tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'harvest_lang' && e.newValue) {
        setLang(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for language changes from Settings or other components
  React.useEffect(() => {
    const handleLanguageChange = (e) => {
      setLang(e.detail.lang);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const updateLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('harvest_lang', newLang);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
  }; 

  return (
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <AIChatButton lang={lang} />

          <Routes>
          <Route path="/" element={<Landing setLang={setLang} />} />

          <Route element={<StandaloneWrapper lang={lang} />}>
            <Route path="/login" element={<RedirectToUBL lang={lang}><Login /></RedirectToUBL>} />
          </Route>

          <Route element={<FarmerWrapper lang={lang} setLang={updateLang} />}>
            <Route path="/farmer" element={<RedirectToUBL lang={lang}><FarmerDashboard /></RedirectToUBL>} />
            <Route path="/farmer-crops" element={<RedirectToUBL lang={lang}><FarmerDashboard /></RedirectToUBL>} />
            <Route path="/farmer-shipments" element={<RedirectToUBL lang={lang}><FarmerDashboard /></RedirectToUBL>} />
            <Route path="/farmer-alerts" element={<RedirectToUBL lang={lang}><FarmerDashboard /></RedirectToUBL>} />
            <Route path="/farmer-settings" element={<RedirectToUBL lang={lang}><Settings /></RedirectToUBL>} />
          </Route>

          <Route element={<DriverWrapper lang={lang} setLang={updateLang} />}>
            <Route path="/driver" element={<RedirectToUBL lang={lang}><DriverDashboard /></RedirectToUBL>} />
            <Route path="/driver-navigation" element={<RedirectToUBL lang={lang}><DriverNavigation /></RedirectToUBL>} />
              <Route path="/driver-documents" element={<RedirectToUBL lang={lang}><DriverDocuments /></RedirectToUBL>} />
            <Route path="/driver-settings" element={<RedirectToUBL lang={lang}><Settings /></RedirectToUBL>} />
          </Route>

          <Route element={<TransporterWrapper lang={lang} setLang={updateLang} />}>
            <Route path="/fleet-standalone" element={<RedirectToUBL lang={lang}><Fleet /></RedirectToUBL>} />
            <Route path="/transporter-map" element={<RedirectToUBL lang={lang}><Fleet /></RedirectToUBL>} />
            <Route path="/transporter-analytics" element={<RedirectToUBL lang={lang}><Fleet /></RedirectToUBL>} />
            <Route path="/transporter-routes" element={<RedirectToUBL lang={lang}><RouteAnalysis /></RedirectToUBL>} />
            <Route path="/transporter-documents" element={<RedirectToUBL lang={lang}><TransporterDocuments /></RedirectToUBL>} />
            <Route path="/transporter-alerts" element={<RedirectToUBL lang={lang}><TransporterAlerts /></RedirectToUBL>} />
            <Route path="/transporter-settings" element={<RedirectToUBL lang={lang}><Settings /></RedirectToUBL>} />
          </Route>

          <Route element={<Layout lang={lang} />}>
            <Route path="/dashboard" element={<RedirectToUBL lang={lang}><Dashboard /></RedirectToUBL>} />
            <Route path="/fleet" element={<RedirectToUBL lang={lang}><Fleet /></RedirectToUBL>} />
            <Route path="/routes" element={<RedirectToUBL lang={lang}><RouteAnalysis /></RedirectToUBL>} />
            <Route path="/analytics" element={<RedirectToUBL lang={lang}><Analytics /></RedirectToUBL>} />
            <Route path="/alerts" element={<RedirectToUBL lang={lang}><Alerts /></RedirectToUBL>} />
            <Route path="/settings" element={<RedirectToUBL lang={lang}><Settings /></RedirectToUBL>} />
          </Route>
          </Routes>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;