import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart2, TrendingUp, AlertTriangle, Settings, Truck, Globe, LogOut, BarChart3, FileText } from 'lucide-react';
import { translations } from '../translations';
import { useUser } from '../UserContext';
import TripHistory from './TripHistory';

const TransporterSidebar = ({ lang }) => {
  const t = translations.menu?.[lang] || translations.menu?.en || {};
  const tripT = translations.tripHistory?.[lang] || translations.tripHistory?.en || {};

  const linkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', padding: '10px 15px',
    margin: '6px 0',
    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    textDecoration: 'none', borderRadius: '8px', transition: 'all 0.3s ease',
    fontWeight: isActive ? '600' : '400', fontSize: '13px',
    borderLeft: isActive ? '4px solid #a5d6a7' : '4px solid transparent'
  });

  const navigate = useNavigate();
  const { logout } = useUser();

  const [isPhone, setIsPhone] = useState(false);
  const [showTripHistory, setShowTripHistory] = useState(false);

  useEffect(() => {
    const onResize = () => setIsPhone(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ width: '85%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-gradient)', color: 'white', overflowY: 'auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', letterSpacing: '0.5px', cursor: 'pointer' }}>
          <Truck size={24} color="#a5d6a7" />
          <span>KRISHI<span style={{ fontWeight: '300', opacity: 0.8 }}>PATH</span></span>
        </h2>
      </Link>

      <nav style={{ flex: 1 }}>
        <NavLink to="/fleet-standalone" style={linkStyle}>
          <LayoutDashboard size={18} style={{ marginRight: '10px' }} /> {t.dash || 'Dashboard'}
        </NavLink>
        <NavLink to="/transporter-map" style={linkStyle}>
          <Map size={18} style={{ marginRight: '10px' }} /> {t.liveMap || 'Live Map'}
        </NavLink>
        <button
          onClick={() => setShowTripHistory(true)}
          style={{
            ...linkStyle({}),
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'transparent',
            border: 'none',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ffffff';
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            e.target.style.background = 'transparent';
          }}
        >
          <BarChart3 size={18} style={{ marginRight: '10px' }} /> {tripT.tripHistory || 'Trip History'}
        </button>
        {/* <NavLink to="/transporter-analytics" style={linkStyle}>
          <BarChart2 size={18} style={{ marginRight: '10px' }} /> {t.analytics || 'Analytics'}
        </NavLink> */}
        <NavLink to="/transporter-routes" style={linkStyle}>
          <TrendingUp size={18} style={{ marginRight: '10px' }} /> {t.routes || 'Routes'}
        </NavLink>
        <NavLink to="/transporter-documents" style={linkStyle}>
          <FileText size={18} style={{ marginRight: '10px' }} /> {t.documents || 'Documents'}
        </NavLink>
        <NavLink to="/transporter-alerts" style={linkStyle}>
          <AlertTriangle size={18} style={{ marginRight: '10px' }} /> {t.alerts || 'Alerts'}
        </NavLink>
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: 'auto' }}>
        <NavLink to="/transporter-settings" style={linkStyle}>
          <Settings size={18} style={{ marginRight: '10px' }} /> {t.settings || 'Settings'}
        </NavLink>
        {isPhone && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={() => window.dispatchEvent(new Event('openLanguageModal'))} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <Globe size={16} /> <span>{t.changeLanguage || 'Language'}</span>
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(211,47,47,0.9)', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <LogOut size={16} /> <span>{t.logout || 'Logout'}</span>
            </button>
          </div>
        )}
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '15px', textAlign: 'center' }}>
          v1.0.4 | Gaadi Maalik
        </div>
      </div>

      {/* Trip History Modal */}
      <TripHistory
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        lang={lang}
        translations={translations}
      />
    </div>
  );
};

export default TransporterSidebar;
