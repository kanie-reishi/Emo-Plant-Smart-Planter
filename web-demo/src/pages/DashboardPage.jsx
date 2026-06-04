/**
 * Dashboard Page — Main overview of the plant's health.
 * Shows sensor cards, mini charts, quick actions, and latest diagnosis.
 * Full implementation in Module 6.
 */

import React from 'react';
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  GlassWater,
  Sprout,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">Tổng quan</h1>
        <p className="page-subtitle">
          Theo dõi sức khỏe cây cảnh của bạn trong thời gian thực
        </p>
      </div>

      {/* Sensor cards placeholder grid */}
      <div className="grid grid-cols-3 mb-6">
        <PlaceholderCard icon={Droplets} label="Độ ẩm đất" value="—" color="green" />
        <PlaceholderCard icon={Thermometer} label="Nhiệt độ" value="—" color="amber" />
        <PlaceholderCard icon={Wind} label="Độ ẩm KK" value="—" color="blue" />
        <PlaceholderCard icon={Sun} label="Ánh sáng" value="—" color="amber" />
        <PlaceholderCard icon={GlassWater} label="Mực nước" value="—" color="blue" />
        <PlaceholderCard icon={Sprout} label="Trạng thái" value="Đang chờ dữ liệu" color="green" />
      </div>

      <div className="card">
        <div className="empty-state">
          <Sprout className="empty-state-icon" size={64} />
          <h3 className="empty-state-title">Dashboard đang được xây dựng</h3>
          <p className="empty-state-text">
            Biểu đồ realtime, nút tưới nhanh và kết quả AI sẽ xuất hiện ở đây
            trong Module 6.
          </p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card card-sm">
      <div className="card-header">
        <span className="card-label">{label}</span>
        <div className={`card-icon ${color}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
}
