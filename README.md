# Emo Plant - Smart Planter AI 🌿

Dự án Chậu cây cảnh thông minh tích hợp Trí tuệ Nhân tạo (AI) giúp nhận diện và chẩn đoán sức khỏe cây trồng theo thời gian thực.

Dự án bao gồm 2 phần chính:
- **Frontend (`web-demo`)**: Giao diện người dùng chạy bằng Vite/React.
- **Backend (`backend`)**: API server chạy bằng FastAPI và AI Model bằng PyTorch.

Dưới đây là hướng dẫn chi tiết dành cho các thành viên trong nhóm để cài đặt môi trường và chạy thử dự án từ con số 0.

---

## 🛠 Phần 1: Cài đặt và chạy Frontend (Web Demo)

Giao diện web yêu cầu **Node.js** và **npm**. Để quản lý phiên bản Node.js dễ dàng và tránh lỗi xung đột, chúng ta sẽ dùng **NVM (Node Version Manager)**.

### 1. Cài đặt NVM và Node.js
* **Đối với Windows:**
  1. Tải file `nvm-setup.exe` bản mới nhất từ trang chủ: [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases).
  2. Cài đặt như một phần mềm bình thường.
  3. Mở Terminal (hoặc CMD/PowerShell quyền Admin) và gõ lệnh sau để cài đặt bản Node.js LTS (ổn định nhất):
     ```bash
     nvm install lts
     nvm use lts
     ```
  4. Kiểm tra xem đã cài thành công chưa: `node -v` và `npm -v`.

* **Đối với MacOS/Linux:**
  1. Mở Terminal và chạy lệnh:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     ```
  2. Khởi động lại Terminal, sau đó cài Node:
     ```bash
     nvm install --lts
     nvm use --lts
     ```

### 2. Chạy Giao diện Web
1. Mở Terminal trong VS Code.
2. Di chuyển vào thư mục web:
   ```bash
   cd web-demo
   ```
3. Cài đặt các thư viện (chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
4. Khởi động Web Server:
   ```bash
   npm run dev
   ```
5. Bấm vào link `http://localhost:5173` (hoặc URL mà terminal báo) để xem web.

---

## 🧠 Phần 2: Cài đặt và chạy Backend (AI Model)

Backend được viết bằng Python và sử dụng framework PyTorch để chạy mạng nơ-ron MobileNetV2, kết hợp với FastAPI để làm API Server.

### 1. Cài đặt Python
1. Tải và cài đặt **Python** (Khuyên dùng bản 3.10 đến 3.12) từ trang chủ: [python.org](https://www.python.org/downloads/).
2. **Lưu ý quan trọng trên Windows:** Nhớ tích vào ô **"Add Python to PATH"** ở ngay màn hình cài đặt đầu tiên.

### 2. Khởi tạo môi trường ảo (Virtual Environment - Khuyên dùng)
Việc này giúp các thư viện của dự án không bị xung đột với các dự án khác trên máy.
1. Mở Terminal mới, di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo môi trường ảo có tên là `venv`:
   ```bash
   python -m venv venv
   ```
3. Kích hoạt môi trường ảo:
   - **Windows:** `.\venv\Scripts\activate`
   - **MacOS/Linux:** `source venv/bin/activate`

### 3. Cài đặt PyTorch và Thư viện Backend
*Máy tính có Card rời NVIDIA (hỗ trợ CUDA) sẽ chạy AI nhanh hơn hàng chục lần so với CPU.*

1. **Cài đặt PyTorch:**
   - Nếu máy có **Card đồ họa NVIDIA** (RTX 3050, 4060, v.v.):
     ```bash
     pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
     ```
     *(Tuỳ thuộc vào Python version có thể dùng cu118 hoặc cu130)*
   - Nếu máy **không có Card NVIDIA (dùng CPU/Macbook):**
     ```bash
     pip install torch torchvision torchaudio
     ```

2. **Cài đặt các framework API (FastAPI, Uvicorn, Pillow...):**
   ```bash
   pip install fastapi uvicorn python-multipart Pillow
   ```
   *(Hoặc nếu có file requirements: `pip install -r requirements.txt`)*

### 4. Chạy Backend Server
Đảm bảo bạn vẫn đang ở trong thư mục `backend` và đã kích hoạt `venv`. Chạy lệnh:
```bash
python main.py
```
*Hoặc: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`*

Nếu Terminal in ra `🚀 Khởi động Backend API Server tại http://localhost:8000`, xin chúc mừng! Backend và AI đã sẵn sàng.

---

## 📱 Phần 3: Cài đặt và chạy Mobile Companion App (Flutter)

Ứng dụng di động được viết bằng **Flutter** và quản lý trạng thái bằng **Riverpod**.

### 1. Yêu cầu hệ thống
* Đã cài đặt **Flutter SDK** (bản mới nhất).
* Điện thoại Android/iOS thật hoặc máy ảo (Emulator).

### 2. Khởi chạy ứng dụng
1. Di chuyển vào thư mục ứng dụng:
   ```bash
   cd emo_plant_app
   ```
2. Cài đặt các package Dart/Flutter:
   ```bash
   flutter pub get
   ```
3. Chạy ứng dụng trên máy ảo/thiết bị thật:
   ```bash
   flutter run
   ```
* Lưu ý: Mặc định `BASE_URL` của API được cấu hình trong [constants.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/config/constants.dart). Bạn có thể đổi sang IP LAN của máy tính khi chạy bằng điện thoại thật.

---

## 🔌 Phần 4: Firmware ESP32 & ESP32-CAM

Mã nguồn nhúng chạy trên nền tảng **PlatformIO (VS Code)**.

### 1. Cấu trúc
* **`esp32_firmware/camera_node/`**: Mạch ESP32-CAM chuyên chụp ảnh lá gửi lên backend chẩn đoán AI.
* **`esp32_firmware/sensor_node/`**: Mạch ESP32 thông thường thu thập thông số cảm biến đất, không khí và điều khiển Relay máy bơm.

### 2. Cài đặt & Flash mạch
1. Mở thư mục node tương ứng trong VS Code (đã cài extension **PlatformIO IDE**).
2. Tạo file `config.h` từ file mẫu `config.example.h` trong thư mục `src/`.
3. Cập nhật tên WiFi, mật khẩu và IP backend của bạn trong file `config.h` mới tạo.
4. Nhấn nút **Build** và **Upload** trên thanh công cụ PlatformIO để nạp code cho mạch.

---

## 🚀 Cách Test Thử (Workflow)
Để team có thể test luồng đầy đủ từ thiết bị, di động đến AI:
1. Chạy FastAPI backend trong thư mục `backend`.
2. Khởi chạy ứng dụng Web Demo (`web-demo`) hoặc Mobile App (`emo_plant_app`).
3. Khởi chạy mạch ESP32 (hoặc chạy file giả lập `backend/mock_generator.py`).
4. Các chỉ số cảm biến và ảnh chụp chẩn đoán sẽ tự động đồng bộ thời gian thực lên Dashboard Web/Mobile!

