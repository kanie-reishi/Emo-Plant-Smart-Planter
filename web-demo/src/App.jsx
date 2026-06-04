/**
 * App root component.
 * Sets up React Router with a shared dashboard layout (Sidebar + main area).
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage';
import CameraPage from './pages/CameraPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

/**
 * Shared layout for all dashboard pages.
 * Renders the sidebar and a scrollable main content area.
 */
function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All dashboard routes share the sidebar layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
