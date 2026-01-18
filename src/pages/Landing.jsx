import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Sprout, Building2 } from 'lucide-react';

const Landing = ({ setLang }) => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const isMobile = windowWidth < 768;

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for language changes from other components
  React.useEffect(() => {
    const handleLanguageChange = (e) => {
      setLang(e.detail.lang);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [setLang]);

  return (
    <div style={pageStyle}>
      
      {/* UBL ROLE SELECTION */}
      <div style={{...modalStyle, maxWidth: isMobile ? '90%' : '900px', width: '90%', padding: isMobile ? '20px' : '30px'}}>
        <h1 style={{ color: '#1b5e20', margin: '0 0 10px 0', fontSize: isMobile ? '20px' : '28px' }}>Harvest Link</h1>
        <p style={{ color: '#555', marginBottom: isMobile ? '15px' : '30px', fontSize: isMobile ? '12px' : '14px' }}>Unified Logistics Interface (UBL)</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '20px', width: '100%' }}>
          
          <div onClick={() => navigate('/login', { state: { role: 'admin' } })} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
            <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Building2 color="white" size={isMobile ? 20 : 24} /></div>
            <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Head Office</h3>
            <p style={{fontSize: isMobile ? '11px' : '13px'}}>Admin Dashboard</p>
          </div>

          <div onClick={() => navigate('/login', { state: { role: 'farmer' } })} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
            <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Sprout color="white" size={isMobile ? 20 : 24} /></div>
            <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Kisan View</h3>
            <p style={{fontSize: isMobile ? '11px' : '13px'}}>Cargo Health Index</p>
          </div>

          <div onClick={() => navigate('/login', { state: { role: 'transporter' } })} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
            <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><Truck color="white" size={isMobile ? 20 : 24} /></div>
            <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Gaadi Maalik</h3>
            <p style={{fontSize: isMobile ? '11px' : '13px'}}>Fleet Management</p>
          </div>

          <div onClick={() => navigate('/login', { state: { role: 'driver' } })} style={{...cardStyle, padding: isMobile ? '18px' : '25px', gap: isMobile ? '8px' : '10px'}}>
            <div style={{...iconCircle, width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px'}}><User color="white" size={isMobile ? 20 : 24} /></div>
            <h3 style={{fontSize: isMobile ? '14px' : '16px'}}>Driver Bhai</h3>
            <p style={{fontSize: isMobile ? '11px' : '13px'}}>Navigation & Docs</p>
          </div>

        </div>
      </div>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', width: '100%', background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/images/landing-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' };
const modalStyle = { 
  background: 'linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url("/images/landing-bg.jpg")', 
  backgroundSize: 'cover', 
  backgroundPosition: 'center', 
  padding: '30px', 
  borderRadius: '16px', 
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  textAlign: 'center', 
  maxWidth: '500px', 
  width: '100%',
  backdropFilter: 'blur(2px)'
};
const cardStyle = { background: 'rgba(255,255,255,0.9)', padding: '25px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'transform 0.2s, box-shadow 0.2s' };
const iconCircle = { width: '50px', height: '50px', borderRadius: '50%', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' };

export default Landing;