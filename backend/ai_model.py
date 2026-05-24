import time
import random

# Danh sách các bệnh mẫu (Mock data) dựa trên tập PlantVillage
MOCK_CLASSES = [
    "Khỏe mạnh (Healthy Leaf)", 
    "Đốm lá sương mai (Tomato Blight)", 
    "Đốm vi khuẩn (Pepper Bell Bacterial Spot)",
    "Mốc sương sớm (Potato Early Blight)",
    "Phấn trắng (Powdery Mildew)"
]

def load_model():
    """
    Hàm khởi tạo và nạp mô hình AI vào bộ nhớ.
    Trong giai đoạn demo này, khi mô hình thực tế chưa train xong,
    chúng ta sẽ trả về một object 'Mock' để Web Demo có thể giao tiếp được.
    """
    print("⏳ Loading AI Model (Mock Mode)...")
    
    # -------------------------------------------------------------------
    # [CODE THỰC TẾ TRONG TƯƠNG LAI]
    # Khi bạn đã train xong file 'mobilenetv2_plantvillage.pth', hãy uncomment đoạn này:
    #
    # import torch
    # from torchvision import models, transforms
    # import torch.nn as nn
    # 
    # model = models.mobilenet_v2()
    # model.classifier[1] = nn.Linear(model.last_channel, 38) # 38 classes
    # model.load_state_dict(torch.load('mobilenetv2_plantvillage.pth', map_location='cpu'))
    # model.eval()
    # return model
    # -------------------------------------------------------------------
    
    return "Mock_Model_Object"

def predict_image(model, image_bytes: bytes) -> dict:
    """
    Hàm xử lý ảnh đầu vào và trả về dự đoán từ mô hình.
    """
    # 1. Giả lập độ trễ xử lý (inference time) để mô phỏng giống thật cho Web UI
    time.sleep(1.5)
    
    # -------------------------------------------------------------------
    # [CODE THỰC TẾ TRONG TƯƠNG LAI]
    # image = Image.open(io.BytesIO(image_bytes))
    # transform = transforms.Compose([...])
    # tensor = transform(image).unsqueeze(0)
    # output = model(tensor)
    # ... lấy ra class có score cao nhất ...
    # -------------------------------------------------------------------
    
    # 2. Tạo kết quả ngẫu nhiên để Test UI Frontend
    predicted_class = random.choice(MOCK_CLASSES)
    confidence = round(random.uniform(0.75, 0.99), 4) # Random từ 75% đến 99%
    
    # Sinh lời khuyên dựa trên kết quả
    if "Khỏe mạnh" in predicted_class:
        recommendation = "Tuyệt vời! Cây của bạn đang rất khỏe. Hãy tiếp tục duy trì độ ẩm đất ở mức 60%."
    else:
        recommendation = "Cảnh báo: Cần cách ly lá bệnh, giảm độ ẩm môi trường và cân nhắc sử dụng dung dịch diệt nấm sinh học."
        
    return {
        "disease": predicted_class,
        "confidence": confidence,
        "recommendation": recommendation
    }
