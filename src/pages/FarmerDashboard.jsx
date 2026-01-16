import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase'; 
import { AlertTriangle, CheckCircle, Thermometer, Droplets, Leaf, WifiOff } from 'lucide-react';

// --- 1. STATIC DUMMY SHIPMENTS ---
const staticShipments = [
  { 
    id: "MH-12-9988", 
    truck_id: "MH-12-9988",
    route: "Pune → Mumbai", 
    crop: "Alphonso Mangoes",
    status: "Active",
    sensors: { temp: 24, humidity: 60 },
    shock: 0.5,
    last_updated: Date.now() // Always online
  },
  { 
    id: "GJ-05-1122", 
    truck_id: "GJ-05-1122",
    route: "Surat → Vadodara", 
    crop: "Organic Bananas",
    status: "Active",
    sensors: { temp: 22, humidity: 55 },
    shock: 0.1,
    last_updated: Date.now() 
  }
];

const FarmerDashboard = () => {
  const [currentTime, setCurrentTime] = useState(Date.now()); 
  const [liveDataMap, setLiveDataMap] = useState({});

  // --- 2. DATA LISTENER (Connects Once, Never Re-connects) ---
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shipments"), (snapshot) => {
       const newMap = {};
       snapshot.docs.forEach(doc => {
          newMap[doc.data().truck_id] = doc.data();
       });
       setLiveDataMap(newMap);
    });
    return () => unsubscribe();
  }, []);

  // --- 3. FAST TIMER (500ms) for Instant Offline Detection ---
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 500); 
    return () => clearInterval(interval);
  }, []);

  // --- 4. CALCULATE STATUS (useMemo) ---
  const trucks = useMemo(() => {
      // A. Process HERO TRUCK (GJ-01-LIVE)
      const heroLive = liveDataMap["GJ-01-LIVE"];
      const lastUpdate = heroLive && heroLive.last_updated ? Number(heroLive.last_updated) : 0;
      
      // 20 Second Timeout Logic
      const isOffline = (currentTime - lastUpdate) > 20000;

      const heroTruck = {
          id: "GJ-01-LIVE",
          truck_id: "GJ-01-LIVE",
          route: "Lavad → Gandhinagar",
          crop: "Fresh Tomatoes 🍅",
          
          // Force Offline Values if Timed Out
          status: isOffline ? "Signal Lost" : (heroLive?.status || "Active"),
          sensors: isOffline ? { temp: 0, humidity: 0 } : (heroLive?.sensors || { temp: 0, humidity: 0 }),
          shock: isOffline ? 0 : (heroLive?.shock || 0),
          
          isOffline: isOffline // Flag for styling
      };

      // B. Combine with Static Trucks
      const processedStatic = staticShipments.map(t => ({...t, isOffline: false}));
      
      return [heroTruck, ...processedStatic];

  }, [liveDataMap, currentTime]);

  return (
    <div style={{ padding: '20px', background: '#f5f7f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1b5e20', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>🌾 Kisan Cargo View</h1>
      <p style={{ color: '#666' }}>Real-time quality monitoring for your produce.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {trucks.map(truck => {
           // Logic for UI Colors based on calculated state
           const isRisk = truck.status === 'At Risk';
           const isOffline = truck.isOffline;
           
           let healthScore = 100;
           let healthColor = '#2e7d32'; // Green
           let statusText = "Fresh / Safe";

           if (isRisk) {
               healthScore = 65;
               healthColor = '#d32f2f'; // Red
               statusText = "Spoilage Risk!";
           }
           if (isOffline) {
               healthScore = 0;
               healthColor = '#757575'; // Grey
               statusText = "Connection Lost";
           }

           return (
            <div key={truck.id} style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `6px solid ${healthColor}` }}>
               
               {/* Header */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                   <h2 style={{ color: '#333', margin: 0, fontSize: '22px' }}>{truck.truck_id}</h2>
                   {isOffline ? <WifiOff size={20} color="grey"/> : <div style={{width:'10px', height:'10px', background:'green', borderRadius:'50%', boxShadow:'0 0 5px green'}}></div>}
               </div>
               
               <p style={{ color: '#666', fontSize: '14px', margin: '0 0 5px 0' }}>{truck.route}</p>
               
               {/* CROP NAME */}
               <div style={{ background: '#e8f5e9', color: '#1b5e20', padding: '5px 10px', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px' }}>
                  <Leaf size={14}/> {truck.crop}
               </div>

               <div style={{ marginBottom: '5px', color: '#666', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>Cargo Health Index</div>
               
               {/* BIG PERCENTAGE */}
               <div style={{ fontSize: '80px', fontWeight: '800', color: healthColor, lineHeight: '1', marginBottom: '5px' }}>
                  {healthScore}%
               </div>
               <div style={{ color: healthColor, fontWeight: 'bold', fontSize: '16px', marginBottom: '25px' }}>
                   {statusText}
               </div>

               {/* Sensor Table */}
               <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '12px', textAlign: 'left', opacity: isOffline ? 0.5 : 1 }}>
                  <Row label="Temp (SHT30)" value={`${truck.sensors?.temp || 0}°C`} />
                  <Row label="Shock (Accel)" value={`${truck.shock || 0}G`} color={truck.shock > 2 ? 'red' : 'green'} bold />
                  <Row label="Humidity" value={`${truck.sensors?.humidity || 0}%`} />
               </div>

               {/* AI Monitor Box */}
               <div style={{ marginTop: '15px', background: isOffline ? '#eee' : '#e3f2fd', padding: '12px', borderRadius: '10px', textAlign: 'left', borderLeft: isOffline ? '4px solid grey' : '4px solid #1976d2' }}>
                  <div style={{ color: isOffline ? '#666' : '#1565c0', fontWeight: 'bold', fontSize: '12px' }}>AI Monitor (SVM):</div>
                  <div style={{ color: isOffline ? '#666' : '#0d47a1', fontSize: '14px' }}>
                      {isOffline ? "Waiting for connection..." : (isRisk ? "⚠️ Risk Detected" : "✅ Safe Transit")}
                  </div>
               </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

const Row = ({ label, value, color = '#333', bold = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>{label}</span>
        <span style={{ fontWeight: bold ? '700' : '500', color: color, fontSize: '14px' }}>{value}</span>
    </div>
);

export default FarmerDashboard;