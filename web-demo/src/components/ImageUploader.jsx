import React, { useState, useRef } from 'react';

const ImageUploader = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      alert("Vui lòng chọn một file ảnh hợp lệ (jpg, png,...).");
      return;
    }
    
    // Đọc ảnh để hiển thị preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Truyền file thật lên component cha
    onImageSelected(file);
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="glass-card">
      {!previewUrl ? (
        <div 
          className={`uploader ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            ref={inputRef}
            type="file" 
            className="file-input" 
            accept="image/*" 
            onChange={handleChange} 
            disabled={isLoading}
          />
          {/* Upload Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>

          <p className="uploader-text">Kéo thả ảnh lá cây vào đây</p>
          <p className="uploader-subtext">hoặc click để chọn từ thiết bị</p>
        </div>
      ) : (
        <div>
          <div className="preview-container">
            <img src={previewUrl} alt="Bản xem trước" className="preview-image" />
          </div>
          <button 
            className="btn" 
            onClick={() => setPreviewUrl(null)}
            disabled={isLoading}
            style={{backgroundColor: 'transparent', border: '1px solid var(--emerald-primary)', color: 'var(--emerald-primary)'}}
          >
            Chọn ảnh khác
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
