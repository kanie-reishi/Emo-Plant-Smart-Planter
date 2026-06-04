/**
 * Camera & AI Page — Live stream and AI diagnosis.
 * Full implementation in Module 8.
 */

import React from 'react';
import { Camera } from 'lucide-react';

export default function CameraPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Camera & AI</h1>
        <p className="page-subtitle">
          Xem camera trực tiếp và chẩn đoán sức khỏe lá cây bằng AI
        </p>
      </div>

      <div className="card">
        <div className="empty-state">
          <Camera className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Camera & AI đang được xây dựng</h3>
          <p className="empty-state-text">
            Live stream từ ESP32-CAM, upload ảnh, và kết quả chẩn đoán AI sẽ
            xuất hiện ở đây trong Module 8.
          </p>
        </div>
      </div>
    </div>
  );
}
