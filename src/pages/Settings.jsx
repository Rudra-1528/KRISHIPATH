import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, Globe, Shield, LogOut, Save } from 'lucide-react';

const Settings = () => {
  // Get global language setter from Outlet Context
  const { lang, setLang, isMobile } = useOutletContext();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    app: false
  });

  // Local state for dropdown (syncs with global lang initially)
  const [selectedLang, setSelectedLang] = useState(lang);

  const handleSave = () => {
    // 1. Update Global Language (Instant, no reload needed)
    setLang(selectedLang);
    
    // 2. Mock Save for others
    alert("Settings Saved Successfully! Language updated.");
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '15px' : '20px', padding: isMobile ? '12px' : '0' }}>
        
        {/* --- HEADER --- */}
        <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '24px', color: '#1b5e20' }}>System Settings</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: isMobile ? '12px' : '14px' }}>
                Manage account, preferences, and alerts.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: isMobile ? '15px' : '25px' }}>
            
            {/* --- LEFT COLUMN: PROFILE CARD --- */}
            <div style={{ background: 'white', borderRadius: '12px', padding: isMobile ? '20px' : '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: isMobile ? '80px' : '100px', height: isMobile ? '80px' : '100px', borderRadius: '50%', background: '#004d40', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', margin: '0 auto' }}>
                        RP
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#2e7d32', width: '20px', height: '20px', borderRadius: '50%', border: '3px solid white' }}></div>
                </div>
                
                <h2 style={{ marginTop: isMobile ? '12px' : '15px', marginBottom: '5px', color: '#333', fontSize: isMobile ? '16px' : '18px' }}>Rudra Pratap</h2>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' }}>Admin</span>

                <div style={{ marginTop: isMobile ? '15px' : '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '15px' }}>
                    <div style={{...infoRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                        <span style={{color:'#888'}}>Role:</span>
                        <strong>Logistics Manager</strong>
                    </div>
                    <div style={{...infoRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                        <span style={{color:'#888'}}>Email:</span>
                        <strong style={{fontSize: isMobile ? '11px' : '14px'}}>rudra@harvestlink.in</strong>
                    </div>
                    <div style={{...infoRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                        <span style={{color:'#888'}}>Phone:</span>
                        <strong>+91 98765 43210</strong>
                    </div>
                </div>

                <button style={{ marginTop: isMobile ? '15px' : '25px', width: '100%', padding: isMobile ? '10px' : '12px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                    <LogOut size={isMobile ? 16 : 18} /> Sign Out
                </button>
            </div>

            {/* --- RIGHT COLUMN: PREFERENCES --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
                
                {/* 1. Language & Regional */}
                <div style={{...sectionStyle, padding: isMobile ? '15px' : '25px'}}>
                    <h3 style={{...headerStyle, fontSize: isMobile ? '16px' : '18px'}}><Globe size={isMobile ? 18 : 20}/> Language & Region</h3>
                    
                    <div style={{ marginTop: isMobile ? '12px' : '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: isMobile ? '12px' : '14px' }}>Dashboard Language</label>
                        <select 
                            value={selectedLang} 
                            onChange={(e) => setSelectedLang(e.target.value)}
                            style={{ width: '100%', padding: isMobile ? '10px' : '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: isMobile ? '12px' : '14px' }}
                        >
                            <option value="en">🇬🇧 English</option>
                            <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                            <option value="gj">🇮🇳 Gujarati (ગુજરાતી)</option>
                            <option value="pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                            <option value="mr">🇮🇳 Marathi (मराठी)</option>
                            <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                            <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                            <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                        </select>
                        <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#888', marginTop: '5px' }}>
                            Note: This will update the language across the entire admin panel instantly.
                        </p>
                    </div>
                </div>

                {/* 2. Notification Settings */}
                <div style={{...sectionStyle, padding: isMobile ? '15px' : '25px'}}>
                    <h3 style={{...headerStyle, fontSize: isMobile ? '16px' : '18px'}}><Bell size={isMobile ? 18 : 20}/> Notifications</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '15px', marginTop: isMobile ? '12px' : '15px' }}>
                        <label style={{...toggleRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                            <span>Email Alerts (Critical Only)</span>
                            <input type="checkbox" checked={notifications.email} onChange={(e)=>setNotifications({...notifications, email: e.target.checked})} />
                        </label>
                        <label style={{...toggleRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                            <span>SMS Alerts (Driver Status)</span>
                            <input type="checkbox" checked={notifications.sms} onChange={(e)=>setNotifications({...notifications, sms: e.target.checked})} />
                        </label>
                        <label style={{...toggleRowStyle, fontSize: isMobile ? '12px' : '14px'}}>
                            <span>App Push Notifications</span>
                            <input type="checkbox" checked={notifications.app} onChange={(e)=>setNotifications({...notifications, app: e.target.checked})} />
                        </label>
                    </div>
                </div>

                {/* 3. Security (Mock) */}
                <div style={{...sectionStyle, padding: isMobile ? '15px' : '25px'}}>
                    <h3 style={{...headerStyle, fontSize: isMobile ? '16px' : '18px'}}><Shield size={isMobile ? 18 : 20}/> Security</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '0' }}>
                        <span style={{ color: '#555', fontSize: isMobile ? '12px' : '14px' }}>Last Password Change: 30 days ago</span>
                        <button style={{ padding: isMobile ? '8px 12px' : '8px 15px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px' }}>Change Password</button>
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <button 
                    onClick={handleSave}
                    style={{ padding: isMobile ? '12px' : '15px', background: '#1b5e20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobile ? '13px' : '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <Save size={isMobile ? 18 : 20} /> Save Changes
                </button>

            </div>
        </div>
    </div>
  );
};

// --- STYLES ---
const sectionStyle = { background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const headerStyle = { margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#004d40', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const infoRowStyle = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', fontSize: '14px' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#444' };

export default Settings;