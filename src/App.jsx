import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import Pages
import Dashboard from './pages/Dashboard';
import RouteAnalysis from './pages/RouteAnalysis'; // <--- ADD THIS IMPORT
import Alerts from './pages/Alerts';
import Fleet from './pages/Fleet';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          <Route index element={<Dashboard />} />
          
          <Route path="fleet" element={<Fleet />} />
          
         
          <Route path="routes" element={<RouteAnalysis />} /> 
          
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;