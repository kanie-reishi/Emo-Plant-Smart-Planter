/**
 * Charts Page — Detailed historical data visualization.
 * Supports time range filters, custom date selection, and CSV export.
 */

import React, { useState, useEffect } from 'react';
import { Download, Loader2, Calendar } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fetchSensorHistory } from '../api';

export default function ChartsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h'); // '1h', '24h', '7d', 'custom'
  const [customDate, setCustomDate] = useState(''); // YYYY-MM-DD

  const loadData = async (range, date = null) => {
    setLoading(true);
    try {
      const history = await fetchSensorHistory(range, date);
      if (Array.isArray(history)) {
        const formatted = history.map(item => ({
          ...item,
          // Format time differently depending on the range
          displayTime: (range === '7d' || date) 
                        ? format(new Date(item.timestamp), 'dd/MM HH:mm')
                        : format(new Date(item.timestamp), 'HH:mm')
        }));
        setData(formatted);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRange === 'custom') {
      if (customDate) loadData(null, customDate);
    } else {
      loadData(timeRange, null);
    }
  }, [timeRange, customDate]);

  const handleExportCSV = () => {
    if (data.length === 0) return alert('Không có dữ liệu để xuất.');
    
    const headers = ['Thời gian', 'Độ ẩm đất (%)', 'Nhiệt độ (°C)', 'Độ ẩm KK (%)', 'Ánh sáng (lux)', 'Mực nước (%)'];
    const rows = data.map(d => [
      format(new Date(d.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      d.soil_moisture,
      d.temperature,
      d.humidity,
      d.light_level,
      d.water_level
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `emo_plant_data_${timeRange}${customDate ? '_'+customDate : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Tooltip style for Recharts
  const tooltipStyle = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' };

  return (
    <div className="animate-fadeIn">
      
      {/* Header & Controls */}
      <div className="page-header flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="page-title">Biểu đồ chi tiết</h1>
          <p className="page-subtitle">Phân tích chuyên sâu lịch sử dữ liệu cảm biến</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="segmented-control">
            <button 
              className={`segmented-control-btn ${timeRange === '1h' ? 'active' : ''}`}
              onClick={() => { setTimeRange('1h'); setCustomDate(''); }}
            >
              1 Giờ
            </button>
            <button 
              className={`segmented-control-btn ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => { setTimeRange('24h'); setCustomDate(''); }}
            >
              24 Giờ
            </button>
            <button 
              className={`segmented-control-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => { setTimeRange('7d'); setCustomDate(''); }}
            >
              7 Ngày
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar size={16} className="text-muted" />
            <input 
              type="date" 
              className="text-sm outline-none text-text bg-transparent"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setTimeRange('custom');
              }}
            />
          </div>

          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center gap-2"
            disabled={data.length === 0}
          >
            <Download size={18} />
            Xuất Excel (CSV)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
          <Loader2 className="animate-spin" size={32} />
          <p>Đang tải dữ liệu biểu đồ...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="card text-center py-20 text-muted">
          <p>Không có dữ liệu trong khoảng thời gian này.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Chart 1: Temperature & Humidity (Line Chart) */}
          <div className="card">
            <h3 className="card-title mb-6">Nhiệt độ & Độ ẩm không khí</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="displayTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={30} />
                  
                  {/* Left Y-axis for Temp */}
                  <YAxis yAxisId="left" domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#D97706' }} />
                  {/* Right Y-axis for Humidity */}
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#3B82F6' }} />
                  
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  <Line yAxisId="left" type="monotone" name="Nhiệt độ (°C)" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" name="Độ ẩm KK (%)" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Soil Moisture & Water Level (Area Chart) */}
          <div className="card">
            <h3 className="card-title mb-6">Độ ẩm đất & Mực nước bồn</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="displayTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={30} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  <Area type="monotone" name="Độ ẩm đất (%)" dataKey="soil_moisture" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSoil)" />
                  <Area type="step" name="Mực nước (%)" dataKey="water_level" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorWater)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Light Level (Bar Chart) */}
          <div className="card">
            <h3 className="card-title mb-6">Cường độ ánh sáng</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="displayTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F3F4F6' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  <Bar name="Ánh sáng (lux)" dataKey="light_level" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
