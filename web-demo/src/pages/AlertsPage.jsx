import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { fetchAlerts, markAlertRead, markAllAlertsRead } from '../api';
import { format } from 'date-fns';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' or 'all'
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [activeTab]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(activeTab === 'unread', 100);
      setAlerts(data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAlertRead(id);
      // If we are in the 'unread' tab, removing it immediately from the list gives good feedback
      if (activeTab === 'unread') {
        setAlerts(prev => prev.filter(a => a.id !== id));
      } else {
        // If in 'all' tab, just update its status
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAlertsRead();
      if (activeTab === 'unread') {
        setAlerts([]);
      } else {
        setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getAlertIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'info': default: return <Info size={20} />;
    }
  };

  const getAlertColorClasses = (severity, isRead) => {
    const baseOpacity = isRead ? 'opacity-60 bg-gray-50' : 'bg-white shadow-sm';
    switch(severity) {
      case 'critical': 
        return `${baseOpacity} border-l-4 border-l-warning`;
      case 'warning': 
        return `${baseOpacity} border-l-4 border-l-warning`;
      case 'info': default: 
        return `${baseOpacity} border-l-4 border-l-primary`;
    }
  };

  const getIconColorClasses = (severity, isRead) => {
    if (isRead) return 'text-muted bg-gray-200';
    switch(severity) {
      case 'critical': return 'text-warning bg-warning-pale';
      case 'warning': return 'text-warning bg-warning-pale';
      case 'info': default: return 'text-primary bg-primary-pale';
    }
  };

  return (
    <div className="animate-fadeIn pb-24">
      <div className="page-header mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell size={28} className="text-primary" /> Hộp thư cảnh báo
          </h1>
          <p className="page-subtitle">Các thông báo từ hệ thống và AI</p>
        </div>
        
        <button 
          onClick={handleMarkAllRead}
          disabled={markingAll || alerts.length === 0}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {markingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '24px', gap: '24px' }}>
        <button 
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'unread' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'unread' ? 'var(--color-primary)' : '#6B7280',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('unread')}
        >
          Chưa đọc
        </button>
        <button 
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'all' ? 'var(--color-primary)' : '#6B7280',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            <CheckCircle2 size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>Không có cảnh báo nào</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Bạn đã xem hết các thông báo {activeTab === 'unread' ? 'chưa đọc' : ''}.</p>
          </div>
        ) : (
          alerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            
            const borderColor = alert.is_read ? '#E5E7EB' : (isCritical || isWarning ? 'var(--color-warning)' : 'var(--color-primary)');
            const bgColor = alert.is_read ? '#F9FAFB' : 'white';
            const iconBg = alert.is_read ? '#E5E7EB' : (isCritical || isWarning ? '#FEF3C7' : '#D1FAE5');
            const iconColor = alert.is_read ? '#6B7280' : (isCritical || isWarning ? 'var(--color-warning)' : 'var(--color-primary)');
            const opacity = alert.is_read ? '0.7' : '1';

            return (
              <div 
                key={alert.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  padding: '16px', 
                  backgroundColor: bgColor, 
                  border: '1px solid #E5E7EB',
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: '0 8px 8px 0',
                  boxShadow: alert.is_read ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                  opacity: opacity,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: iconBg, color: iconColor, flexShrink: 0 }}>
                  {getAlertIcon(alert.severity)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: alert.is_read ? '400' : '500', color: alert.is_read ? '#6B7280' : '#111827' }}>
                    {alert.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                    {format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                </div>
                {!alert.is_read && (
                  <button 
                    onClick={() => handleMarkRead(alert.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#9CA3AF', borderRadius: '50%' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; e.currentTarget.style.color = 'var(--color-primary)' }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF' }}
                    title="Đánh dấu đã đọc"
                  >
                    <Check size={20} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
