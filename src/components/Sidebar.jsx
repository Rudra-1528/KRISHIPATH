import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Map, TrendingUp, AlertTriangle, Settings, BarChart2, Truck } from 'lucide-react';
import { translations } from '../translations';

const Sidebar = ({ lang }) => {
  // Load translations based on selected language
  const t = translations.menu[lang] || translations.menu['en'];

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
      
      {/* HEADER: CLICK TO GO HOME/CHANGE LANGUAGE */}
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', letterSpacing: '0.5px', cursor: 'pointer' }}>
            <Truck size={24} color="#a5d6a7" />
            <span>HARVEST<span style={{ fontWeight: '300', opacity: 0.8 }}>LINK</span></span>
        </h2>
      </Link>

      <nav style={{ flex: 1 }}>
        {/* 1. DASHBOARD (Fixed: Points to /dashboard to stop reset) */}
        <NavLink to="/dashboard" style={linkStyle}>
            <LayoutDashboard size={18} style={{ marginRight: '10px' }} /> {t.dash}
        </NavLink>

        {/* 2. FLEET */}
        <NavLink to="/fleet" style={linkStyle}>
            <Map size={18} style={{ marginRight: '10px' }} /> {t.fleet}
        </NavLink>

        {/* 3. TELEMETRY LOGS (Analytics) */}
        <NavLink to="/analytics" style={linkStyle}>
            <BarChart2 size={18} style={{ marginRight: '10px' }} /> {t.analytics}
        </NavLink>

        {/* 4. ROUTE ANALYSIS */}
        <NavLink to="/routes" style={linkStyle}>
            <TrendingUp size={18} style={{ marginRight: '10px' }} /> {t.routes}
        </NavLink>

        {/* 5. ALERTS */}
        <NavLink to="/alerts" style={linkStyle}>
            <AlertTriangle size={18} style={{ marginRight: '10px' }} /> {t.alerts}
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: 'auto' }}>
        <NavLink to="/settings" style={linkStyle}>
            <Settings size={18} style={{ marginRight: '10px' }} /> {t.settings}
        </NavLink>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '15px', textAlign: 'center' }}>
            v1.0.4 | ESP32-WROOM
        </div>
      </div>
    </div>
  );
};

export default Sidebar;