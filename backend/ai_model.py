import time
import random
import os
import io
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = 'mobilenetv2_ornamental.pth'
CLASS_INDICES_PATH = 'class_indices.json'

def get_class_mapping():
    try:
        with open(CLASS_INDICES_PATH, "r", encoding="utf-8") as f:
            classes = json.load(f)
            return {int(k): v for k, v in classes.items()}
    except Exception as e:
        print(f"[!] Khong the doc {CLASS_INDICES_PATH}: {e}")
        return {}

CLASS_MAPPING_DYNAMIC = get_class_mapping()

def load_model():
    """
    Hàm nạp mô hình PyTorch vào bộ nhớ. Nếu chưa có file weights thì dùng Mock mode.
    """
    global CLASS_MAPPING_DYNAMIC
    CLASS_MAPPING_DYNAMIC = get_class_mapping()
    num_classes = len(CLASS_MAPPING_DYNAMIC) if len(CLASS_MAPPING_DYNAMIC) > 0 else 38
    
    if os.path.exists(MODEL_PATH):
        print(f"[*] Dang tai AI Model PyTorch tu {MODEL_PATH} (Số class: {num_classes})...")
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        model = models.mobilenet_v2()
        model.classifier[1] = nn.Linear(model.last_channel, num_classes)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
        model.to(device)
        return {"type": "pytorch", "model": model, "device": device, "num_classes": num_classes}
    else:
        print("[!] Khong tim thay file model trong so (.pth). Dang chay Mock Mode...")
        return {"type": "mock"}

def get_recommendation(disease_name: str) -> str:
    """Sinh khuyến nghị dựa trên tên bệnh (hoặc trả về mặc định)."""
    d_lower = disease_name.lower()
    if "healthy" in d_lower or "khỏe mạnh" in d_lower:
        return "Tuyệt vời! Cây của bạn đang rất khỏe. Hãy tiếp tục chăm sóc tốt."
    elif "spot" in d_lower or "đốm" in d_lower:
        return "Nghi ngờ có đốm lá nấm/vi khuẩn. Hãy cắt bỏ lá bệnh, phun thuốc diệt nấm và giữ lá khô thoáng."
    elif "rust" in d_lower or "rỉ sắt" in d_lower:
        return "Bệnh rỉ sắt. Cần phun thuốc đặc trị rỉ sắt và cách ly cây bệnh."
    elif "blight" in d_lower or "cháy lá" in d_lower:
        return "Nghi ngờ bệnh cháy lá. Vui lòng ngắt bỏ phần bệnh và tránh tưới nước lên lá."
    elif "wilt" in d_lower or "héo" in d_lower:
        return "Cây có dấu hiệu héo úa. Kiểm tra lại hệ thống rễ và điều chỉnh lượng nước."
    else:
        return "Phát hiện dấu hiệu bất thường. Cần theo dõi thêm và điều chỉnh lượng nước, ánh sáng phù hợp."

def predict_image(model_info: dict, image_bytes: bytes) -> dict:
    """
    Hàm xử lý ảnh đầu vào và trả về dự đoán từ mô hình (hoặc Mock).
    """
    if model_info["type"] == "mock":
        time.sleep(1.5)
        # Nếu đang ở mock mode mà có CLASS_MAPPING_DYNAMIC thì lấy random
        if CLASS_MAPPING_DYNAMIC:
            mock_idx = random.choice(list(CLASS_MAPPING_DYNAMIC.keys()))
            disease_name = CLASS_MAPPING_DYNAMIC[mock_idx]
        else:
            disease_name = "Cây cảnh - Khỏe mạnh"
            
        confidence = round(random.uniform(0.75, 0.99), 4)
        return {
            "disease_name": disease_name,
            "confidence": confidence,
            "recommendation": get_recommendation(disease_name)
        }
    
    model = model_info["model"]
    device = model_info["device"]

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(tensor)
            
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
            idx = predicted_idx.item()
            conf_val = round(confidence.item(), 4)

            if idx in CLASS_MAPPING_DYNAMIC:
                disease_name = CLASS_MAPPING_DYNAMIC[idx]
            else:
                disease_name = f"Unknown (Class {idx})"

            return {
                "disease_name": disease_name,
                "confidence": conf_val,
                "recommendation": get_recommendation(disease_name)
            }
            
    except Exception as e:
        print(f"[X] Loi xu ly anh AI: {e}")
        return {
            "disease_name": "Lỗi phân tích",
            "confidence": 0.0,
            "recommendation": f"Đã xảy ra lỗi: {str(e)}"
        }
