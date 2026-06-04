/**
 * Camera & AI Page — Upload images for PyTorch AI diagnosis
 * Displays current diagnosis result and recent history.
 */

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle, Activity, Image as ImageIcon, Camera } from 'lucide-react';
import { submitDiagnosis, fetchDiagnosisHistory, getImageUrl } from '../api';
import { format } from 'date-fns';

export default function CameraPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchDiagnosisHistory('all', 12);
      setHistory(data);
    } catch (err) {
      console.error('Error loading AI history:', err);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    setPreviewUrl(null);
    try {
      // Simulate by fetching a generic plant image to upload
      const response = await fetch('https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&q=80');
      const blob = await response.blob();
      const simFile = new File([blob], 'simulate_leaf.jpg', { type: 'image/jpeg' });
      setFile(simFile);
      setPreviewUrl(URL.createObjectURL(simFile));
      
      const res = await submitDiagnosis(simFile);
      setResult(res);
      loadHistory();
    } catch (err) {
      console.error('Simulation failed:', err);
      alert('Lỗi khi giả lập chụp ảnh.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await submitDiagnosis(file);
      setResult(res);
      loadHistory(); // Refresh history immediately
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Lỗi phân tích AI. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      
      {/* Page Header */}
      <div className="page-header mb-6">
        <h1 className="page-title">Camera & AI</h1>
        <p className="page-subtitle">Tải ảnh lên để AI phân tích bệnh trên lá cây (PyTorch MobileNetV2)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Upload Section */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4 flex items-center gap-2">
            <Camera size={20} className="text-primary" />
            Kiểm tra sức khỏe cây
          </h3>
          
          <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            {previewUrl ? (
              <div className="relative w-full h-48 mb-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary-pale text-primary rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={32} />
                </div>
                <p className="font-semibold text-text mb-1">Chọn ảnh hoặc chụp ngay</p>
                <p className="text-sm text-muted mb-6">Hỗ trợ định dạng JPG, PNG</p>
              </>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            
            <div className="flex gap-3 mt-auto flex-wrap justify-center">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="btn btn-outline"
                disabled={loading}
              >
                {previewUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên'}
              </button>
              
              {!file && !previewUrl && (
                <button 
                  onClick={handleSimulate}
                  className="btn btn-ghost border border-gray-200"
                  disabled={loading}
                >
                  <Camera size={18} /> Chụp ảnh giả lập
                </button>
              )}
              
              {file && (
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn btn-primary min-w-[140px]"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Activity size={18} /> Phân tích AI</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="card flex flex-col">
          <h3 className="card-title mb-4">Kết quả chẩn đoán</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {!result && !loading && (
              <div className="text-center text-muted">
                <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                <p>Chưa có dữ liệu phân tích.<br/>Vui lòng tải ảnh lên và nhấn "Phân tích AI".</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-primary">
                <div className="w-16 h-16 mx-auto bg-primary-pale rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary opacity-20 animate-pulse"></div>
                   <Activity size={32} className="animate-bounce" />
                </div>
                <p className="font-semibold text-lg">AI đang quét mẫu lá...</p>
                <p className="text-sm text-muted mt-2">MobileNetV2 đang trích xuất đặc trưng hình ảnh</p>
              </div>
            )}

            {result && !loading && (
              <div className="animate-slideUp bg-gray-50 p-6 rounded-lg border border-gray-100 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${result.is_healthy ? 'bg-success-pale text-success' : 'bg-warning-pale text-warning'}`}>
                    {result.is_healthy ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-text mb-1">{result.disease_name}</h4>
                    <span className={`badge ${result.is_healthy ? 'badge-success' : 'badge-warning'}`}>
                      {result.is_healthy ? 'Cây Khỏe Mạnh' : 'Phát Hiện Bệnh'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-text">Độ tin cậy của AI</span>
                    <span className="font-bold text-primary">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-auto">
                  <h5 className="font-semibold text-text mb-2 text-sm uppercase tracking-wide">Lời khuyên / Đề xuất:</h5>
                  <p className="text-muted text-sm leading-relaxed bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                    {result.recommendation || 'Không có đề xuất cụ thể.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      <h3 className="page-title text-xl mb-4">Lịch sử chẩn đoán gần đây</h3>
      
      {history.length === 0 ? (
        <div className="card text-center py-10 text-muted">
          Chưa có lịch sử chẩn đoán nào được ghi nhận trong cơ sở dữ liệu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <div key={item.id} className="card card-sm flex flex-col hover:-translate-y-1 transition-transform">
              <div className="relative w-full h-32 mb-3 bg-gray-100 rounded overflow-hidden">
                <img 
                  src={getImageUrl(item.image_path)} 
                  alt={item.disease_name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                />
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white ${item.is_healthy ? 'bg-success' : 'bg-warning'}`}></div>
              </div>
              <h4 className="font-semibold text-text text-sm line-clamp-1" title={item.disease_name}>
                {item.disease_name}
              </h4>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-primary font-bold">{(item.confidence * 100).toFixed(0)}%</span>
                <span className="text-muted">{format(new Date(item.timestamp), 'dd/MM HH:mm')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
