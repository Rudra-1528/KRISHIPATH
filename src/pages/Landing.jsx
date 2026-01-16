import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Sprout, Building2, Globe } from 'lucide-react';

const Landing = ({ setLang }) => {
  const navigate = useNavigate();
  const [langSelected, setLangSelected] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const isMobile = windowWidth < 768;

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'hi', label: '🇮🇳 Hindi (हिंदी)' },
    { code: 'gj', label: '🇮🇳 Gujarati (ગુજરાતી)' },
    { code: 'pa', label: '🇮🇳 Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'mr', label: '🇮🇳 Marathi (मराठी)' },
    { code: 'ta', label: '🇮🇳 Tamil (தமிழ்)' },
    { code: 'te', label: '🇮🇳 Telugu (తెలుగు)' },
    { code: 'bn', label: '🇮🇳 Bengali (বাংলা)' },
  ];

  const handleLangSelect = (code) => {
    setLang(code);
    setLangSelected(true);
  };

  return (
    <div style={pageStyle}>
      
      {/* 1. LANGUAGE POPUP */}
      {!langSelected && (
        <div style={{...modalStyle, padding: isMobile ? '20px' : '30px'}}>
          <Globe size={isMobile ? 40 : 48} color="#2e7d32" style={{ marginBottom: '15px' }} />
          <h2 style={{ color: '#1b5e20', marginBottom: '10px', fontSize: isMobile ? '18px' : '24px' }}>Select Language / भाषा चुनें</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
            {languages.map((l) => (
              <button key={l.code} onClick={() => handleLangSelect(l.code)} style={{...langBtnStyle, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px' : '10px'}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. UBL ROLE SELECTION */}
      {langSelected && (
        <div style={{...modalStyle, maxWidth: isMobile ? '90%' : '900px', width: '90%', padding: isMobile ? '20px' : '30px'}}>
          <h1 style={{ color: '#1b5e20', margin: '0 0 10px 0', fontSize: isMobile ? '20px' : '28px' }}>Harvest Link</h1>
          <p style={{ color: '#555', marginBottom: isMobile ? '15px' : '30px', fontSize: isMobile ? '12px' : '14px' }}>Unified Logistics Interface (UBL)</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '20px', width: '100%' }}>
            
            <div onClick={() => navigate('/dashboard')} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
              <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Building2 color="white" size={isMobile ? 20 : 24} /></div>
              <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Head Office</h3>
              <p style={{fontSize: isMobile ? '11px' : '13px'}}>Admin Dashboard</p>
            </div>

            <div onClick={() => navigate('/farmer')} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
              <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Sprout color="white" size={isMobile ? 20 : 24} /></div>
              <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Kisan View</h3>
              <p style={{fontSize: isMobile ? '11px' : '13px'}}>Cargo Health Index</p>
            </div>

            <div onClick={() => navigate('/fleet-standalone')} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
              <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Truck color="white" size={isMobile ? 20 : 24} /></div>
              <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Gaadi Maalik</h3>
              <p style={{fontSize: isMobile ? '11px' : '13px'}}>Fleet Management</p>
            </div>

            <div onClick={() => navigate('/driver')} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
              <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><User color="white" size={isMobile ? 20 : 24} /></div>
              <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Driver Bhai</h3>
              <p style={{fontSize: isMobile ? '11px' : '13px'}}>Navigation & Docs</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const pageStyle = { minHeight: '100vh', width: '100%', background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2664&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' };
const modalStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '500px', width: '100%' };
const langBtnStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#333', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' };
const cardStyle = { background: '#f8f9fa', padding: '25px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'transform 0.2s, box-shadow 0.2s' };
const iconCircle = { width: '50px', height: '50px', borderRadius: '50%', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' };

export default Landing;