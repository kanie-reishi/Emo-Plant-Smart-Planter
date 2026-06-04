/**
 * History Page — Timeline of past AI diagnoses.
 * Full implementation in Module 9.
 */

import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Lịch sử chẩn đoán</h1>
        <p className="page-subtitle">
          Xem lại tất cả các lần AI phân tích sức khỏe lá cây
        </p>
      </div>

      <div className="card">
        <div className="empty-state">
          <ClipboardList className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Lịch sử đang được xây dựng</h3>
          <p className="empty-state-text">
            Timeline với thumbnail ảnh, kết quả bệnh, và confidence score sẽ
            xuất hiện ở đây trong Module 9.
          </p>
        </div>
      </div>
    </div>
  );
}
