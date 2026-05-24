import React, { useEffect, useState } from 'react';

const PredictionResult = ({ result }) => {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  if (!result) return null;

  const { disease, confidence, recommendation } = result;
  
  // Xác định xem lá có khỏe mạnh không dựa vào tên class
  const isHealthy = disease.toLowerCase().includes("khỏe mạnh") || disease.toLowerCase().includes("healthy");
  const confidencePercent = Math.round(confidence * 100);

  // Hiệu ứng chạy thanh tiến trình khi component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedConfidence(confidencePercent);
    }, 100); // Đợi render xong rồi mới chạy thanh bar
    return () => clearTimeout(timer);
  }, [confidencePercent]);

  return (
    <div className="glass-card result-section">
      <div className="result-header">
        <h3 className="result-title">Kết quả Chẩn đoán AI</h3>
        <span className={`result-status ${isHealthy ? 'status-healthy' : 'status-disease'}`}>
          {isHealthy ? '✅ Cây Khỏe' : '⚠️ Phát hiện Bệnh'}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
          Tình trạng chi tiết:
        </p>
        <p style={{ 
          fontSize: '1.4rem', 
          fontWeight: '600', 
          color: isHealthy ? 'var(--success)' : 'var(--danger)',
          lineHeight: '1.4'
        }}>
          {disease}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Độ tự tin (Confidence Level):</span>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{animatedConfidence}%</span>
        </div>
        <div className="confidence-bar-container">
          <div 
            className="confidence-bar" 
            style={{ 
              width: `${animatedConfidence}%`, 
              background: isHealthy ? 'var(--success)' : 'var(--danger)' 
            }}
          ></div>
        </div>
      </div>

      <div className="recommendation">
        <h4>💡 Lời khuyên hệ thống:</h4>
        <p>{recommendation}</p>
      </div>
    </div>
  );
};

export default PredictionResult;
