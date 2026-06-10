/**
 * App root component.
 * Sets up React Router with a shared dashboard layout (Sidebar + main area).
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage';
import CameraPage from './pages/CameraPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { messaging, VAPID_KEY } from './firebase';
import { getToken } from 'firebase/messaging';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  React.useEffect(() => {
    if (currentUser) {
      // Request notification permission and get token
      const setupNotifications = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
              console.log('FCM Token:', token);
              // Send token to backend
              await fetch('http://localhost:8000/api/auth/save-fcm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_email: currentUser.email,
                  fcm_token: token
                })
              });
            }
          }
        } catch (error) {
          console.error('Lỗi khi thiết lập thông báo:', error);
        }
      };
      
      setupNotifications();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* All dashboard routes share the sidebar layout and are protected */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
