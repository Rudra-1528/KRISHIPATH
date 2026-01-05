import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Phone, User, Battery, Signal, MapPin, Truck } from 'lucide-react';
import { translations } from '../translations';

const Fleet = () => {
  const { lang, isMobile } = useOutletContext(); 
  const t = translations.menu[lang] || translations.menu['en']; // Basic translation fallback

  // --- MOCK FLEET DATA ---
  const [trucks] = useState([
    { 
      id: "VAC13143", 
      status: "Moving", 
      driver: "Rudra Pratap", 
      phone: "+919580214142", 
      location: "Mumbai - Nashik Hwy", 
      battery: 85, 
      signal: "Strong",
      cargo: "Tomatoes",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    { 
        id: "GJ-01-LIVE",  // <--- HERO TRUCK
        status: "Moving", 
        driver: "Rohit sharma", // <--- YOUR NAME
        phone: "+916204773940", // <--- YOUR REAL NUMBER
        location: "Lavad, Gujarat", 
        battery: 85, 
        signal: "Strong",
        cargo: "Medical Supplies",
        img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    { 
      id: "MH-12-9988", 
      status: "Stopped", 
      driver: "Shaurya Mudgal", 
      phone: "+919354937688", 
      location: "Pune Warehouse", 
      battery: 42, 
      signal: "Weak",
      cargo: "Onions",
      img: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    { 
      id: "GJ-05-1122", 
      status: "At Risk", 
      driver: "Vikram Singh", 
      phone: "+919988777665", 
      location: "Surat GIDC", 
      battery: 12, 
      signal: "No Signal",
      cargo: "Milk",
      img: "https://randomuser.me/api/portraits/men/11.jpg"
    },
    { 
      id: "MH-04-5544", 
      status: "Moving", 
      driver: "Amit Sharma", 
      phone: "+919000011111", 
      location: "Thane Checkpost", 
      battery: 92, 
      signal: "Strong",
      cargo: "Vaccines",
      img: "https://randomuser.me/api/portraits/men/64.jpg"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // --- THE REAL CALLING FUNCTION ---
  const handleCall = (name, number) => {
    // 1. Remove spaces from number just in case (e.g., "+91 987..." -> "+91987...")
    const cleanNumber = number.replace(/\s/g, '');
    
    // 2. Open the Phone Dialer
    window.location.href = `tel:${cleanNumber}`;
  };

  // Filter logic
  const filteredTrucks = trucks.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* --- HEADER & SEARCH --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#1b5e20' }}>Live Fleet Status</h1>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    Manage drivers and vehicle health.
                </p>
            </div>

            <div style={{ position: 'relative' }}>
                <Search size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    placeholder="Search Driver or Truck ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        padding: '12px 12px 12px 45px', 
                        borderRadius: '10px', 
                        border: '1px solid #ddd', 
                        width: '280px',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
            </div>
        </div>

        {/* --- TRUCK GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px' }}>
            
            {filteredTrucks.map(truck => (
                <div key={truck.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: truck.status === 'At Risk' ? '4px solid #d32f2f' : '4px solid #2e7d32' }}>
                    
                    {/* Top Row: Truck ID & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}>
                            <Truck size={20} color="#004d40" />
                            {truck.id}
                        </div>
                        <span style={{ 
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', 
                            background: truck.status === 'At Risk' ? '#ffebee' : truck.status === 'Stopped' ? '#fff3e0' : '#e8f5e9',
                            color: truck.status === 'At Risk' ? '#d32f2f' : truck.status === 'Stopped' ? '#ef6c00' : '#2e7d32'
                        }}>
                            {truck.status}
                        </span>
                    </div>

                    {/* Driver Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <img src={truck.img} alt="Driver" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{truck.driver}</div>
                            <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={12} /> ID: DRV-{Math.floor(Math.random()*1000)}
                            </div>
                        </div>
                    </div>

                    {/* Tech Details (Battery / Location) */}
                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', display: 'flex', gap: '6px' }}><MapPin size={16}/> Location</span>
                            <span style={{ fontWeight: 'bold' }}>{truck.location}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', display: 'flex', gap: '6px' }}><Battery size={16}/> Battery</span>
                            <span style={{ fontWeight: 'bold', color: truck.battery < 20 ? 'red' : 'green' }}>{truck.battery}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', display: 'flex', gap: '6px' }}><Signal size={16}/> Signal</span>
                            <span style={{ fontWeight: 'bold' }}>{truck.signal}</span>
                        </div>
                    </div>

                    {/* Call Button */}
                    <button 
                        onClick={() => handleCall(truck.driver, truck.phone)}
                        style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'transparent', border: '1px solid #004d40', color: '#004d40', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Phone size={18} /> Call Driver
                    </button>

                </div>
            ))}
        </div>

    </div>
  );
};

export default Fleet;