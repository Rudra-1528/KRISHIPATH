import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Leaf, TrendingUp, AlertTriangle, Settings, Truck } from 'lucide-react';
import { translations } from '../translations';

const FarmerSidebar = ({ lang }) => {
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
        <NavLink to="/farmer" style={linkStyle}>
          <LayoutDashboard size={18} style={{ marginRight: '10px' }} /> {t.dash || 'Dashboard'}
        </NavLink>
        {/* <NavLink to="/farmer-crops" style={linkStyle}>
          <Leaf size={18} style={{ marginRight: '10px' }} /> {t.myCrops || 'My Crops'}
        </NavLink>
        <NavLink to="/farmer-shipments" style={linkStyle}>
          <TrendingUp size={18} style={{ marginRight: '10px' }} /> {t.shipments || 'Shipments'}
        </NavLink>
        <NavLink to="/farmer-alerts" style={linkStyle}>
          <AlertTriangle size={18} style={{ marginRight: '10px' }} /> {t.alerts || 'Alerts'}
        </NavLink> */}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: 'auto' }}>
        <NavLink to="/farmer-settings" style={linkStyle}>
          <Settings size={18} style={{ marginRight: '10px' }} /> {t.settings || 'Settings'}
        </NavLink>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '15px', textAlign: 'center' }}>
          v1.0.4 | Kisan View
        </div>
      </div>
    </div>
  );
};

export default FarmerSidebar;
