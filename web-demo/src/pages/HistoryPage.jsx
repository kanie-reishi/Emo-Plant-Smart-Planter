/**
 * History Page — Unified Timeline of AI Diagnoses and Watering Events.
 */

import React, { useState, useEffect } from 'react';
import { fetchDiagnosisHistory, fetchWateringHistory, getImageUrl } from '../api';
import { Droplet, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedWatering, setExpandedWatering] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aiData, waterData] = await Promise.all([
        fetchDiagnosisHistory('all', 50),
        fetchWateringHistory(50)
      ]);
      
      const combined = [
        ...aiData.map(d => ({ ...d, _type: 'ai' })),
        ...waterData.map(d => ({ ...d, _type: 'water' }))
      ];
      
      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setEvents(combined);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleWatering = (id) => {
    setExpandedWatering(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getWateringTriggerName = (type) => {
    switch(type) {
      case 'auto': return 'Tự động';
      case 'remote': return 'Điều khiển từ xa';
      case 'manual': return 'Nút bấm cứng';
      default: return type;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header mb-8">
        <h1 className="page-title">Dòng thời gian sự kiện</h1>
        <p className="page-subtitle">
          Lịch sử hợp nhất các lần Tưới nước và Chẩn đoán AI
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-primary">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-20 text-muted">
          <p>Chưa có sự kiện nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-6 pb-8">
          {events.map((ev, index) => {
            const timeStr = format(new Date(ev.timestamp), 'dd/MM/yyyy • HH:mm:ss');
            
            if (ev._type === 'water') {
              const isExpanded = expandedWatering[ev.id];
              return (
                <div key={`water-${ev.id}`} className="relative pl-8 md:pl-10 animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                  <div className="absolute -left-[17px] bg-water-pale text-water p-1.5 rounded-full border-4 border-bg shadow-sm">
                    <Droplet size={18} />
                  </div>
                  <div 
                    className="bg-white border border-water-pale rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => toggleWatering(ev.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-text flex items-center gap-2">
                          Hệ thống đã tưới nước
                          <span className="badge badge-info text-[10px] uppercase">{getWateringTriggerName(ev.trigger_type)}</span>
                        </h4>
                        <p className="text-xs text-muted mt-1">{timeStr}</p>
                      </div>
                      <div className="text-water-pale bg-water text-white w-8 h-8 rounded-full flex items-center justify-center">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm animate-fadeIn">
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <p className="text-muted text-xs mb-1">Độ ẩm trước</p>
                          <p className="font-bold text-text">{ev.soil_moisture_before ? `${ev.soil_moisture_before}%` : '--'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <p className="text-muted text-xs mb-1">Thời gian bơm</p>
                          <p className="font-bold text-water">{ev.duration_seconds} giây</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <p className="text-muted text-xs mb-1">Độ ẩm sau</p>
                          <p className="font-bold text-success">{ev.soil_moisture_after ? `${ev.soil_moisture_after}%` : '--'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // AI Event
              return (
                <div key={`ai-${ev.id}`} className="relative pl-8 md:pl-10 animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                  <div className={`absolute -left-[17px] p-1.5 rounded-full border-4 border-bg shadow-sm ${ev.is_healthy ? 'bg-success-pale text-success' : 'bg-warning-pale text-warning'}`}>
                    {ev.is_healthy ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div 
                    className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 ${ev.is_healthy ? 'border-success-pale' : 'border-warning-pale'}`}
                    onClick={() => setSelectedImage(ev)}
                  >
                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={getImageUrl(ev.image_path)} 
                        alt="AI Scan" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Img'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text truncate pr-2">{ev.disease_name}</h4>
                      <p className="text-xs text-muted mt-1 mb-2">{timeStr}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-medium text-text bg-gray-100 px-2 py-0.5 rounded-full">
                           Độ tin cậy: {(ev.confidence * 100).toFixed(1)}%
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* AI Detail Modal */}
      {selectedImage && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold flex items-center gap-2 m-0" style={{ fontSize: '18px' }}>
                 Chi tiết chẩn đoán AI
                 <span className={`badge ${selectedImage.is_healthy ? 'badge-success' : 'badge-warning'}`}>
                   {selectedImage.is_healthy ? 'Khỏe Mạnh' : 'Phát Hiện Bệnh'}
                 </span>
              </h3>
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
               <div style={{ width: '100%', height: '256px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                  <img 
                    src={getImageUrl(selectedImage.image_path)} 
                    alt="Scan Full" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
               </div>
               
               <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{selectedImage.disease_name}</h4>
               
               <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#6B7280' }}>Độ tin cậy (Confidence)</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{(selectedImage.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '8px' }}>
                    <div 
                      style={{ backgroundColor: 'var(--color-primary)', height: '8px', borderRadius: '9999px', width: `${selectedImage.confidence * 100}%` }}
                    ></div>
                  </div>
               </div>

               <div>
                 <h5 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lời khuyên / Đề xuất:</h5>
                 <p style={{ color: '#111827', lineHeight: '1.6', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid #F3F4F6', margin: 0 }}>
                   {selectedImage.recommendation || 'Không có đề xuất cụ thể.'}
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
