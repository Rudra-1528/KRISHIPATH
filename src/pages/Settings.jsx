import React, { useState, useEffect } from 'react';
import { User, Bell, Globe, Shield, LogOut, Save } from 'lucide-react';

const Settings = () => {
  // --- STATE ---
  const [lang, setLang] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    app: false
  });

  // Load saved settings on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('harvestLink_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const handleSave = () => {
    // 1. Save Language
    localStorage.setItem('harvestLink_lang', lang);
    
    // 2. Mock Save for others
    alert("Settings Saved Successfully! Reloading to apply language change...");
    window.location.reload(); // Reload to apply language change globally
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* --- HEADER --- */}
        <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#1b5e20' }}>System Settings</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                Manage account, preferences, and alerts.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            
            {/* --- LEFT COLUMN: PROFILE CARD --- */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#004d40', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto' }}>
                        RP
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#2e7d32', width: '25px', height: '25px', borderRadius: '50%', border: '3px solid white' }}></div>
                </div>
                
                <h2 style={{ marginTop: '15px', marginBottom: '5px', color: '#333' }}>Rudra Pratap</h2>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Admin</span>

                <div style={{ marginTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={infoRowStyle}>
                        <span style={{color:'#888'}}>Role:</span>
                        <strong>Logistics Manager</strong>
                    </div>
                    <div style={infoRowStyle}>
                        <span style={{color:'#888'}}>Email:</span>
                        <strong>rudra@harvestlink.in</strong>
                    </div>
                    <div style={infoRowStyle}>
                        <span style={{color:'#888'}}>Phone:</span>
                        <strong>+91 98765 43210</strong>
                    </div>
                </div>

                <button style={{ marginTop: '25px', width: '100%', padding: '12px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            {/* --- RIGHT COLUMN: PREFERENCES --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Language & Regional */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}><Globe size={20}/> Language & Region</h3>
                    
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Dashboard Language</label>
                        <select 
                            value={lang} 
                            onChange={(e) => setLang(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="en">English (Default)</option>
                            <option value="hi">Hindi (हिंदी)</option>
                            <option value="gu">Gujarati (ગુજરાતી)</option>
                            <option value="mr">Marathi (मराठी)</option>
                            <option value="ta">Tamil (தமிழ்)</option>
                        </select>
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                            Note: Changing language will reload the dashboard.
                        </p>
                    </div>
                </div>

                {/* 2. Notification Settings */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}><Bell size={20}/> Notifications</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <label style={toggleRowStyle}>
                            <span>Email Alerts (Critical Only)</span>
                            <input type="checkbox" checked={notifications.email} onChange={(e)=>setNotifications({...notifications, email: e.target.checked})} />
                        </label>
                        <label style={toggleRowStyle}>
                            <span>SMS Alerts (Driver Status)</span>
                            <input type="checkbox" checked={notifications.sms} onChange={(e)=>setNotifications({...notifications, sms: e.target.checked})} />
                        </label>
                        <label style={toggleRowStyle}>
                            <span>App Push Notifications</span>
                            <input type="checkbox" checked={notifications.app} onChange={(e)=>setNotifications({...notifications, app: e.target.checked})} />
                        </label>
                    </div>
                </div>

                {/* 3. Security (Mock) */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}><Shield size={20}/> Security</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{ color: '#555' }}>Last Password Change: 30 days ago</span>
                        <button style={{ padding: '8px 15px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Change Password</button>
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <button 
                    onClick={handleSave}
                    style={{ padding: '15px', background: '#1b5e20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <Save size={20} /> Save Changes
                </button>

            </div>
        </div>
    </div>
  );
};

// --- STYLES ---
const sectionStyle = { background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const headerStyle = { margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#004d40', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const infoRowStyle = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', fontSize: '14px' };
const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#444' };

export default Settings;