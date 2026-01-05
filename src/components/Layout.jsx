import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, User, Menu, X } from 'lucide-react';
import { translations } from '../translations'; 

const Layout = () => {
  const [lang, setLang] = useState('en'); 
  const [showModal, setShowModal] = useState(false); 
  const [savePreference, setSavePreference] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Treat tablets as mobile for sidebar logic
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true); else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (isMobile) setIsSidebarOpen(false); }, [location, isMobile]);

  useEffect(() => {
    const savedLang = localStorage.getItem('harvestLink_lang');
    if (savedLang) { setLang(savedLang); setShowModal(false); } else { setShowModal(true); }
  }, []);

  const handleLanguageSelect = (selectedLang) => {
    setLang(selectedLang);
    if (savePreference) localStorage.setItem('harvestLink_lang', selectedLang);
    setShowModal(false);
  };

  const t = translations.layout[lang] || translations.layout['en'];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f4f1ea' }}>
      
      {/* LANGUAGE MODAL */}
      {showModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)', fontSize: '22px' }}>{t.selectLang}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px', maxHeight: '300px', overflowY: 'auto' }}>
                {Object.keys(translations.layout).map((key) => (
                  <button key={key} style={btnStyle} onClick={() => handleLanguageSelect(key)}>{translations.layout[key].name}</button>
                ))}
              </div>
            </div>
          </div>
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      {/* KEY FIX: 'relative' pushes content. 'fixed' overlaps content. */}
      <div style={{
          position: isMobile ? 'fixed' : 'relative', 
          width: '240px', 
          height: '100%', 
          zIndex: 1000,
          transition: 'margin-left 0.3s ease',
          marginLeft: isSidebarOpen ? '0' : '-240px', // Slide logic
          flexShrink: 0
      }}>
          <Sidebar lang={lang} />
          {/* Close Button (Mobile Only) */}
          {isMobile && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: '20px', right: '-40px', background: 'white', border: 'none', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <X size={20} color="#333" />
            </button>
          )}
      </div>

      {/* OVERLAY (Mobile Only) */}
      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999 }}></div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '0' }}>
        
        {/* TOP BAR */}
        <div style={{ height: '65px', background: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Menu size={28} color="#2d5a27" /></button>}
            <h3 style={{ margin: 0, color: '#2d5a27', fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>Harvest Link</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: '#5d4037' }}>
              <Bell size={22} /><span style={{ position: 'absolute', top: '-4px', right: '-2px', width: '9px', height: '9px', background: '#d32f2f', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d5a27', background: '#e8f5e9', padding: '5px 10px', borderRadius: '20px' }}>
                {translations.layout[lang]?.name.slice(0, 3).toUpperCase() || "EN"}
              </span>
              <div style={{ width: '32px', height: '32px', background: '#2d5a27', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}><User size={16} /></div>
            </div>
          </div>
        </div>

        {/* PAGE */}
        <div style={{ padding: isMobile ? '15px' : '25px', flex: 1, overflowY: 'auto' }}>
           <Outlet context={{ lang, isMobile }} />
        </div>
      </div>
    </div>
  );
};

// Styles (Same)
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', width: '90%', maxWidth: '400px' };
const btnStyle = { padding: '12px', fontSize: '14px', cursor: 'pointer', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '8px', transition: 'background 0.2s' };

export default Layout;