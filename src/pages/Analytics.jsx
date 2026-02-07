import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Package, AlertOctagon, Clock, FileText } from 'lucide-react'; // Added FileText
import { translations } from '../translations';
import { jsPDF } from "jspdf"; // Added jsPDF

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { lang, isMobile } = useOutletContext(); // Get Mobile State
  const t = translations.analytics[lang] || translations.analytics['en'];

  // --- CHART DATA (Labels would also need translation in real app, keeping English for numbers/months) ---
  const tempOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: t.tempTrend } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } } };
  const tempData = { labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'], datasets: [{ label: 'Avg Temp (°C)', data: [24, 23, 25, 22, 18, 19], borderColor: '#2d5a27', backgroundColor: 'rgba(45, 90, 39, 0.5)', tension: 0.4 }, { label: 'Limit', data: [28, 28, 28, 28, 28, 28], borderColor: '#d32f2f', borderDash: [5, 5], pointRadius: 0 }] };
  const shipmentOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: t.total } } };
  const shipmentData = { labels: ['Mum', 'Pun', 'Nas', 'Sur', 'Nag', 'Goa'], datasets: [{ label: 'Shipments', data: [120, 95, 80, 110, 60, 45], backgroundColor: '#2d5a27', borderRadius: 5 }] };
  const statusData = { labels: ['On Time', 'Delayed', 'At Risk', 'Cancelled'], datasets: [{ data: [65, 15, 12, 8], backgroundColor: ['#2d5a27', '#fbc02d', '#d32f2f', '#9e9e9e'], borderWidth: 0 }] };

  // --- NEW: PDF EXPORT FUNCTION ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(45, 90, 39); // Green Color
    doc.text("KRISHIPATH - Analytics Report", 20, 20);
    
    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // KPI Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Key Performance Summary:", 20, 45);
    
    doc.setFontSize(12);
    doc.text(`- Total Shipments: 1,245 (+12%)`, 20, 55);
    doc.text(`- Avg Delivery Time: 4.2 Days (-0.5 days)`, 20, 65);
    doc.text(`- Risk Factor: 2.1% (Safe)`, 20, 75);
    doc.text(`- Revenue Protected: Rs 4.5L`, 20, 85);

    // Route Efficiency Section
    doc.setFontSize(16);
    doc.text("Route Efficiency Data:", 20, 105);
    
    const routes = [
        ["Mumbai - Pune", "98%"],
        ["Nashik - Surat", "92%"],
        ["Nagpur - Mumbai", "87%"],
        ["Goa - Belgaum", "96%"]
    ];
    
    let y = 115;
    doc.setFontSize(12);
    routes.forEach(row => {
        doc.text(`${row[0]} ........................ ${row[1]}`, 20, y);
        y += 10;
    });

    // Save
    doc.save("Analytics_Report.pdf");
  };

  return (
    <div style={{ paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '25px', height: '100%' }}>
        
        {/* HEADER WITH PDF BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: 'var(--primary-green)' }}>{t.title}</h1>
            <button onClick={handleExportPDF} style={{ 
                background: '#d32f2f', color: 'white', border: 'none', 
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' 
            }}>
                <FileText size={16}/> Export PDF
            </button>
        </div>

        {/* --- KPI CARDS (Stack on Mobile) --- */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
            <Card title={t.total} value="1,245" icon={<Package color="#2d5a27"/>} trend="+12%" />
            <Card title={t.avgTime} value="4.2 Days" icon={<Clock color="#f57c00"/>} trend="-0.5 days" />
            <Card title={t.risk} value="2.1%" icon={<AlertOctagon color="#d32f2f"/>} trend="Safe" />
            <Card title={t.rev} value="₹ 4.5L" icon={<TrendingUp color="#2d5a27"/>} trend="Protected" />
        </div>

        {/* --- CHARTS ROW 1 --- */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '25px', height: isMobile ? 'auto' : '300px' }}>
            <div style={{...chartCardStyle, height: '300px'}}>
                <div style={{ position: 'relative', height: '100%', width: '100%' }}><Line options={tempOptions} data={tempData} /></div>
            </div>
            <div style={{...chartCardStyle, height: '300px'}}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#555', textAlign: 'center' }}>{t.status}</h3>
                <div style={{ position: 'relative', height: '180px', width: '100%', display: 'flex', justifyContent: 'center' }}><Doughnut data={statusData} /></div>
            </div>
        </div>

        {/* --- CHARTS ROW 2 --- */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '25px', height: isMobile ? 'auto' : '300px' }}>
            <div style={{...chartCardStyle, height: '300px'}}>
                <div style={{ position: 'relative', height: '100%', width: '100%' }}><Bar options={shipmentOptions} data={shipmentData} /></div>
            </div>
            <div style={{...chartCardStyle, overflowY: 'auto', height: '300px'}}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>{t.topRoutes}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                        <tr><th style={thStyle}>Route</th><th style={thStyle}>{t.efficiency}</th></tr>
                    </thead>
                    <tbody>
                        <tr style={trStyle}><td>Mumbai - Pune</td><td style={{color:'green', fontWeight:'bold'}}>98%</td></tr>
                        <tr style={trStyle}><td>Nashik - Surat</td><td style={{color:'#f9a825', fontWeight:'bold'}}>92%</td></tr>
                        <tr style={trStyle}><td>Nagpur - Mumbai</td><td style={{color:'red', fontWeight:'bold'}}>87%</td></tr>
                        <tr style={trStyle}><td>Goa - Belgaum</td><td style={{color:'green', fontWeight:'bold'}}>96%</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

const Card = ({ title, value, icon, trend }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>{title}</span>{icon}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{value}</div>
        <span style={{ fontSize: '12px', color: '#888' }}>{trend}</span>
    </div>
);
const chartCardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
const thStyle = { padding: '12px', textAlign: 'left', color: '#666' };
const trStyle = { borderBottom: '1px solid #f0f0f0' };

export default Analytics;