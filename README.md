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

## 🚀 Cách Test Thử (Workflow)
Để team có thể test luồng đầy đủ từ giao diện đến AI:
1. Mở 2 Tab Terminal song song trong VS Code.
2. **Terminal 1:** Chạy thư mục `web-demo` bằng lệnh `npm run dev`.
3. **Terminal 2:** Chạy thư mục `backend` bằng lệnh `python main.py`.
4. Mở trình duyệt vào trang Web Demo (`http://localhost:5173`).
5. Tải lên một bức ảnh cây trồng (như lá cà chua đốm, lá táo bệnh) và nhấn "Phân tích". Web sẽ gọi API sang cổng `8000` của Backend để AI xử lý và trả kết quả siêu tốc!
