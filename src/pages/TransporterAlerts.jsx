import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Thermometer, Download, Droplets, WifiOff, Zap } from 'lucide-react';
import { translations } from '../translations';
import { useNotifications } from '../NotificationContext';

const TransporterAlerts = () => {
  const { lang, isMobile } = useOutletContext();
  const t = translations.alerts?.[lang] || translations.alerts?.['en'] || {};
  const { notifications } = useNotifications();

  const dummyAlerts = useMemo(() => ([
    { id: 'dummy-1', truck: 'VAC13143', time: '2:15 PM Today', type: 'Connection', val: 'Signal lost', loc: 'Nashik Highway', status: 'Resolved' },
    { id: 'dummy-2', truck: 'MH-04-99', time: '1:30 PM Today', type: 'Connection', val: 'Poor signal', loc: 'Bhiwandi Bypass', status: 'Warning' },
    { id: 'dummy-3', truck: 'GJ-05-1122', time: 'Yesterday', type: 'Connection', val: 'Signal restored', loc: 'Surat Border', status: 'Resolved' }
  ]), []);

  const liveAlerts = useMemo(() => {
    return notifications
      .filter((n) => n.category === 'fleet') // Only fleet/connection alerts
      .map((n) => ({
        id: `live-${n.id}`,
        truck: n.truck || 'GJ-01-LIVE',
        time: new Date(n.timestamp || Date.now()).toLocaleTimeString(),
        type: 'Connection',
        val: n.value || n.message || 'Signal issue',
        loc: 'Fleet telemetry',
        status: n.severity === 'critical' ? 'Critical' : 'Warning',
      }));
  }, [notifications]);

  const combinedAlerts = useMemo(() => [...liveAlerts, ...dummyAlerts], [liveAlerts, dummyAlerts]);
  const [filter, setFilter] = useState("All");

  const filteredAlerts = useMemo(
    () => combinedAlerts.filter((a) => filter === 'All' || a.status === filter),
    [combinedAlerts, filter]
  );

  const totalIncidents = combinedAlerts.length;
  const activeIncidents = combinedAlerts.filter((a) => a.status !== 'Resolved').length;

  const getIcon = (type) => {
    switch(type) {
      case 'Temperature': return <Thermometer size={18} color="#d32f2f" />;
      case 'Humidity': return <Droplets size={18} color="#f57c00" />;
      case 'Shock': return <Zap size={18} color="#d32f2f" />;
      case 'Connection': return <WifiOff size={18} color="#d32f2f" />;
      default: return <AlertTriangle size={18} color="#f57c00" />;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: isMobile ? '15px' : '25px' }}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle /> Critical Alerts (Gaadi Maalik)
                </h1>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Fleet-wide sensor & connection issues</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--earth-brown)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Download size={18} /> Export
            </button>
        </div>

        {/* --- SUMMARY CARDS --- */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
            <div style={summaryCardStyle}><span style={{color: '#d32f2f', fontWeight: 'bold'}}>Total Incidents</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>{totalIncidents}</span></div>
            <div style={summaryCardStyle}><span style={{color: '#f57c00', fontWeight: 'bold'}}>Active Issues</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>{activeIncidents}</span></div>
            <div style={summaryCardStyle}><span style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>Est. Loss</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>₹ 18,200</span></div>
        </div>

        {/* --- ALERTS TABLE --- */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1, overflowX: 'auto' }}>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                {['All', 'Critical', 'Resolved'].map(f => (
                    <span key={f} onClick={() => setFilter(f)} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: filter === f ? 'var(--primary-green)' : '#888', borderBottom: filter === f ? '3px solid var(--primary-green)' : 'none', paddingBottom: '5px' }}>{f}</span>
                ))}
            </div>

            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9f9f9' }}>
                    <tr><th style={thStyle}>Type</th><th style={thStyle}>Truck ID</th><th style={thStyle}>Value</th><th style={thStyle}>Location</th><th style={thStyle}>Time</th><th style={thStyle}>Status</th></tr>
                </thead>
                <tbody>
                    {filteredAlerts.map(alert => (
                        <tr key={alert.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#333' }}>
                                {getIcon(alert.type)} {alert.type}
                            </td>
                            <td style={tdStyle}>{alert.truck}</td>
                            <td style={{...tdStyle, color: '#d32f2f', fontWeight: 'bold'}}>{alert.val}</td>
                            <td style={tdStyle}>{alert.loc}</td>
                            <td style={tdStyle}>{alert.time}</td>
                            <td style={tdStyle}>
                                <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', background: alert.status === 'Critical' ? '#ffebee' : '#e8f5e9', color: alert.status === 'Critical' ? '#d32f2f' : 'var(--primary-green)' }}>{alert.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const summaryCardStyle = { flex: 1, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#666', fontSize: '13px' };
const tdStyle = { padding: '15px', color: '#444', fontSize: '14px' };

export default TransporterAlerts;
