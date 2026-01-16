import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';

// UBL PAGES
import Landing from './pages/Landing';
import FarmerDashboard from './pages/FarmerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AIChatButton from './components/AIChatButton';

// ADMIN PAGES
import Dashboard from './pages/Dashboard';
import RouteAnalysis from './pages/RouteAnalysis'; 
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Fleet from './pages/Fleet';

// --- HELPER TO FORCE UBL ON REFRESH ---
const RedirectToUBL = ({ children, lang }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If language is lost (refresh happened), go to Landing
    if (!lang) {
      navigate('/');
    }
  }, [lang, navigate, location]);

  return lang ? children : null;
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
  // Simple state management for demo purposes
  const [lang, setLang] = React.useState(null); 

  return (
    <BrowserRouter>
      {/* Global AI Chat */}
      <AIChatButton />

      <Routes>
        {/* 1. LANDING PAGE (Language + Role Selection) */}
        <Route path="/" element={<Landing setLang={setLang} />} />

        {/* 2. FARMER (KISAN) - Uses simplified logic */}
        <Route path="/farmer" element={
           <RedirectToUBL lang={lang}>
             <FarmerDashboard />
           </RedirectToUBL>
        } />

        {/* 3. DRIVER - Standalone Map & Docs */}
        <Route element={<StandaloneWrapper lang={lang} />}>
          <Route path="/driver" element={
             <RedirectToUBL lang={lang}>
               <DriverDashboard />
             </RedirectToUBL>
          } />
        </Route>
        
        {/* 4. TRANSPORTER - Standalone Fleet Page */}
        <Route element={<StandaloneWrapper lang={lang} />}>
          <Route path="/fleet-standalone" element={
              <RedirectToUBL lang={lang}>
                 <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
                    <Fleet /> 
                 </div>
              </RedirectToUBL>
          } />
        </Route>

        {/* 5. ADMIN PANEL (Head Office) */}
        <Route element={<Layout lang={lang} />}>
          <Route path="/dashboard" element={<RedirectToUBL lang={lang}><Dashboard /></RedirectToUBL>} />
          <Route path="/fleet" element={<RedirectToUBL lang={lang}><Fleet /></RedirectToUBL>} />
          <Route path="/routes" element={<RedirectToUBL lang={lang}><RouteAnalysis /></RedirectToUBL>} /> 
          <Route path="/analytics" element={<RedirectToUBL lang={lang}><Analytics /></RedirectToUBL>} /> 
          <Route path="/alerts" element={<RedirectToUBL lang={lang}><Alerts /></RedirectToUBL>} />
          <Route path="/settings" element={<RedirectToUBL lang={lang}><Settings /></RedirectToUBL>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;