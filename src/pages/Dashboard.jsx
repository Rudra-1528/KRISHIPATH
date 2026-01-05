import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase'; 
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import RoutingMachine from '../RoutingMachine'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { translations } from '../translations'; 

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });
const truckIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png', iconSize: [35, 35], iconAnchor: [17, 17], popupAnchor: [0, -20] });
const warehouseIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -30] });

const WAREHOUSE_LOCATION = [19.1136, 72.9100]; 

const Dashboard = () => {
  const { lang, isMobile } = useOutletContext();
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  
  // --- CONNECTION STATUS STATE ---
  const [lastHeartbeat, setLastHeartbeat] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  const translateCity = (city) => {
    if (translations.cities[city] && translations.cities[city][lang]) {
        return translations.cities[city][lang];
    }
    return city; 
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shipments"), (snapshot) => {
      // 1. DATA RECEIVED -> UPDATE TIMESTAMP
      setLastHeartbeat(Date.now());
      setIsOnline(true);

      const truckData = snapshot.docs.map(doc => {
          let start = "Mumbai"; let end = "Pune";
          if (doc.data().truck_id === "MH-12-9988") { start = "Nashik"; end = "Mumbai"; }
          if (doc.data().truck_id === "GJ-05-1122") { start = "Surat"; end = "Vadodara"; }
          if (doc.data().truck_id === "MH-04-5544") { start = "Pune"; end = "Hyderabad"; }

          return { 
            id: doc.id, ...doc.data(),
            startCity: start, endCity: end,
            shock: (0.1 + Math.random() * 0.1).toFixed(2),
            rotation: 0
          };
      });
      setTrucks(truckData);
      if (!selectedTruck && truckData.length > 0) setSelectedTruck(truckData[0]);
    });

    // 2. CHECK FOR DISCONNECTION EVERY 2 SECONDS
    const interval = setInterval(() => {
        if (Date.now() - lastHeartbeat > 15000) { // 15 Seconds timeout
            setIsOnline(false);
        }
    }, 2000);

    return () => { unsubscribe(); clearInterval(interval); };
  }, [lastHeartbeat]); // Depend on lastHeartbeat to keep interval fresh

  const t = translations.dashboard[lang] || translations.dashboard['en'];
  const currentHealth = selectedTruck ? (100 - (selectedTruck.status === 'At Risk' ? 25 : 0)) : 100;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '20px' }}>
        
        {/* --- HEADER WITH STATUS LED --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: 'var(--primary-green)', fontWeight: 'bold' }}>{t.header}</h1>
            
            {/* STATUS INDICATOR */}
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                background: isOnline ? '#e8f5e9' : '#ffebee', 
                padding: '6px 12px', borderRadius: '20px', 
                border: isOnline ? '1px solid #c8e6c9' : '1px solid #ffcdd2',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: isOnline ? '#2e7d32' : '#d32f2f',
                    boxShadow: isOnline ? '0 0 8px #2e7d32' : 'none',
                    animation: isOnline ? 'pulse 2s infinite' : 'none'
                }}></div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isOnline ? '#2e7d32' : '#d32f2f' }}>
                    {isOnline ? t.online : t.offline}
                </span>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px', height: isMobile ? 'auto' : '520px' }}>
            {/* MAP */}
            <div style={{ flex: 2, height: isMobile ? '350px' : '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid white', position: 'relative' }}>
                <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {trucks.map(truck => (
                        <Marker key={truck.id} position={[truck.location.lat, truck.location.lng]} icon={truckIcon} eventHandlers={{ click: () => setSelectedTruck(truck) }}>
                            <Popup><strong>{truck.truck_id}</strong></Popup>
                        </Marker>
                    ))}
                    <Marker position={WAREHOUSE_LOCATION} icon={warehouseIcon}></Marker>
                    {trucks.map(truck => (<RoutingMachine key={truck.id} start={[truck.location.lat, truck.location.lng]} end={WAREHOUSE_LOCATION} />))}
                </MapContainer>
            </div>

            {/* HEALTH CARD */}
            <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '5px solid var(--primary-green)' }}>
                {selectedTruck ? (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{t.systemHealth}</h4>
                            <div style={{ fontSize: '64px', fontWeight: '800', color: currentHealth > 80 ? 'var(--primary-green)' : '#d32f2f', margin: '5px 0', lineHeight: '1' }}>{currentHealth}%</div>
                            <span style={{ fontSize: '13px', color: '#888' }}>{t.analysis}</span>
                        </div>

                        <div style={{ background: '#fcfcfc', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #eee' }}>
                            <Row label={t.temp} value={`${selectedTruck.sensors.temp}°C`} />
                            <Row label={t.shock} value={`${selectedTruck.shock}G`} color="var(--primary-green)" bold />
                            <Row label={t.rot} value={`${selectedTruck.rotation}°/s`} />
                            <Row label={t.hum} value={`${selectedTruck.sensors.humidity}%`} />
                        </div>
                        
                        <div style={{ background: selectedTruck.status === 'At Risk' ? '#ffebee' : '#e3f2fd', padding: '15px', borderRadius: '12px', borderLeft: selectedTruck.status === 'At Risk' ? '4px solid #d32f2f' : '4px solid #1976d2' }}>
                            <div style={{ fontSize: '13px', color: selectedTruck.status === 'At Risk' ? '#b71c1c' : '#0d47a1', fontWeight: '600' }}>
                                {selectedTruck.status === 'At Risk' ? t.aiRisk : t.aiSafe}
                            </div>
                        </div>

                        <button style={{ width: '100%', padding: '15px', background: 'var(--earth-brown)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>{t.generateReport}</button>
                    </>
                ) : (
                    <div style={{textAlign: 'center', color: '#999', padding: '40px 0'}}>Select a truck</div>
                )}
            </div>
        </div>

        {/* TABLE */}
        <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--primary-green)', fontSize: '18px', fontWeight: '700', whiteSpace: 'nowrap' }}>{t.liveShipments}</h3>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{borderBottom: '2px solid #eee'}}>
                    <th style={thStyle}>{t.truckId}</th><th style={thStyle}>{t.route}</th><th style={thStyle}>{t.status}</th>
                </tr>
            </thead>
            <tbody>
              {trucks.map(truck => (
                <tr key={truck.id} onClick={() => setSelectedTruck(truck)} style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: selectedTruck && selectedTruck.id === truck.id ? 'var(--soft-cream)' : 'transparent' }}>
                  <td style={{ padding: '16px', fontWeight: '700', color: '#333' }}>{truck.truck_id}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{translateCity(truck.startCity)} → {translateCity(truck.endCity)}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: truck.status === 'At Risk' ? '#c62828' : 'var(--primary-green)', background: truck.status === 'At Risk' ? '#ffebee' : '#e8f5e9' }}>
                        ● {truck.status === 'At Risk' ? t.atRisk : t.good}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* CSS FOR PULSE ANIMATION */}
        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(46, 125, 50, 0); }
            100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
          }
        `}</style>
    </div>
  );
};

const Row = ({ label, value, color = '#333', bold = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>{label}</span>
        <span style={{ fontWeight: bold ? '700' : '500', color: color, fontSize: '14px' }}>{value}</span>
    </div>
);
const thStyle = { padding: '15px', textAlign: 'left', color: '#999', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' };

export default Dashboard;