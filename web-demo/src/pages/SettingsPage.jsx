import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, Sprout, Droplets, Cpu, Loader2 } from 'lucide-react';
import { fetchSettings, updateSettings } from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    plant_name: '',
    plant_type: '',
    moisture_threshold_low: 30,
    moisture_threshold_high: 70,
    capture_interval_hours: 6,
    auto_water_enabled: true,
    alert_enabled: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' || type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await updateSettings(settings);
      setSaveMessage('Đã lưu thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveMessage('Lỗi khi lưu cài đặt!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn pb-24">
      <div className="page-header mb-8 flex justify-between items-end">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings size={28} className="text-primary" /> Cài đặt hệ thống
          </h1>
          <p className="page-subtitle">Quản lý ngưỡng tự động và cấu hình thiết bị</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plant Info Card */}
        <div className="card">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <Sprout className="text-success" />
            <h3 className="font-semibold text-lg">Thông tin cây trồng</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Tên gọi thân mật</label>
              <input 
                type="text" 
                name="plant_name"
                value={settings.plant_name}
                onChange={handleChange}
                className="form-control"
                placeholder="VD: Cây Trầu Bà góc phòng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Giống cây</label>
              <input 
                type="text" 
                name="plant_type"
                value={settings.plant_type}
                onChange={handleChange}
                className="form-control"
                placeholder="VD: Cà chua, Nha đam..."
              />
            </div>
          </div>
        </div>

        {/* Auto Watering Card */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="text-water" />
              <h3 className="font-semibold text-lg">Tưới nước tự động</h3>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="auto_water_enabled"
                checked={settings.auto_water_enabled}
                onChange={handleChange}
                className="toggle-input" 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className={`space-y-6 ${!settings.auto_water_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-text">Tưới khi độ ẩm dưới (Low)</label>
                <span className="font-bold text-water">{settings.moisture_threshold_low}%</span>
              </div>
              <input 
                type="range" 
                name="moisture_threshold_low"
                min="0" max="100" 
                value={settings.moisture_threshold_low}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-water"
              />
              <p className="text-xs text-muted mt-1">Máy bơm sẽ tự động bật khi đất khô hơn mức này.</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-text">Dừng tưới khi độ ẩm đạt (High)</label>
                <span className="font-bold text-success">{settings.moisture_threshold_high}%</span>
              </div>
              <input 
                type="range" 
                name="moisture_threshold_high"
                min="0" max="100" 
                value={settings.moisture_threshold_high}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-success"
              />
              <p className="text-xs text-muted mt-1">Máy bơm sẽ dừng lại khi đất đã đủ ẩm.</p>
            </div>
          </div>
        </div>

        {/* AI Config Card */}
        <div className="card">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <Cpu className="text-warning" />
            <h3 className="font-semibold text-lg">Thiết lập AI & Camera</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Tần suất tự động chụp ảnh</label>
              <select 
                name="capture_interval_hours"
                value={settings.capture_interval_hours}
                onChange={handleChange}
                className="form-control"
              >
                <option value="1">Mỗi 1 giờ</option>
                <option value="6">Mỗi 6 giờ</option>
                <option value="12">Mỗi 12 giờ</option>
                <option value="24">Mỗi 24 giờ</option>
              </select>
              <p className="text-xs text-muted mt-2">Camera sẽ tự động chụp ảnh và phân tích bệnh định kỳ theo khoảng thời gian này.</p>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="text-primary" />
              <h3 className="font-semibold text-lg">Đẩy thông báo (Push Alerts)</h3>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="alert_enabled"
                checked={settings.alert_enabled}
                onChange={handleChange}
                className="toggle-input" 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <p className="text-sm text-text">
            Bật tính năng này để nhận thông báo cảnh báo về điện thoại hoặc trình duyệt ngay cả khi ứng dụng đang chạy nền. 
            (Yêu cầu cấp quyền thông báo ở Module 11).
          </p>
        </div>

      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-4 animate-slideUp">
        {saveMessage && (
          <span className={`text-sm font-medium px-4 py-2 rounded-full shadow-sm bg-white border border-gray-100 ${saveMessage.includes('Lỗi') ? 'text-warning' : 'text-success'}`}>
            {saveMessage}
          </span>
        )}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary shadow-lg flex items-center gap-2 px-6 py-3 rounded-full hover:-translate-y-1 transition-transform"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Lưu Cài Đặt
        </button>
      </div>
      
    </div>
  );
}
