import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Thermometer, Download, Droplets, WifiOff } from 'lucide-react';
import { translations } from '../translations';
import { useNotifications } from '../NotificationContext';

const Alerts = () => {
  const { lang, isMobile } = useOutletContext();
    const t = translations.alerts?.[lang] || translations.alerts?.['en'] || {};
    const dashAlert = (key) => translations.dashboard[lang]?.[key] || translations.dashboard['en']?.[key] || key;
    const { notifications } = useNotifications();

    const dummyAlerts = useMemo(() => ([
        { id: 'dummy-1', truck: 'VAC13143', time: '10:45 AM Today', type: t.tempLabel || 'Temperature', val: '12°C', loc: 'Nashik Highway', status: t.resolved || 'Resolved' },
        { id: 'dummy-2', truck: 'MH-04-99', time: '09:30 AM Today', type: t.shockLabel || 'Shock', val: '2.5G', loc: 'Bhiwandi Bypass', status: t.critical || 'Critical' },
        { id: 'dummy-3', truck: 'GJ-01-22', time: 'Yesterday', type: t.humidityLabel || 'Humidity', val: '88%', loc: 'Surat Border', status: t.resolved || 'Resolved' }
    ]), []);

    const liveAlerts = useMemo(() => {
        const typeLabel = {
            temperature: 'Temperature',
            humidity: 'Humidity',
            shock: 'Shock',
            connection: 'Connection',
        };

        return notifications.map((n) => ({
            id: `live-${n.id}`,
            truck: n.truck || 'GJ-01-LIVE',
            time: new Date(n.timestamp || Date.now()).toLocaleTimeString(),
            type: typeLabel[n.type] || 'Alert',
            val: n.value || n.message || '—',
            loc: 'Live sensor feed',
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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle /> {t.title}
                </h1>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>{t.sub}</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--earth-brown)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Download size={18} /> {t.export}
            </button>
        </div>

        {/* --- SUMMARY CARDS --- */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
            <div style={summaryCardStyle}><span style={{color: '#d32f2f', fontWeight: 'bold'}}>{t.incidents}</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>{totalIncidents}</span></div>
            <div style={summaryCardStyle}><span style={{color: '#f57c00', fontWeight: 'bold'}}>{t.active}</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>{activeIncidents}</span></div>
            <div style={summaryCardStyle}><span style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>{t.loss}</span><span style={{fontSize: '28px', fontWeight: 'bold'}}>₹ 12,500</span></div>
        </div>

        {/* --- ALERTS TABLE --- */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1, overflowX: 'auto' }}>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                {[
                  { key: 'All', label: t.allBtn || 'All' },
                  { key: 'Critical', label: t.criticalBtn || 'Critical' },
                  { key: 'Resolved', label: t.resolvedBtn || 'Resolved' }
                ].map(f => (
                    <span key={f.key} onClick={() => setFilter(f.key)} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: filter === f.key ? 'var(--primary-green)' : '#888', borderBottom: filter === f.key ? '3px solid var(--primary-green)' : 'none', paddingBottom: '5px' }}>{f.label}</span>
                ))}
            </div>

            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9f9f9' }}>
                    <tr><th style={thStyle}>{t.tableType || 'Type'}</th><th style={thStyle}>{t.tableTruck || 'Truck ID'}</th><th style={thStyle}>{t.tableValue || 'Value'}</th><th style={thStyle}>{t.tableLocation || 'Location'}</th><th style={thStyle}>{t.tableTime || 'Time'}</th><th style={thStyle}>{t.tableStatus || 'Status'}</th></tr>
                </thead>
                <tbody>
                    {filteredAlerts.map(alert => (
                        <tr key={alert.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#333' }}>
                                {alert.type === 'Temperature' && <Thermometer size={18} color="#d32f2f"/>}
                                {alert.type === 'Humidity' && <Droplets size={18} color="#f57c00"/>}
                                {alert.type === 'Connection' && <WifiOff size={18} color="#d32f2f"/>}
                                {alert.type === 'Shock' && <AlertTriangle size={18} color="#f57c00"/>}
                                {!['Temperature','Humidity','Connection','Shock'].includes(alert.type) && <AlertTriangle size={18} color="#f57c00"/>}
                                {alert.type}
                            </td>
                            <td style={tdStyle}>{alert.truck}</td>
                            <td style={{...tdStyle, color: '#d32f2f', fontWeight: 'bold'}}>{alert.val}</td>
                            <td style={tdStyle}>{alert.loc}</td>
                            <td style={tdStyle}>{alert.time}</td>
                            <td style={tdStyle}>
                                <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', background: alert.status === 'Critical' ? '#ffebee' : (alert.status === 'Resolved' ? '#e8f5e9' : '#fff8e1'), color: alert.status === 'Critical' ? '#d32f2f' : (alert.status === 'Resolved' ? 'var(--primary-green)' : '#f57c00') }}>{alert.status}</span>
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

export default Alerts;