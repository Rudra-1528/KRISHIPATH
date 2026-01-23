// ==========================================
// TRIP HISTORY FEATURE - USAGE EXAMPLES
// ==========================================

/**
 * Example 1: Basic Trip History Modal in Farmer Dashboard
 */

import React, { useState } from 'react';
import TripHistory from '../components/TripHistory';
import { translations } from '../translations';

function FarmerDashboard({ lang }) {
  const [showTripHistory, setShowTripHistory] = useState(false);

  return (
    <div>
      <h1>Farmer Dashboard</h1>
      
      {/* Trip History Button */}
      <button 
        onClick={() => setShowTripHistory(true)}
        style={{
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        📊 View Trip History
      </button>

      {/* Trip History Modal */}
      <TripHistory
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        lang={lang}
        translations={translations}
      />
    </div>
  );
}

export default FarmerDashboard;


/**
 * Example 2: Automated Daily Report Generation
 */

import { fetchTripHistory, generateAndDownloadCSV, calculateTripStats } from '../tripHistoryHelper';

async function generateDailyReport(farmerId, selectedLanguage) {
  // Get yesterday's trips
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const today = new Date();
  
  const trips = await fetchTripHistory({
    farmerId,
    dateFrom: yesterday.toISOString(),
    dateTo: today.toISOString()
  });

  // Calculate stats
  const stats = calculateTripStats(trips);
  console.log(`Yesterday's Summary:`);
  console.log(`- Total Trips: ${stats.totalTrips}`);
  console.log(`- Total Distance: ${stats.totalDistance} km`);
  console.log(`- Average Temperature: ${stats.avgTemp}°C`);
  console.log(`- Compliance Pass Rate: ${(stats.compliancePassed/stats.totalTrips*100).toFixed(2)}%`);

  // Generate and download CSV
  const filename = `daily_report_${yesterday.toISOString().split('T')[0]}.csv`;
  generateAndDownloadCSV(trips, selectedLanguage, filename);
}


/**
 * Example 3: Compliance Verification Before Export
 */

import { fetchTripHistory } from '../tripHistoryHelper';

async function verifyCompliance(shipmentId) {
  // Get all trips for this shipment
  const trips = await fetchTripHistory({
    filters: { shipmentId }
  });

  // Check if all trips passed compliance
  const allPassed = trips.every(trip => trip.complianceStatus === 'PASSED');
  
  if (allPassed) {
    console.log('✅ Shipment complies with temperature requirements');
    return {
      compliant: true,
      avgTemp: trips.reduce((sum, t) => sum + parseFloat(t.avgTemp), 0) / trips.length,
      minTemp: Math.min(...trips.map(t => parseFloat(t.minTemp))),
      maxTemp: Math.max(...trips.map(t => parseFloat(t.maxTemp)))
    };
  } else {
    console.log('❌ Shipment has compliance issues:');
    trips.forEach(trip => {
      if (trip.complianceStatus !== 'PASSED') {
        console.log(`- Trip ${trip.id}: ${trip.complianceStatus}`);
      }
    });
    return { compliant: false };
  }
}


/**
 * Example 4: Multi-Language Report Generation for Buyer
 */

async function createBuyerReport(tripId, buyerLanguage) {
  const trips = await fetchTripHistory({
    tripId,
    limit: 1
  });

  // Generate CSV in buyer's preferred language
  import { generateCSVContent, downloadCSV } from '../tripHistoryHelper';
  
  const csvContent = generateCSVContent(trips, buyerLanguage);
  downloadCSV(csvContent, `trip_report_${tripId}.csv`);
  
  return {
    status: 'Report generated in ' + buyerLanguage,
    trip: trips[0],
    complianceProof: trips[0].complianceStatus === 'PASSED'
  };
}


/**
 * Example 5: API Response Handler
 */

async function handleESP32Upload(uploadData) {
  // ESP32 sends SD card data to backend
  // Backend stores it and we retrieve it here
  
  const { uploadId, tripCount, dateRange } = uploadData;
  
  try {
    // Fetch the uploaded trips
    const trips = await fetchTripHistory({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      limit: tripCount
    });

    // Log statistics
    import { calculateTripStats } from '../tripHistoryHelper';
    const stats = calculateTripStats(trips);
    
    console.log(`✅ SD Card Sync Complete`);
    console.log(`Upload ID: ${uploadId}`);
    console.log(`Trips Synced: ${stats.totalTrips}`);
    console.log(`Distance Covered: ${stats.totalDistance} km`);
    console.log(`Duration: ${(stats.totalDuration/60).toFixed(1)} hours`);
    
    return {
      success: true,
      stats,
      trips
    };
  } catch (error) {
    console.error('❌ SD Card Sync Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * Example 6: Real-Time Compliance Dashboard
 */

function ComplianceDashboard({ farmerId, lang }) {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTripHistory({ farmerId });
      setTrips(data);
      
      import { calculateTripStats } from '../tripHistoryHelper';
      const statistics = calculateTripStats(data);
      setStats(statistics);
      setLoading(false);
    };

    loadData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [farmerId]);

  if (loading) return <div>Loading compliance data...</div>;

  const passRate = (stats.compliancePassed / stats.totalTrips * 100).toFixed(1);
  const statusColor = passRate >= 95 ? 'green' : passRate >= 80 ? 'orange' : 'red';

  return (
    <div style={{ border: `3px solid ${statusColor}`, padding: '20px' }}>
      <h2>Compliance Status</h2>
      <p>Pass Rate: <strong style={{ color: statusColor }}>{passRate}%</strong></p>
      <p>Total Trips: {stats.totalTrips}</p>
      <p>Avg Temperature: {stats.avgTemp}°C</p>
      <p>Temperature Range: {stats.minTemp}°C - {stats.maxTemp}°C</p>
      
      {passRate < 80 && (
        <div style={{ background: '#ffebee', padding: '10px', marginTop: '10px' }}>
          ⚠️ Warning: Compliance rate is below 80%
        </div>
      )}
    </div>
  );
}


/**
 * Example 7: CSV Export with Custom Formatting
 */

function ExportTripsWithCustomFormat() {
  const exportAsHTML = async (trips, lang) => {
    let html = '<table border="1">';
    html += '<thead><tr>';
    
    const headers = {
      tripId: 'Trip ID',
      startTime: 'Start',
      avgTemp: 'Temperature',
      complianceStatus: 'Status'
    };
    
    Object.values(headers).forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    trips.forEach(trip => {
      html += '<tr>';
      html += `<td>${trip.id}</td>`;
      html += `<td>${trip.startTime}</td>`;
      html += `<td>${trip.avgTemp}°C</td>`;
      html += `<td style="color:${trip.complianceStatus === 'PASSED' ? 'green' : 'red'}">`;
      html += `${trip.complianceStatus}</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    // Download HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trips_report.html';
    link.click();
  };

  return exportAsHTML;
}


/**
 * Example 8: Transporter Fleet Analysis
 */

async function analyzeFleetPerformance(transporterId, dateRange) {
  // Get all trips for all vehicles
  const trips = await fetchTripHistory({
    transporterId,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    limit: 1000
  });

  // Group by vehicle
  const byVehicle = trips.reduce((acc, trip) => {
    if (!acc[trip.vehicleId]) {
      acc[trip.vehicleId] = [];
    }
    acc[trip.vehicleId].push(trip);
    return acc;
  }, {});

  // Calculate per-vehicle stats
  const vehicleStats = Object.entries(byVehicle).map(([vehicleId, vehicleTrips]) => {
    import { calculateTripStats } from '../tripHistoryHelper';
    const stats = calculateTripStats(vehicleTrips);
    return {
      vehicleId,
      ...stats,
      complianceRate: (stats.compliancePassed / stats.totalTrips * 100).toFixed(1)
    };
  });

  // Find best and worst performers
  const bestPerformer = vehicleStats.reduce((best, current) =>
    current.complianceRate > best.complianceRate ? current : best
  );
  
  const worstPerformer = vehicleStats.reduce((worst, current) =>
    current.complianceRate < worst.complianceRate ? current : worst
  );

  console.log('🏆 Fleet Performance Report');
  console.log(`Best: ${bestPerformer.vehicleId} (${bestPerformer.complianceRate}% compliance)`);
  console.log(`Worst: ${worstPerformer.vehicleId} (${worstPerformer.complianceRate}% compliance)`);
  console.log(`Fleet Average: ${
    (vehicleStats.reduce((sum, v) => sum + parseFloat(v.complianceRate), 0) / vehicleStats.length).toFixed(1)
  }%`);

  return vehicleStats;
}


/**
 * Example 9: Temperature Alert System
 */

async function setupTemperatureAlerts(farmerId) {
  const checkTemperatures = async () => {
    const trips = await fetchTripHistory({ farmerId, limit: 10 });

    trips.forEach(trip => {
      // Alert if max temperature exceeded
      if (trip.maxTemp > 22) {
        console.warn(`🌡️ ALERT: Trip ${trip.id} exceeded max temp (${trip.maxTemp}°C)`);
        sendNotification({
          type: 'temp_warning',
          trip: trip.id,
          severity: trip.maxTemp > 25 ? 'critical' : 'warning',
          message: `Temperature reached ${trip.maxTemp}°C`
        });
      }

      // Alert if compliance failed
      if (trip.complianceStatus === 'FAILED') {
        console.error(`❌ COMPLIANCE FAILED: Trip ${trip.id}`);
        sendNotification({
          type: 'compliance_failed',
          trip: trip.id,
          severity: 'critical',
          message: 'Trip failed compliance check'
        });
      }
    });
  };

  // Check every 10 minutes
  setInterval(checkTemperatures, 10 * 60 * 1000);
  
  // Initial check
  await checkTemperatures();
}


/**
 * Example 10: Historical Analysis & Trends
 */

async function analyzeTemperatureTrends(farmerId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const trips = await fetchTripHistory({
    farmerId,
    dateFrom: startDate.toISOString(),
    dateTo: new Date().toISOString(),
    limit: 1000
  });

  // Group by day
  const byDay = {};
  trips.forEach(trip => {
    const date = trip.startTime.split('T')[0];
    if (!byDay[date]) byDay[date] = [];
    byDay[date].push(trip);
  });

  // Calculate daily averages
  const dailyTrends = Object.entries(byDay).map(([date, dayTrips]) => {
    const avgTemp = dayTrips.reduce((sum, t) => sum + parseFloat(t.avgTemp), 0) / dayTrips.length;
    const passCount = dayTrips.filter(t => t.complianceStatus === 'PASSED').length;
    
    return {
      date,
      avgTemp: avgTemp.toFixed(1),
      trips: dayTrips.length,
      compliance: (passCount / dayTrips.length * 100).toFixed(1)
    };
  });

  console.log('📈 30-Day Temperature Trends');
  console.log('Date        | Avg Temp | Trips | Compliance');
  dailyTrends.forEach(day => {
    console.log(`${day.date} | ${day.avgTemp}°C    | ${day.trips}     | ${day.compliance}%`);
  });

  return dailyTrends;
}


// ==========================================
// Export all examples
// ==========================================

export {
  generateDailyReport,
  verifyCompliance,
  createBuyerReport,
  handleESP32Upload,
  ComplianceDashboard,
  analyzeFleetPerformance,
  setupTemperatureAlerts,
  analyzeTemperatureTrends
};
