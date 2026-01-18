import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Navigation, FileText, AlertTriangle, Settings, Truck } from 'lucide-react';
import { translations } from '../translations';

const DriverSidebar = ({ lang }) => {
  const t = translations.menu?.[lang] || translations.menu?.en || {};

  const linkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', padding: '10px 15px',
    margin: '6px 0',
    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    textDecoration: 'none', borderRadius: '8px', transition: 'all 0.3s ease',
    fontWeight: isActive ? '600' : '400', fontSize: '13px',
    borderLeft: isActive ? '4px solid #a5d6a7' : '4px solid transparent'
  });

  return (
  <div style={{ width: '85%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-gradient)', color: 'white', overflowY: 'auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', letterSpacing: '0.5px', cursor: 'pointer' }}>
        <Truck size={24} color="#a5d6a7" />
          <span>HARVEST<span style={{ fontWeight: '300', opacity: 0.8 }}>LINK</span></span>
        </h2>
      </Link>

      <nav style={{ flex: 1 }}>
        <NavLink to="/driver" style={linkStyle}>
          <LayoutDashboard size={18} style={{ marginRight: '10px' }} /> {t.dash || 'Dashboard'}
        </NavLink>
        <NavLink to="/driver-navigation" style={linkStyle}>
          <Navigation size={18} style={{ marginRight: '10px' }} /> {t.navigation || 'Navigation'}
        </NavLink>
        {/* <NavLink to="/driver-documents" style={linkStyle}>
          <FileText size={18} style={{ marginRight: '10px' }} /> {t.documents || 'Documents'}
        </NavLink>
        <NavLink to="/driver-alerts" style={linkStyle}>
          <AlertTriangle size={18} style={{ marginRight: '10px' }} /> {t.alerts || 'Alerts'}
        </NavLink> */}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: 'auto' }}>
        <NavLink to="/driver-settings" style={linkStyle}>
          <Settings size={18} style={{ marginRight: '10px' }} /> {t.settings || 'Settings'}
        </NavLink>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '15px', textAlign: 'center' }}>
          v1.0.4 | Driver Bhai
        </div>
      </div>
    </div>
  );
};

export default DriverSidebar;
