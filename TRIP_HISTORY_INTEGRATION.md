# Trip History Feature - Integration & Implementation Guide

## Quick Start

### 1. Files Added/Modified

#### New Files Created:
- `src/tripHistoryHelper.js` - Utility functions for data processing
- `src/components/TripHistory.jsx` - Main modal component
- `TRIP_HISTORY_FEATURE.md` - Complete documentation

#### Modified Files:
- `src/translations.js` - Added tripHistory translations
- `src/components/FarmerSidebar.jsx` - Added Trip History button
- `src/components/DriverSidebar.jsx` - Added Trip History button
- `src/components/TransporterSidebar.jsx` - Added Trip History button

### 2. How It Works

```
User clicks "Trip History" button in sidebar
    ↓
TripHistory modal opens
    ↓
User selects date range and language
    ↓
Trips are fetched and filtered
    ↓
Statistics are calculated
    ↓
User clicks "Generate CSV"
    ↓
CSV file is downloaded with translated headers
```

## Backend Integration Steps

### Step 1: Update fetchTripHistory Function

Open `src/tripHistoryHelper.js` and update:

```javascript
export const fetchTripHistory = async (filters = {}) => {
  // Currently returns demo data - replace with your API call
  
  const { farmerId, driverId, dateFrom, dateTo, limit = 50 } = filters;
  
  try {
    const response = await fetch('/api/v1/trips/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        farmerId,
        driverId,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
        dateTo: dateTo ? new Date(dateTo).toISOString() : null,
        limit
      })
    });

    if (!response.ok) throw new Error('Failed to fetch trips');
    const data = await response.json();
    return data.trips || [];
  } catch (error) {
    console.error('Error fetching trip history:', error);
    return [];
  }
};
```

### Step 2: ESP32 Data Format

Ensure your ESP32 uploads data in this format:

```json
{
  "trips": [
    {
      "id": "TRIP_1704067800_1",
      "startTime": "2025-01-23T08:30:00Z",
      "endTime": "2025-01-23T10:45:00Z",
      "duration": 135,
      "distance": 45.5,
      "avgTemp": 18.2,
      "maxTemp": 25.1,
      "minTemp": 12.3,
      "humidity": 65,
      "startLocation": "Farm A",
      "endLocation": "Market",
      "vehicleId": "TRUCK_001",
      "driverId": "DRV_123",
      "farmerId": "FARM_001",
      "complianceStatus": "PASSED",
      "notes": "SD card upload from ESP32"
    }
  ]
}
```

### Step 3: API Endpoints Required

Your backend needs to provide:

```
POST /api/v1/trips/history
  Input: { farmerId, driverId, dateFrom, dateTo, limit }
  Output: { trips: [...], count: number }

GET /api/v1/trips/:tripId
  Input: tripId
  Output: { trip: {...} }

POST /api/v1/trips/verify-compliance
  Input: { tripId }
  Output: { status: "PASSED|FAILED|WARNING", reason: string }
```

## Testing the Feature

### Test with Demo Data

1. Open your app and navigate to any sidebar
2. Click "Trip History & Compliance"
3. Click "Demo CSV" button
4. Verify CSV downloads with demo data
5. Check headers are in English

### Test with Multiple Languages

1. Repeat above steps but:
   - Select "हिंदी" from language dropdown
   - Click "Generate CSV"
2. Open downloaded file in Excel
3. Verify column headers are in Hindi

### Test Date Filtering

1. Open Trip History modal
2. Change "From Date" to 10 days ago
3. Change "To Date" to today
4. Verify trip count and statistics update
5. Generate CSV and check data matches dates

## Usage Examples

### Example 1: Farmer Generating Compliance Report

```javascript
// In FarmerDashboard.jsx
import { useCallback } from 'react';
import { generateAndDownloadCSV } from '../tripHistoryHelper';

const exportComplianceReport = useCallback(async () => {
  const trips = await fetchTripHistory({ farmerId: currentFarmer.id });
  generateAndDownloadCSV(
    trips,
    selectedLanguage,
    `compliance_report_${Date.now()}.csv`
  );
}, [currentFarmer, selectedLanguage]);
```

### Example 2: Driver Checking Temperature Proof

```javascript
// In DriverDashboard.jsx
import TripHistory from './components/TripHistory';

function DriverDashboard({ lang }) {
  const [showTripHistory, setShowTripHistory] = useState(false);

  return (
    <>
      <button onClick={() => setShowTripHistory(true)}>
        View My Trip History
      </button>
      
      <TripHistory
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        lang={lang}
        translations={translations}
      />
    </>
  );
}
```

### Example 3: Transporter Fleet Analysis

```javascript
// In TransporterDashboard.jsx
const analyzeFleetCompliance = useCallback(async () => {
  const trips = await fetchTripHistory({
    dateFrom: new Date(Date.now() - 30*24*60*60*1000),
    dateTo: new Date(),
    limit: 500
  });

  const stats = calculateTripStats(trips);
  console.log(`Fleet Compliance Rate: ${
    (stats.compliancePassed / stats.totalTrips * 100).toFixed(2)
  }%`);
}, []);
```

## Customization

### Add Custom Fields to Trip

1. Update data structure in `tripHistoryHelper.js`:
```javascript
// In getColumnHeaders()
const headers = {
  en: {
    // ... existing fields
    productType: 'Product Type',
    customerName: 'Customer Name',
    gpsCoordinates: 'GPS Coordinates'
  }
};

// In generateCSVContent()
const columnOrder = [
  // ... existing columns
  'productType',
  'customerName',
  'gpsCoordinates'
];
```

2. Ensure your backend returns these fields

3. (Optional) Update TripHistory.jsx table to display:
```jsx
<td style={{ padding: '12px', color: '#666' }}>
  {trip.productType}
</td>
```

### Change Color Scheme

Edit `TripHistory.jsx`:
```jsx
// Change primary gradient
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ↓
background: 'linear-gradient(135deg, #000000 0%, #333333 100%)'

// Change button color
background: '#ff9800'
    ↓
background: '#4CAF50'
```

### Add Email Export

```javascript
// In tripHistoryHelper.js
export const emailCSV = async (csvContent, recipientEmail) => {
  const response = await fetch('/api/email/send-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: recipientEmail,
      csvContent: csvContent,
      subject: 'Trip History Report'
    })
  });
  return response.json();
};
```

Then in `TripHistory.jsx`:
```jsx
<button onClick={() => emailCSV(csvContent, userEmail)}>
  Email Report
</button>
```

## Common Integration Issues

### Issue 1: "No trips found" always shows

**Solution:**
- Check if `fetchTripHistory()` is calling correct API endpoint
- Verify backend is returning trips in correct format
- Add console logging to debug

```javascript
const loadTrips = async () => {
  setLoading(true);
  try {
    const data = await fetchTripHistory();
    console.log('Fetched trips:', data); // Add this
    setTrips(data);
  } catch (error) {
    console.error('Error loading trips:', error);
  }
  setLoading(false);
};
```

### Issue 2: CSV headers in wrong language

**Solution:**
- Verify language code matches translation key
- Check `translations.tripHistory[lang]` exists
- Add fallback to English

```javascript
const columnHeaders = getColumnHeaders(lang);
if (!columnHeaders) {
  console.warn(`No headers for language: ${lang}, using English`);
  return getColumnHeaders('en');
}
```

### Issue 3: Date filtering not working

**Solution:**
- Ensure trip timestamps are ISO 8601 format
- Check date comparison logic:

```javascript
const fromDate = new Date(dateFrom);
const toDate = new Date(dateTo);
toDate.setHours(23, 59, 59, 999); // Set to end of day

const filtered = trips.filter(trip => {
  const tripStart = new Date(trip.startTime);
  console.log(`Comparing: ${tripStart} between ${fromDate}-${toDate}`);
  return tripStart >= fromDate && tripStart <= toDate;
});
```

### Issue 4: Statistics not calculating

**Solution:**
- Verify `calculateTripStats()` receives array of trips
- Check for null/undefined values in trip data

```javascript
export const calculateTripStats = (trips) => {
  if (!trips || !Array.isArray(trips) || trips.length === 0) {
    return { totalTrips: 0, /* ... */ };
  }
  // Rest of calculation
};
```

## Performance Optimization

### For Large Datasets

```javascript
// Limit initial load
const response = await fetch('/api/trips/history', {
  body: JSON.stringify({
    limit: 50,
    offset: 0,
    dateFrom: last30Days
  })
});

// Implement pagination
const [page, setPage] = useState(1);
const itemsPerPage = 50;
const startIdx = (page - 1) * itemsPerPage;
const endIdx = startIdx + itemsPerPage;
const paginatedTrips = trips.slice(startIdx, endIdx);
```

### Cache Trip Data

```javascript
const [tripsCache, setTripsCache] = useState(null);
const [cacheTime, setCacheTime] = useState(null);

const loadTripsWithCache = async () => {
  const now = Date.now();
  // Cache for 5 minutes
  if (tripsCache && cacheTime && (now - cacheTime) < 5*60*1000) {
    return tripsCache;
  }
  
  const data = await fetchTripHistory();
  setTripsCache(data);
  setCacheTime(now);
  return data;
};
```

## Deployment Checklist

- [ ] Backend API endpoints implemented
- [ ] ESP32 integration tested
- [ ] All translations verified
- [ ] CSV export tested in all languages
- [ ] Date filtering works correctly
- [ ] Statistics calculation verified
- [ ] Demo data functioning
- [ ] Modal styling matches app theme
- [ ] Mobile responsiveness checked
- [ ] Error handling tested
- [ ] Performance tested with 100+ trips
- [ ] User documentation created
- [ ] Team trained on feature
- [ ] Backup/restore procedures in place

## Support

For issues or questions:
1. Check TRIP_HISTORY_FEATURE.md for detailed documentation
2. Review error messages in browser console
3. Test with demo data first
4. Check backend API logs

---

**Ready to deploy!** Follow the Backend Integration Steps above, test thoroughly, and you're good to go.
