from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ai_model import load_model, predict_image
import uvicorn

app = FastAPI(title="Smart Planter AI API", description="API phân tích bệnh lá cây", version="1.0")

# Cấu hình CORS (Cross-Origin Resource Sharing)
# Rất quan trọng: cho phép Frontend React (chạy cổng 5173) gọi đến Backend (cổng 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong production nên set thành domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nạp model ngay khi server khởi động để tối ưu tốc độ response
ai_model = load_model()

@app.get("/")
def read_root():
    """API Health Check"""
    return {"status": "success", "message": "Smart Planter AI Server is running!"}

@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    """
    Endpoint nhận file ảnh dạng multipart/form-data và trả về kết quả dự đoán bệnh.
    """
    # Đọc dữ liệu thô của file ảnh
    image_bytes = await file.read()
    
    # Gửi qua module AI để phân tích
    result = predict_image(ai_model, image_bytes)
    
    return result

if __name__ == "__main__":
    # Điểm khởi chạy server
    print("🚀 Khởi động Backend API Server tại http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
