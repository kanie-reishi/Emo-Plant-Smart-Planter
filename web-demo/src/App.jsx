import React, { useState } from 'react';
import axios from 'axios';
import ImageUploader from './components/ImageUploader';
import PredictionResult from './components/PredictionResult';
import './index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setResult(null); // Xóa kết quả cũ khi chọn ảnh mới
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Gọi tới FastAPI Backend đang chạy ngầm ở cổng 8000
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error('Lỗi khi phân tích ảnh:', error);
      alert('Không thể kết nối đến máy chủ AI (http://localhost:8000/predict). Vui lòng đảm bảo Backend FastAPI đang chạy!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Smart Planter AI</h1>
        <p>Hệ thống tự động nhận diện sức khỏe lá cây qua Camera</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={isLoading} 
        />

        {selectedFile && !isLoading && !result && (
          <button className="btn" onClick={handleAnalyze}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '24px', height: '24px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
              </svg>
              Bắt đầu Phân tích AI
            </span>
          </button>
        )}

        {isLoading && (
          <div className="glass-card loader-container">
            <div className="spinner"></div>
            <p className="loading-text">AI đang phân tích cấu trúc mô lá...</p>
          </div>
        )}

        {result && !isLoading && (
          <PredictionResult result={result} />
        )}
      </main>
    </div>
  );
}

export default App;
