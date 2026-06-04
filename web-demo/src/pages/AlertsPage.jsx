/**
 * Alerts Page — System notifications and warnings.
 * Full implementation in Module 10.
 */

import React from 'react';
import { Bell } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Thông báo</h1>
        <p className="page-subtitle">
          Cảnh báo khi độ ẩm thấp, phát hiện bệnh, hoặc mực nước cạn
        </p>
      </div>

      <div className="card">
        <div className="empty-state">
          <Bell className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Thông báo đang được xây dựng</h3>
          <p className="empty-state-text">
            Danh sách cảnh báo với severity badges và nút đánh dấu đã đọc sẽ
            xuất hiện ở đây trong Module 10.
          </p>
        </div>
      </div>
    </div>
  );
}
