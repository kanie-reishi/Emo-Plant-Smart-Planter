from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
import shutil

from database import get_db
from models import SensorReading, PlantSettings, AIDiagnosis

from ai_model import predict_image 

router = APIRouter()

# --- SECURITY ---
# Trong hệ thống thực tế, nên đưa HARDWARE_SECRET_KEY vào biến môi trường (.env)
HARDWARE_SECRET_KEY = os.environ.get("HARDWARE_SECRET_KEY", "EmoPlant_ESP32_SecretKey_2026")

def verify_hardware_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    if token != HARDWARE_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid Hardware Token")
    return True
# ----------------

class TelemetryData(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    light_level: float
    water_level: float

@router.post("/telemetry", summary="Nhận dữ liệu từ ESP32 Sensor Node")
def receive_telemetry(data: TelemetryData, db: Session = Depends(get_db), authorized: bool = Depends(verify_hardware_token)):
    """
    ESP32 Sensor Node gọi API này để gửi dữ liệu cảm biến.
    Trả về cấu hình hiện tại và lệnh đóng/cắt bơm nếu cần.
    """
    # 1. Lưu dữ liệu cảm biến vào DB
    reading = SensorReading(
        temperature=data.temperature,
        humidity=data.humidity,
        soil_moisture=data.soil_moisture,
        light_level=data.light_level,
        water_level=data.water_level,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(reading)
    db.commit()

    # 2. Lấy cài đặt hệ thống (Ngưỡng tưới tự động, lệnh tưới thủ công)
    settings = db.query(PlantSettings).first()
    
    # 3. Tính toán xem có cần bật bơm không
    pump_action = "off"
    duration = 0
    
    # Mặc định, nếu hệ thống được ấn nút "Bơm thủ công" từ Web
    # Để làm điều này, ta có thể thêm 1 trường manual_pump_duration vào PlantSettings
    # Nhưng tạm thời ta xử lý tưới tự động (Auto-water)
    if settings and settings.auto_water_enabled:
        if data.soil_moisture < settings.moisture_threshold_low:
            pump_action = "on"
            duration = 5 # Bơm 5 giây
    
    # TODO: Thêm logic đọc lệnh bơm thủ công từ DB

    return {
        "status": "success",
        "pump_action": pump_action,
        "duration_seconds": duration
    }

@router.post("/camera", summary="Nhận ảnh từ ESP32-CAM")
async def receive_camera_image(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db), authorized: bool = Depends(verify_hardware_token)):
    """
    ESP32-CAM gửi ảnh qua dạng Multipart form-data.
    Lưu ảnh và gọi AI phân tích.
    """
    # 1. Tạo tên file duy nhất và lưu ảnh
    upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"esp32cam_{timestamp_str}.{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    
    image_bytes = await file.read()
    with open(filepath, "wb") as buffer:
        buffer.write(image_bytes)
        
    # 2. Gọi AI model
    ai_model = request.app.state.ai_model
    result = predict_image(ai_model, image_bytes)
    
    # 3. Lưu vào DiagnosisHistory
    diagnosis = AIDiagnosis(
        image_path=f"/uploads/{filename}",
        disease_name=result.get("disease_name", "Unknown"),
        confidence=result.get("confidence", 0.0),
        is_healthy="Khỏe mạnh" in result.get("disease_name", "Unknown"),
        recommendation=result.get("recommendation", ""),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(diagnosis)
    db.commit()
    
    return {
        "status": "success", 
        "filename": filename, 
        "ai_result": result
    }
