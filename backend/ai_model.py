import time
import random
import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Ánh xạ 38 loại bệnh của PlantVillage
CLASS_MAPPING = {
    0: {"name": "Táo - Bệnh vảy nến (Apple Scab)", "recommendation": "Sử dụng thuốc diệt nấm (fungicide), cắt tỉa cành thông thoáng và dọn sạch lá rụng."},
    1: {"name": "Táo - Bệnh thối đen (Apple Black Rot)", "recommendation": "Cắt bỏ các bộ phận bị bệnh, đốt bỏ. Phun thuốc diệt nấm gốc đồng."},
    2: {"name": "Táo - Bệnh rỉ sắt (Apple Cedar Rust)", "recommendation": "Cách ly cây khỏi ký chủ trung gian (cây bách hương). Phun thuốc diệt nấm dự phòng."},
    3: {"name": "Táo - Khỏe mạnh (Apple Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe. Hãy tiếp tục duy trì độ ẩm và ánh sáng tốt."},
    4: {"name": "Việt quất - Khỏe mạnh (Blueberry Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe. Hãy tiếp tục duy trì độ ẩm ở mức tối ưu."},
    5: {"name": "Anh đào - Bệnh phấn trắng (Cherry Powdery Mildew)", "recommendation": "Giảm độ ẩm, tăng độ thông thoáng. Cân nhắc dùng thuốc xịt gốc lưu huỳnh."},
    6: {"name": "Anh đào - Khỏe mạnh (Cherry Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    7: {"name": "Ngô - Bệnh đốm xám (Corn Gray Leaf Spot)", "recommendation": "Sử dụng giống kháng bệnh, luân canh cây trồng và phun thuốc diệt nấm khi cần thiết."},
    8: {"name": "Ngô - Bệnh rỉ sắt chung (Corn Common Rust)", "recommendation": "Sử dụng giống kháng bệnh, phun thuốc diệt nấm sớm nếu phát hiện bào tử rỉ sắt."},
    9: {"name": "Ngô - Bệnh cháy lá phương Bắc (Corn Northern Leaf Blight)", "recommendation": "Quản lý tàn dư cây trồng, sử dụng thuốc diệt nấm để kiểm soát lây lan."},
    10: {"name": "Ngô - Khỏe mạnh (Corn Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    11: {"name": "Nho - Bệnh thối đen (Grape Black Rot)", "recommendation": "Thu gom và tiêu hủy trái/lá bị nhiễm, phun thuốc diệt nấm gốc đồng."},
    12: {"name": "Nho - Bệnh sởi đen (Grape Esca)", "recommendation": "Loại bỏ và tiêu hủy phần thân cây bị nhiễm, bảo vệ các vết cắt tỉa."},
    13: {"name": "Nho - Bệnh cháy lá (Grape Leaf Blight)", "recommendation": "Đảm bảo thông gió tốt trong giàn nho, phun thuốc trừ nấm thích hợp."},
    14: {"name": "Nho - Khỏe mạnh (Grape Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    15: {"name": "Cam quýt - Bệnh vàng lá gân xanh (Citrus Greening)", "recommendation": "Bệnh do rầy chổng cánh truyền. Cần nhổ bỏ cây bệnh, kiểm soát côn trùng môi giới."},
    16: {"name": "Đào - Bệnh đốm vi khuẩn (Peach Bacterial Spot)", "recommendation": "Sử dụng thuốc kháng khuẩn (gốc đồng hoặc oxytetracycline) vào mùa xuân."},
    17: {"name": "Đào - Khỏe mạnh (Peach Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    18: {"name": "Ớt chuông - Bệnh đốm vi khuẩn (Pepper Bacterial Spot)", "recommendation": "Phun thuốc gốc đồng. Loại bỏ ngay cây bị bệnh nặng để tránh lây lan."},
    19: {"name": "Ớt chuông - Khỏe mạnh (Pepper Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    20: {"name": "Khoai tây - Bệnh mốc sương sớm (Potato Early Blight)", "recommendation": "Sử dụng luân canh, đảm bảo cây được bón phân đủ, phun thuốc diệt nấm luân phiên."},
    21: {"name": "Khoai tây - Bệnh mốc sương muộn (Potato Late Blight)", "recommendation": "Rất nguy hiểm! Dùng ngay thuốc diệt nấm đặc trị mốc sương, tiêu hủy tàn dư bệnh."},
    22: {"name": "Khoai tây - Khỏe mạnh (Potato Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    23: {"name": "Mâm xôi - Khỏe mạnh (Raspberry Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    24: {"name": "Đậu nành - Khỏe mạnh (Soybean Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    25: {"name": "Bí ngòi - Bệnh phấn trắng (Squash Powdery Mildew)", "recommendation": "Tăng độ thông thoáng. Dùng dung dịch sinh học trị phấn trắng hoặc thuốc gốc lưu huỳnh."},
    26: {"name": "Dâu tây - Bệnh cháy lá (Strawberry Leaf Scorch)", "recommendation": "Cải thiện lưu thông không khí, loại bỏ tàn dư cây trồng, phun thuốc diệt nấm."},
    27: {"name": "Dâu tây - Khỏe mạnh (Strawberry Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe."},
    28: {"name": "Cà chua - Bệnh đốm vi khuẩn (Tomato Bacterial Spot)", "recommendation": "Phun thuốc gốc đồng. Tránh tưới nước lên mặt lá, giữ vườn thông thoáng."},
    29: {"name": "Cà chua - Bệnh mốc sương sớm (Tomato Early Blight)", "recommendation": "Tỉa bỏ lá dưới gốc, phủ đất bằng màng bọc/rơm để tránh nấm văng lên, phun thuốc phòng."},
    30: {"name": "Cà chua - Bệnh mốc sương muộn (Tomato Late Blight)", "recommendation": "Lây lan nhanh! Tiêu hủy cây bệnh, phun thuốc diệt nấm khẩn cấp."},
    31: {"name": "Cà chua - Bệnh mốc lá (Tomato Leaf Mold)", "recommendation": "Giảm độ ẩm, tăng lưu thông không khí trong nhà màng, dùng thuốc gốc đồng."},
    32: {"name": "Cà chua - Bệnh đốm lá Septoria (Tomato Septoria Leaf Spot)", "recommendation": "Ngắt bỏ lá bệnh phía dưới, luân canh, không làm ướt lá khi tưới."},
    33: {"name": "Cà chua - Nhện đỏ (Tomato Spider Mites)", "recommendation": "Phun xịt nước mạnh hoặc sử dụng dầu Neem/xà phòng diệt côn trùng."},
    34: {"name": "Cà chua - Bệnh đốm vòng (Tomato Target Spot)", "recommendation": "Tăng cường lưu thông khí, phun thuốc trừ nấm phổ rộng."},
    35: {"name": "Cà chua - Virus xoăn vàng lá (Tomato Yellow Leaf Curl Virus)", "recommendation": "Do bọ phấn trắng truyền. Cần kiểm soát bọ phấn, nhổ bỏ cây bệnh để tránh lây lan."},
    36: {"name": "Cà chua - Virus khảm (Tomato Mosaic Virus)", "recommendation": "Không có thuốc chữa. Tiêu hủy cây bệnh, khử trùng dụng cụ cắt tỉa và rửa tay sạch."},
    37: {"name": "Cà chua - Khỏe mạnh (Tomato Healthy)", "recommendation": "Tuyệt vời! Cây của bạn đang rất khỏe. Hãy tiếp tục duy trì độ ẩm đất ở mức 60%."}
}

MODEL_PATH = 'mobilenetv2_plantvillage.pth'

def load_model():
    """
    Hàm nạp mô hình PyTorch vào bộ nhớ. Nếu chưa có file weights thì dùng Mock mode.
    """
    if os.path.exists(MODEL_PATH):
        print(f"[*] Dang tai AI Model PyTorch tu {MODEL_PATH}...")
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        model = models.mobilenet_v2()
        model.classifier[1] = nn.Linear(model.last_channel, 38)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
        model.to(device)
        return {"type": "pytorch", "model": model, "device": device}
    else:
        print("[!] Khong tim thay file model trong so (.pth). Dang chay Mock Mode...")
        return {"type": "mock"}

def predict_image(model_info: dict, image_bytes: bytes) -> dict:
    """
    Hàm xử lý ảnh đầu vào và trả về dự đoán từ mô hình (hoặc Mock).
    """
    if model_info["type"] == "mock":
        time.sleep(1.5)
        # Lấy random một index từ dictionary
        mock_idx = random.choice(list(CLASS_MAPPING.keys()))
        confidence = round(random.uniform(0.75, 0.99), 4)
        return {
            "disease": CLASS_MAPPING[mock_idx]["name"],
            "confidence": confidence,
            "recommendation": CLASS_MAPPING[mock_idx]["recommendation"]
        }
    
    # -------------------------------------------------------------
    # Luồng chạy AI thực tế
    # -------------------------------------------------------------
    model = model_info["model"]
    device = model_info["device"]

    # Transform y hệt tập validation lúc train
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    try:
        # Load và convert ảnh sang RGB
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(device)
        
        # Inference
        with torch.no_grad():
            outputs = model(tensor)
            
            # Tính phần trăm confidence sử dụng Softmax
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
            idx = predicted_idx.item()
            conf_val = round(confidence.item(), 4)

            # Map index qua chuỗi
            if idx in CLASS_MAPPING:
                disease = CLASS_MAPPING[idx]["name"]
                recommendation = CLASS_MAPPING[idx]["recommendation"]
            else:
                disease = f"Unknown (Class {idx})"
                recommendation = "Không có khuyến nghị cho loại hình này."

            return {
                "disease": disease,
                "confidence": conf_val,
                "recommendation": recommendation
            }
            
    except Exception as e:
        print(f"[X] Loi xu ly anh AI: {e}")
        return {
            "disease": "Lỗi phân tích",
            "confidence": 0.0,
            "recommendation": f"Đã xảy ra lỗi: {str(e)}"
        }
