/**
 * Sidebar navigation component.
 * Fixed left sidebar with brand, nav links, and user section.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Camera,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Leaf,
  Menu,
  X,
} from 'lucide-react';
import { fetchUnreadCount } from '../api';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/charts',   icon: BarChart3,       label: 'Biểu đồ' },
  { to: '/camera',   icon: Camera,          label: 'Camera & AI' },
  { to: '/history',  icon: ClipboardList,   label: 'Lịch sử AI' },
  { to: '/alerts',   icon: Bell,            label: 'Thông báo', hasBadge: true },
  { to: '/settings', icon: Settings,        label: 'Cài đặt' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Fetch unread alert count periodically
  useEffect(() => {
    const loadCount = () => {
      fetchUnreadCount()
        .then((data) => setUnreadCount(data.unread_count ?? 0))
        .catch(() => {}); // Silently ignore if backend is offline
    };

    loadCount();
    const interval = setInterval(loadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Leaf size={22} />
          </div>
          <span className="sidebar-brand-text">Emo Plant</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menu</span>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="sidebar-link-icon" size={20} />
              <span className="sidebar-link-text">{item.label}</span>
              {item.hasBadge && unreadCount > 0 && (
                <span className="sidebar-link-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <div className="sidebar-avatar">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
                <div className="sidebar-user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser?.displayName || 'Người dùng'}
                </div>
                <div className="sidebar-user-email" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '12px' }}>
                  {currentUser?.email || 'Chưa đăng nhập'}
                </div>
              </div>
            </div>
            {currentUser && (
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
