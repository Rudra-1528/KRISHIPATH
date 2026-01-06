import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase'; 
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'; 
import RoutingMachine from '../RoutingMachine'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { translations } from '../translations'; 

// --- ICONS CONFIGURATION ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ 
    iconRetinaUrl: markerIcon2x, 
    iconUrl: markerIcon, 
    shadowUrl: markerShadow 
});

const truckIcon = new L.Icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png', 
    iconSize: [35, 35], 
    iconAnchor: [17, 17], 
    popupAnchor: [0, -20] 
});

const warehouseIcon = new L.Icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', 
    iconSize: [35, 35], 
    iconAnchor: [17, 35], 
    popupAnchor: [0, -30] 
});

const WAREHOUSE_LOCATION = [23.215, 72.636]; 

const Dashboard = () => {
  const { lang, isMobile } = useOutletContext(); 
  const t = translations.dashboard[lang] || translations.dashboard['en'];

  // --- STATIC FLEET ---
  const staticFleet = [
    { 
      id: "VAC13143", 
      startCity: "Mumbai", 
      endCity: "Nashik", 
      location: { lat: 19.2183, lng: 72.9781 }, 
      destCoords: [19.9975, 73.7898] 
    },
    { 
      id: "MH-12-9988", 
      startCity: "Pune", 
      endCity: "Mumbai", 
      location: { lat: 18.75, lng: 73.4 }, 
      destCoords: [19.0760, 72.8777] 
    },
    { 
      id: "GJ-05-1122", 
      startCity: "Surat", 
      endCity: "Vadodara", 
      location: { lat: 21.70, lng: 72.99 }, 
      destCoords: [22.3072, 73.1812] 
    },
    { 
      id: "MH-04-5544", 
      startCity: "Thane", 
      endCity: "Pune", 
      location: { lat: 19.033, lng: 73.029 }, 
      destCoords: [18.5204, 73.8567] 
    }
  ];

  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
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
      setLastHeartbeat(Date.now());
      setIsOnline(true);

      const liveData = snapshot.docs.reduce((acc, doc) => {
        acc[doc.data().truck_id] = doc.data();
        return acc;
      }, {});

      const mergedList = staticFleet.map(t => {
        const live = liveData[t.id];
        return {
          ...t,
          status: live ? (live.status || "Moving") : "Stopped",
          location: live && live.location ? live.location : t.location,
          sensors: live && live.sensors ? live.sensors : { temp: 24, humidity: 50 },
          shock: live ? live.shock : 0.05,
          rotation: live ? live.rotation : 0,
          destCoords: t.destCoords 
        };
      });

      const heroLive = liveData["GJ-01-LIVE"];
      const heroTruck = {
        id: "GJ-01-LIVE",
        startCity: "Lavad",
        endCity: "Gandhinagar",
        status: heroLive ? heroLive.status : "Signal Lost",
        location: heroLive && heroLive.location ? heroLive.location : { lat: 23.076, lng: 72.846 }, 
        sensors: heroLive && heroLive.sensors ? heroLive.sensors : { temp: 0, humidity: 0 },
        shock: heroLive ? heroLive.shock : 0,
        rotation: heroLive ? heroLive.rotation : 0,
        destCoords: WAREHOUSE_LOCATION 
      };

      const finalTruckList = [heroTruck, ...mergedList];
      setTrucks(finalTruckList);

      if (!selectedTruck) setSelectedTruck(heroTruck);
      
      if (selectedTruck && selectedTruck.id === "GJ-01-LIVE") {
        setSelectedTruck(prev => ({ ...prev, ...heroTruck }));
      }
    });

    const interval = setInterval(() => {
        if (Date.now() - lastHeartbeat > 15000) setIsOnline(false);
    }, 2000);

    return () => { unsubscribe(); clearInterval(interval); };
  }, [lastHeartbeat, selectedTruck?.id]); 

  const currentHealth = selectedTruck ? (100 - (selectedTruck.status === 'At Risk' ? 40 : selectedTruck.status === 'Signal Lost' ? 100 : 0)) : 100;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '20px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: 'var(--primary-green)', fontWeight: 'bold' }}>{t.header}</h1>
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                background: isOnline ? '#e8f5e9' : '#ffebee', 
                padding: '6px 12px', borderRadius: '20px', 
                border: isOnline ? '1px solid #c8e6c9' : '1px solid #ffcdd2',
            }}>
                <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: isOnline ? '#2e7d32' : '#d32f2f',
                    boxShadow: isOnline ? '0 0 8px #2e7d32' : 'none',
                }}></div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isOnline ? '#2e7d32' : '#d32f2f' }}>
                    {isOnline ? t.online : t.offline}
                </span>
            </div>
        </div>

        {/* TOP SECTION (MAP + HEALTH) */}
        <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            gap: '30px', 
            minHeight: isMobile ? 'auto' : '520px' 
        }}>
            
            {/* MAP CONTAINER */}
            <div style={{ 
                flex: 2, 
                height: isMobile ? '400px' : '100%', 
                minHeight: '400px', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                border: '1px solid white', 
                position: 'relative', 
                zIndex: 0 
            }}>
                <MapContainer 
                    center={[23.15, 72.74]} 
                    zoom={10} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {trucks.map(truck => (
                        <Marker 
                            key={truck.id} 
                            position={[truck.location.lat, truck.location.lng]} 
                            icon={truckIcon} 
                            eventHandlers={{ click: () => setSelectedTruck(truck) }}
                        >
                            <Popup><strong>{truck.id}</strong></Popup>
                        </Marker>
                    ))}
                    
                    {selectedTruck && selectedTruck.destCoords && (
                        <Marker position={selectedTruck.destCoords} icon={warehouseIcon}>
                            <Popup>Destination</Popup>
                        </Marker>
                    )}

                    {selectedTruck && selectedTruck.location && selectedTruck.destCoords && (
                        <>
                             <RoutingMachine 
                                start={[selectedTruck.location.lat, selectedTruck.location.lng]}
                                end={selectedTruck.destCoords}
                             /> 
                             <Polyline 
                                positions={[
                                    [selectedTruck.location.lat, selectedTruck.location.lng], 
                                    selectedTruck.destCoords
                                ]}
                                pathOptions={{ color: '#2e7d32', weight: 4, opacity: 0.6, dashArray: '10, 10' }} 
                             />
                        </>
                    )}

                </MapContainer>
            </div>

            {/* HEALTH CARD - UPDATED TO MATCH SCREENSHOT */}
            <div style={{ 
                flex: 1, 
                background: 'white', 
                borderRadius: '16px', 
                padding: '25px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                borderTop: '5px solid var(--primary-green)' 
            }}>
                {selectedTruck ? (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>{t.systemHealth}</h4>
                            <div style={{ fontSize: '64px', fontWeight: '800', color: currentHealth > 80 ? 'var(--primary-green)' : '#d32f2f', margin: '5px 0', lineHeight: '1' }}>{currentHealth}%</div>
                            <span style={{ fontSize: '13px', color: '#888' }}>{t.analysis}</span>
                        </div>

                        {/* Updated Sensor List */}
                        <div style={{ background: '#fcfcfc', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #eee' }}>
                            <Row label="Temp (SHT30)" value={`${selectedTruck.sensors.temp}°C`} />
                            <Row label="Shock (Accel)" value={`${selectedTruck.shock}G`} color="var(--primary-green)" bold />
                            <Row label="Rotation (Gyro)" value={`${selectedTruck.rotation}°/s`} />
                            <Row label="Humidity" value={`${selectedTruck.sensors.humidity || 50}%`} />
                        </div>

                        {/* Updated AI Monitor Box */}
                        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #1976d2' }}>
                            <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: '700', marginBottom: '4px' }}>AI Monitor (SVM):</div>
                            <div style={{ fontSize: '13px', color: '#0d47a1', fontWeight: '500' }}>
                                {selectedTruck.status === 'At Risk' ? "Anomaly Detected - Possible Tampering" : "Safe Transit - No Tampering"}
                            </div>
                        </div>

                        {/* SD Redundancy Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
                             <span style={{ fontWeight: '500' }}>SD Redundancy:</span>
                             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32' }}></span>
                             <span style={{ color: '#2e7d32', fontWeight: '700' }}>Active Sync</span>
                        </div>

                        {/* Accountability Report Button */}
                        <button style={{ 
                            width: '100%', padding: '15px', 
                            background: '#5d4037', color: 'white', 
                            border: 'none', borderRadius: '8px', 
                            fontWeight: 'bold', cursor: 'pointer',
                            fontSize: '14px', marginTop: '10px'
                        }}>
                            Generate Accountability Report
                        </button>
                    </>
                ) : (
                    <div style={{textAlign: 'center', color: '#999', padding: '40px 0'}}>Select a truck</div>
                )}
            </div>
        </div>

        {/* BOTTOM SECTION: TABLE */}
        <div style={{ 
            flex: 1, 
            minHeight: '400px', 
            background: 'white', 
            padding: '25px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
            overflowX: 'auto' 
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--primary-green)', fontSize: '18px', fontWeight: '700' }}>{t.liveShipments}</h3>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
                <tr>
                    <th style={thStyle}>{t.truckId}</th>
                    <th style={thStyle}>{t.route}</th>
                    <th style={thStyle}>{t.status}</th>
                    <th style={thStyle}>{t.temp}</th>
                </tr>
            </thead>
            <tbody>
              {trucks.map(truck => (
                <tr key={truck.id} onClick={() => setSelectedTruck(truck)} style={{ background: selectedTruck && selectedTruck.id === truck.id ? '#f1f8e9' : '#fff', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} className="hover-row">
                  <td style={tdStyleFirst}><span style={{fontWeight: '700', color: '#2d5a27'}}>{truck.id}</span></td>
                  <td style={tdStyle}>{translateCity(truck.startCity)} → {translateCity(truck.endCity)}</td>
                  <td style={tdStyle}>{truck.status}</td>
                  <td style={tdStyleLast}>{truck.sensors.temp}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <style>{`
          .hover-row:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
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

const thStyle = { padding: '12px 20px', textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 20px', color: '#444', fontSize: '14px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' };
const tdStyleFirst = { ...tdStyle, borderLeft: '1px solid #f0f0f0', borderRadius: '10px 0 0 10px' };
const tdStyleLast = { ...tdStyle, borderRight: '1px solid #f0f0f0', borderRadius: '0 10px 10px 0', fontWeight: 'bold' };

export default Dashboard;