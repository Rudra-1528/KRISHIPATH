import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FileText, Navigation, Zap } from 'lucide-react';
import L from 'leaflet';
import RoutingMachine from '../RoutingMachine'; // Ensure you have this component

// --- ICONS ---
// 1. My Truck (Green/Active)
const myTruckIcon = new L.Icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png', 
    iconSize: [45, 45], 
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
});

// 2. Destination (Warehouse)
const warehouseIcon = new L.Icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', 
    iconSize: [40, 40], 
    iconAnchor: [20, 40], 
    popupAnchor: [0, -35] 
});

const DriverDashboard = () => {
    const startCoords = [23.076, 72.846];
    const endCoords = [23.215, 72.636];
  // Toggle for Analysis Card
  const [showAnalysis, setShowAnalysis] = useState(true);

  // PDF Opener (Dummy)
  const openPDF = () => {
    window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      
      {/* --- 1. TOP: MAP SECTION --- */}
      <div style={{ flex: 1.5, position: 'relative', minHeight: '60%' }}>
            {/* key forces the polyline to rerender if coords change in future */}
            <MapContainer 
                key={`driver-map-${startCoords[0]}-${startCoords[1]}-${endCoords[0]}-${endCoords[1]}`}
                center={startCoords}
                zoom={11}
                whenReady={(mapEvent) => mapEvent.target.fitBounds([startCoords, endCoords], { padding: [40, 40] })}
                style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* THE GREEN ROUTE LINE (Admin Style) */}
                <RoutingMachine start={startCoords} end={endCoords} />

            {/* MY TRUCK ONLY */}
            <Marker position={[23.076, 72.846]} icon={myTruckIcon}>
               <Popup><strong>YOU (GJ-01-LIVE)</strong><br/>Status: On Route</Popup>
            </Marker>

            {/* DESTINATION */}
            <Marker position={[23.215, 72.636]} icon={warehouseIcon}>
               <Popup>Gandhinagar Warehouse</Popup>
            </Marker>

         </MapContainer>
         
         {/* -- FLOAT 1: HEADER -- */}
         <div style={{ position: 'absolute', top: '20px', left: '15px', right: '15px', background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '50%' }}><Navigation color="#2e7d32" size={20} /></div>
                <div>
                   <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Trip</div>
                   <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1b5e20' }}>Lavad → Gandhinagar</div>
                </div>
            </div>
            <button onClick={() => setShowAnalysis(!showAnalysis)} style={{ background: '#333', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                {showAnalysis ? "Hide AI" : "Show AI"}
            </button>
         </div>

         {/* -- FLOAT 2: AI ROUTE ANALYSIS (Admin Style Panel) -- */}
         {showAnalysis && (
             <div style={{ position: 'absolute', top: '90px', left: '15px', width: '240px', background: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 999, backdropFilter: 'blur(5px)', borderLeft: '5px solid #2e7d32' }}>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                     <Zap size={16} color="#f9a825" fill="#f9a825" />
                     <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>AI Route Intelligence</span>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <Row label="Est. Time" value="45 Mins" color="#333" />
                     <Row label="Traffic" value="Low (Clear)" color="#2e7d32" bold />
                     <Row label="Fuel Efficiency" value="98% Optimal" color="#2e7d32" />
                     <Row label="Risk Score" value="SAFE" bg="#e8f5e9" color="#2e7d32" />
                 </div>
             </div>
         )}
      </div>

      {/* --- 2. BOTTOM: DIGITAL LOCKER --- */}
      <div style={{ flex: 1, padding: '20px', background: 'white', borderTop: '4px solid #2e7d32', overflowY: 'auto' }}>
         <h2 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1b5e20' }}>
            <FileText color="#2e7d32"/> Digital Locker (Tap to Open)
         </h2>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DocCard title="Driving License" status="Verified" onClick={openPDF} />
            <DocCard title="Vehicle RC Book" status="Verified" onClick={openPDF} />
            <DocCard title="Insurance Policy" status="Valid" color="orange" onClick={openPDF} />
            <DocCard title="E-Way Bill (Cargo)" status="Active" color="#2e7d32" onClick={openPDF} />
         </div>
      </div>
    </div>
  );
};

// Helper Components
const Row = ({ label, value, color, bg, bold }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
        <span style={{ color: '#666' }}>{label}:</span>
        <span style={{ 
            fontWeight: bold ? 'bold' : '500', 
            color: color, 
            background: bg || 'transparent', 
            padding: bg ? '2px 6px' : '0', 
            borderRadius: '4px' 
        }}>{value}</span>
    </div>
);

const DocCard = ({ title, status, color = "#2e7d32", onClick }) => (
  <div onClick={onClick} style={{ padding: '12px 15px', border: '1px solid #eee', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', cursor: 'pointer', transition: 'background 0.2s' }}>
     <span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>{title}</span>
     <span style={{ fontSize: '11px', fontWeight: 'bold', color: color, background: 'white', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${color}` }}>{status}</span>
  </div>
);

export default DriverDashboard;