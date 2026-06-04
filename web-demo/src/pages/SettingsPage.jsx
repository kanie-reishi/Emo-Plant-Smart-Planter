/**
 * Settings Page — Plant configuration and system settings.
 * Full implementation in Module 10.
 */

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-subtitle">
          Cấu hình thông tin cây, ngưỡng tưới, lịch chụp ảnh và cảnh báo
        </p>
      </div>

      <div className="card">
        <div className="empty-state">
          <Settings className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Cài đặt đang được xây dựng</h3>
          <p className="empty-state-text">
            Form cài đặt tên cây, ngưỡng tưới tự động, lịch chụp ảnh AI, và
            quản lý tài khoản sẽ xuất hiện ở đây trong Module 10.
          </p>
        </div>
      </div>
    </div>
  );
}
