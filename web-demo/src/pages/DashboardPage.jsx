/**
 * Dashboard Page — Main overview of the plant's health.
 * Shows real-time sensor cards, a mini trend chart, quick actions,
 * and the latest AI diagnosis result.
 */

import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  GlassWater,
  Sprout,
  Activity,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Camera
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { format } from 'date-fns';
import {
  fetchLatestSensor,
  fetchSensorHistory,
  fetchDiagnosisHistory,
  togglePump,
  getImageUrl
} from '../api';
import SensorCard from '../components/SensorCard';

export default function DashboardPage() {
  const [latestSensor, setLatestSensor] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [isWatering, setIsWatering] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [sensor, history, diagnosis] = await Promise.all([
        fetchLatestSensor(),
        fetchSensorHistory('24h'),
        fetchDiagnosisHistory('all', 1)
      ]);
      
      setLatestSensor(sensor);
      
      // Format history for recharts
      if (Array.isArray(history)) {
        const formattedHistory = history.map(r => ({
          ...r,
          time: format(new Date(r.timestamp), 'HH:mm')
        }));
        setChartData(formattedHistory);
      }
      
      if (diagnosis && diagnosis.length > 0) {
        setLatestDiagnosis(diagnosis[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleQuickWater = async () => {
    if (isWatering) return;
    setIsWatering(true);
    try {
      await togglePump('on', 10);
      // Data will naturally update via the next poll, but we can try to force an early refresh
      setTimeout(loadDashboardData, 2000); 
    } catch (error) {
      console.error('Error toggling pump:', error);
      alert('Không thể kích hoạt máy bơm. Vui lòng thử lại sau.');
    } finally {
      // Keep button disabled for the duration of the pump run
      setTimeout(() => setIsWatering(false), 10000); 
    }
  };

  // Determine overall status
  let overallStatus = 'Đang tải...';
  let overallColor = 'neutral';
  let StatusIcon = Sprout;

  if (latestSensor) {
    if (latestSensor.water_level < 15) {
      overallStatus = 'Cạn nước';
      overallColor = 'red';
      StatusIcon = AlertTriangle;
    } else if (latestSensor.soil_moisture < 30) {
      overallStatus = 'Thiếu nước';
      overallColor = 'amber';
      StatusIcon = Droplets;
    } else if (latestDiagnosis && !latestDiagnosis.is_healthy) {
       overallStatus = 'Phát hiện bệnh';
       overallColor = 'amber';
       StatusIcon = Activity;
    } else {
      overallStatus = 'Bình thường';
      overallColor = 'green';
      StatusIcon = CheckCircle2;
    }
  }

  // Value formatting helpers
  const formatVal = (val, dec = 1) => val !== undefined && val !== null && !isNaN(val) ? val.toFixed(dec) : '—';

  return (
    <div className="animate-fadeIn">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">
            Theo dõi sức khỏe cây cảnh của bạn trong thời gian thực
          </p>
        </div>
        {loading && <Loader2 className="animate-spin text-muted" size={24} />}
      </div>

      {/* Top Grid: Sensor Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 mb-6 gap-5">
        <SensorCard 
          icon={Droplets} 
          label="Độ ẩm đất" 
          value={latestSensor ? formatVal(latestSensor.soil_moisture) : '—'} 
          unit="%" 
          color="green" 
          status={latestSensor && latestSensor.soil_moisture < 30 ? 'warning' : 'normal'}
        />
        <SensorCard 
          icon={Thermometer} 
          label="Nhiệt độ" 
          value={latestSensor ? formatVal(latestSensor.temperature) : '—'} 
          unit="°C" 
          color="amber" 
          status={latestSensor && latestSensor.temperature > 35 ? 'warning' : 'normal'}
        />
        <SensorCard 
          icon={Wind} 
          label="Độ ẩm không khí" 
          value={latestSensor ? formatVal(latestSensor.humidity) : '—'} 
          unit="%" 
          color="blue" 
        />
        <SensorCard 
          icon={Sun} 
          label="Ánh sáng" 
          value={latestSensor ? formatVal(latestSensor.light_level, 0) : '—'} 
          unit="lux" 
          color="amber" 
        />
        <SensorCard 
          icon={GlassWater} 
          label="Mực nước bồn" 
          value={latestSensor ? formatVal(latestSensor.water_level) : '—'} 
          unit="%" 
          color="blue" 
          status={latestSensor && latestSensor.water_level < 15 ? 'critical' : 'normal'}
        />
        <SensorCard 
          icon={StatusIcon} 
          label="Trạng thái" 
          value={overallStatus}
          unit=""
          color={overallColor}
          status={overallColor === 'red' ? 'critical' : overallColor === 'amber' ? 'warning' : 'normal'}
        />
      </div>

      {/* Middle Section: Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Chart Column (2/3) */}
        <div className="card lg:col-span-2">
          <div className="card-header mb-4">
            <h3 className="card-title flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Xu hướng độ ẩm đất (24h)
            </h3>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52B788" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#52B788" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`${value}%`, 'Độ ẩm']}
                    labelStyle={{ color: '#1B4332', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="soil_moisture" stroke="#2D6A4F" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted flex-col gap-2">
                <Loader2 className="animate-spin" />
                <span>Đang tải dữ liệu biểu đồ...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Column (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Water Action */}
          <div className="card">
            <div className="card-header mb-4">
              <h3 className="card-title flex items-center gap-2">
                <Droplet size={20} className="text-water" />
                Điều khiển
              </h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Kích hoạt máy bơm ngay lập tức trong 10 giây để bổ sung độ ẩm cho đất.
            </p>
            <button 
              className="btn btn-primary btn-block flex items-center justify-center gap-2"
              onClick={handleQuickWater}
              disabled={isWatering || !latestSensor || latestSensor.water_level < 5}
            >
              {isWatering ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang tưới nước...
                </>
              ) : (
                <>
                  <GlassWater size={20} />
                  Tưới Nhanh (10s)
                </>
              )}
            </button>
            {latestSensor && latestSensor.water_level < 5 && (
              <p className="text-xs text-danger mt-2 text-center">
                Không thể tưới: Mực nước quá thấp!
              </p>
            )}
          </div>

          {/* Latest AI Diagnosis */}
          <div className="card flex-1">
            <div className="card-header mb-4">
              <h3 className="card-title flex items-center gap-2">
                <Camera size={20} className="text-emerald-600" />
                AI Chẩn đoán gần nhất
              </h3>
            </div>
            
            {latestDiagnosis ? (
              <div className="flex flex-col gap-3">
                <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden relative">
                  {latestDiagnosis.image_path ? (
                    <img 
                      src={getImageUrl(latestDiagnosis.image_path)} 
                      alt="Plant Leaf" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <Camera size={32} opacity={0.5} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${latestDiagnosis.is_healthy ? 'badge-success' : 'badge-danger'} shadow-sm`}>
                      {latestDiagnosis.is_healthy ? 'Khỏe mạnh' : 'Có bệnh'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold text-text">{latestDiagnosis.disease_name}</div>
                  <div className="text-xs text-muted flex items-center gap-1 mt-1">
                    Độ tin cậy: <span className="font-medium text-text">{(latestDiagnosis.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Lúc: {format(new Date(latestDiagnosis.timestamp), 'HH:mm dd/MM/yyyy')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[150px] flex items-center justify-center flex-col text-muted text-sm gap-2">
                <Camera opacity={0.3} size={40} />
                <p>Chưa có dữ liệu chẩn đoán AI</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
