import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import RoutingMachine from '../RoutingMachine'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { translations } from '../translations';

// ... ICONS (Paste same marker code as before) ...
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const LOCATIONS = { "Mumbai Port": [18.9438, 72.8359], "Pune DC": [18.5204, 73.8567], "Nashik Cold Storage": [19.9975, 73.7898], "Surat Hub": [21.1702, 72.8311] };

const RouteAnalysis = () => {
  const { lang, isMobile } = useOutletContext();
  const t = translations.routes[lang] || translations.routes['en'];

  const [start, setStart] = useState("Mumbai Port");
  const [end, setEnd] = useState("Pune DC");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
        const distance = Math.floor(Math.random() * 150) + 50;
        const risk = Math.floor(Math.random() * 30) + 10;
        setAnalysis({ distance: `${distance} km`, time: `${Math.floor(distance / 40)}h ${distance % 40}m`, riskScore: risk, fuelCost: `₹${distance * 18}`, recommendation: risk > 25 ? t.poor : t.safe });
        setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div style={{ width: isMobile ? '100%' : '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: 'var(--primary-green)' }}>{t.title}</h2>
                <p style={{ color: '#666', fontSize: '13px' }}>{t.sub}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <div><label style={labelStyle}>{t.start}</label><select style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)}>{Object.keys(LOCATIONS).map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
                    <div><label style={labelStyle}>{t.dest}</label><select style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)}>{Object.keys(LOCATIONS).map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
                    <button onClick={handleAnalyze} style={{ padding: '15px', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{loading ? t.analyzing : t.analyzeBtn}</button>
                </div>
            </div>

            {analysis && (
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: analysis.riskScore > 25 ? '5px solid #d32f2f' : '5px solid #2d5a27' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>{t.report}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                        <div><div style={labelStyle}>{t.time}</div><div style={valStyle}>{analysis.time}</div></div>
                        <div><div style={labelStyle}>{t.dist}</div><div style={valStyle}>{analysis.distance}</div></div>
                        <div><div style={labelStyle}>{t.fuel}</div><div style={valStyle}>{analysis.fuelCost}</div></div>
                        <div><div style={labelStyle}>{t.risk}</div><div style={{...valStyle, color: analysis.riskScore > 25 ? 'red' : 'green'}}>{analysis.riskScore}%</div></div>
                    </div>
                    <div style={{ marginTop: '20px', padding: '10px', background: analysis.riskScore > 25 ? '#ffebee' : '#e8f5e9', borderRadius: '8px', fontSize: '13px', color: analysis.riskScore > 25 ? '#c62828' : '#2d5a27', fontWeight: 'bold', textAlign: 'center' }}>
                        {analysis.recommendation}
                    </div>
                </div>
            )}
        </div>

        {/* --- RIGHT PANEL: MAP --- */}
        <div style={{ flex: 1, borderRadius: '15px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: isMobile ? '350px' : 'auto' }}>
             <MapContainer center={[19.0760, 72.8777]} zoom={9} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={LOCATIONS[start]}><Popup>Start</Popup></Marker>
                <Marker position={LOCATIONS[end]}><Popup>End</Popup></Marker>
                <RoutingMachine start={LOCATIONS[start]} end={LOCATIONS[end]} />
            </MapContainer>
        </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' };
const labelStyle = { fontSize: '11px', color: '#888', fontWeight: 'bold' };
const valStyle = { fontSize: '16px', fontWeight: 'bold', color: '#333' };

export default RouteAnalysis;