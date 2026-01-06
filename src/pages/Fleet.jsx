import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Phone, User, Battery, Signal, MapPin, Truck, Map } from 'lucide-react';
import { collection, onSnapshot } from "firebase/firestore"; 
import { db } from '../firebase'; 
import { translations } from '../translations';

const Fleet = () => {
  const { lang, isMobile } = useOutletContext(); 
  const t = translations.menu[lang] || translations.menu['en'];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now()); 

  const staticTrucks = [
    { 
      id: "VAC13143", 
      driver: "Rudra Pratap", 
      driverId: "DRV-101",
      phone: "+919580214142", 
      route: "Mumbai → Nashik",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      defaultLocation: "19.0868, 72.8885" 
    },
    { 
      id: "MH-12-9988", 
      driver: "Shaurya Mudgal", 
      driverId: "DRV-102",
      phone: "+919354937688", 
      route: "Pune → Mumbai",
      img: "https://randomuser.me/api/portraits/men/45.jpg",
      defaultLocation: "18.5204, 73.8567"
    },
    { 
      id: "GJ-05-1122", 
      driver: "Vikram Singh", 
      driverId: "DRV-103",
      phone: "+919988777665", 
      route: "Surat → Vadodara",
      img: "https://randomuser.me/api/portraits/men/11.jpg",
      defaultLocation: "21.1702, 72.8311"
    },
    { 
      id: "MH-04-5544", 
      driver: "Amit Sharma", 
      driverId: "DRV-104",
      phone: "+919000011111", 
      route: "Thane → Pune",
      img: "https://randomuser.me/api/portraits/men/64.jpg",
      defaultLocation: "19.2183, 72.9781"
    },
  ];

  const [fleetData, setFleetData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shipments"), (snapshot) => {
      
      const liveData = snapshot.docs.reduce((acc, doc) => {
        // --- FIX: DO NOT OVERWRITE TIMESTAMP WITH Date.now() ---
        acc[doc.data().truck_id] = doc.data(); 
        return acc;
      }, {});

      // A. Process Static Trucks
      const mergedStatic = staticTrucks.map(t => {
        const live = liveData[t.id];
        
        // 1. Get Real Timestamp from DB. If missing, it is 0.
        const lastUpdate = live && live.last_updated ? Number(live.last_updated) : 0;
        // 2. Compare with NOW. If > 20 sec difference, it is Offline.
        const isOffline = (Date.now() - lastUpdate) > 20000;

        let status = "Stopped";
        let loc = t.defaultLocation; 
        let bat = 0;
        let sig = "Offline";

        if (live) {
           status = isOffline ? "Signal Lost" : (live.status || "Moving");
           if (live.location) {
             loc = `${live.location.lat.toFixed(4)}, ${live.location.lng.toFixed(4)}`;
           }
           bat = isOffline ? 0 : 85; 
           sig = isOffline ? "Offline" : "Strong";
        }
        
        return { ...t, status, location: loc, battery: bat, signal: sig };
      });

      // B. Handle HERO TRUCK (GJ-01-LIVE)
      const heroLive = liveData["GJ-01-LIVE"];
      
      const heroLastUpdate = heroLive && heroLive.last_updated ? Number(heroLive.last_updated) : 0;
      const isHeroOffline = (Date.now() - heroLastUpdate) > 20000;

      const heroTruck = {
        id: "GJ-01-LIVE",
        driver: "Rohit Sharma", 
        driverId: "DRV-999",
        phone: "+916204773940", 
        img: "https://randomuser.me/api/portraits/men/75.jpg",
        route: "Lavad → Gandhinagar",
        
        status: isHeroOffline ? "Signal Lost" : (heroLive?.status || "Active"),
        location: heroLive && heroLive.location ? `${heroLive.location.lat.toFixed(4)}, ${heroLive.location.lng.toFixed(4)}` : "23.0760, 72.8460",
        battery: isHeroOffline ? 0 : 92,
        signal: isHeroOffline ? "Offline" : "Strong"
      };

      setFleetData([heroTruck, ...mergedStatic]);
    });

    return () => unsubscribe();
  }, [currentTime]); // Trigger re-calc every 2 seconds

  // Timer to update "Offline" status in real-time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = (name, number) => {
    const cleanNumber = number.replace(/\s/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const filteredTrucks = fleetData.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#1b5e20' }}>Live Fleet Status</h1>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Manage drivers and vehicle health.</p>
            </div>
            <div style={{ position: 'relative' }}>
                <Search size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '12px 12px 12px 45px', borderRadius: '10px', border: '1px solid #ddd', width: '280px', outline: 'none', fontSize: '14px' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px' }}>
            {filteredTrucks.map(truck => (
                <div key={truck.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: truck.status === 'Signal Lost' ? '4px solid #757575' : truck.status === 'At Risk' ? '4px solid #d32f2f' : '4px solid #2e7d32' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}><Truck size={20} color="#004d40" />{truck.id}</div>
                        <span style={{ 
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', 
                            background: truck.status === 'Signal Lost' ? '#eee' : truck.status === 'At Risk' ? '#ffebee' : '#e8f5e9', 
                            color: truck.status === 'Signal Lost' ? '#555' : truck.status === 'At Risk' ? '#d32f2f' : '#2e7d32' 
                        }}>
                            {truck.status}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <img src={truck.img} alt="Driver" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{truck.driver}</div>
                            <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> ID: {truck.driverId}</div>
                        </div>
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '4px' }}>
                            <span style={{ color: '#666', display: 'flex', gap: '6px' }}><Map size={16}/> Route</span>
                            <span style={{ fontWeight: 'bold', color: '#1b5e20' }}>{truck.route}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', display: 'flex', gap: '6px' }}><MapPin size={16}/> GPS</span>
                            <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{truck.location}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666', display: 'flex', gap: '6px' }}><Battery size={16}/> Battery</span><span style={{ fontWeight: 'bold', color: truck.battery < 20 ? 'red' : 'green' }}>{truck.battery}%</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666', display: 'flex', gap: '6px' }}><Signal size={16}/> Signal</span><span style={{ fontWeight: 'bold', color: truck.signal === 'Offline' ? 'red' : 'green' }}>{truck.signal}</span></div>
                    </div>

                    <button onClick={() => handleCall(truck.driver, truck.phone)} style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'transparent', border: '1px solid #004d40', color: '#004d40', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Phone size={18} /> Call Driver
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Fleet;