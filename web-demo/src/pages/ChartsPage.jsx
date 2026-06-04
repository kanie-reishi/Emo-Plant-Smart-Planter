/**
 * Charts Page — Detailed sensor history charts.
 * Full implementation with Recharts in Module 7.
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function ChartsPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Biểu đồ chi tiết</h1>
        <p className="page-subtitle">
          Xem lịch sử dữ liệu cảm biến với bộ lọc thời gian
        </p>
      </div>

      <div className="card">
        <div className="empty-state">
          <BarChart3 className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Biểu đồ đang được xây dựng</h3>
          <p className="empty-state-text">
            Biểu đồ line/area cho độ ẩm, nhiệt độ, ánh sáng và mực nước sẽ
            xuất hiện ở đây trong Module 7.
          </p>
        </div>
      </div>
    </div>
  );
}
