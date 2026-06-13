# Smart Planter AI: Design State

## 1. High-Level System Architecture

Dự án tuân theo kiến trúc phi tập trung (decoupled) gồm 2 giai đoạn chính, được thiết kế để dễ dàng chuyển dịch từ môi trường giả lập (mock data) sang tích hợp phần cứng thực tế.

```mermaid
graph TD
    subgraph Hardware [Thiết Bị Phần Cứng]
        SN[Sensor Node: ESP32] -->|DHT11/Đất/Ánh Sáng/Nước| HW_API1[POST /api/hardware/telemetry]
        CN[Camera Node: ESP32-CAM] -->|Ảnh chụp lá cây| HW_API2[POST /api/hardware/camera]
    end

    subgraph Backend [Server FastAPI]
        HW_API1 --> Routers
        HW_API2 --> Routers
        Routers --> DB[(Database: SQLite)]
        Routers --> AI[MobileNetV2 AI Engine]
    end

    subgraph Clients [Ứng Dụng Khách]
        WD[Web Dashboard: React] -->|REST API & Polling| Routers
        MA[Mobile Companion App: Flutter] -->|Riverpod Polling & Control| Routers
    end
```

### 1.1. Backend API Server
* **Framework**: Python FastAPI.
* **Database**: SQLite (SQLAlchemy ORM) lưu trữ lịch sử cảm biến, lịch sử tưới nước, kết quả chẩn đoán AI, cấu hình ngưỡng và token người dùng.
* **AI Engine**: PyTorch MobileNetV2 để phân loại và chẩn đoán bệnh lá cây.
* **Bảo mật phần cứng**: Xác thực bằng Hardcoded API Key tĩnh (`Authorization: Bearer EmoPlant_ESP32_SecretKey_2026`).

### 1.2. Mạch Phần Cứng (Phase 2 - 2-Node Architecture)
Để tránh xung đột chân Wi-Fi và bộ đọc ADC2 trên ESP32-CAM, phần cứng được chia làm 2 mạch độc lập:
1. **Sensor Node (ESP32/ESP8266)**: Đọc cảm biến DHT11 (nhiệt độ, độ ẩm), độ ẩm đất (analog), ánh sáng (analog), mực nước (analog) và điều khiển rơ-le kích hoạt Mini Pump 5V.
2. **Camera Node (ESP32-CAM)**: Định kỳ khởi động chụp ảnh lá cây và gửi lên Backend dưới dạng Multipart Form-Data để AI phân tích.

### 1.3. Giao diện (Frontend Clients)
* **Web Dashboard**: Ứng dụng React (Vite) hiển thị thông số cảm biến, lịch sử biểu đồ, thư viện chẩn đoán hình ảnh và cấu hình cài đặt.
* **Mobile App**: Ứng dụng Flutter + Riverpod quản lý trạng thái, định kỳ poll API `/api/sensor/latest` mỗi 5s và gửi lệnh tưới cây từ xa qua `/api/pump/toggle`.

---

## 2. API Data Flow (Luồng Dữ Liệu)

### 2.1. Đọc và tải dữ liệu cảm biến (Sensor Telemetry)
1. **Sensor Node** đọc cảm biến -> `POST /api/hardware/telemetry` kèm Auth Header.
2. **Backend** lưu dữ liệu vào bảng `sensor_readings`.
3. **Backend** kiểm tra xem có cần bật bơm tự động không (so sánh độ ẩm đất hiện tại với ngưỡng `moisture_threshold_low` trong `PlantSettings`).
4. **Backend** trả về JSON cấu hình bơm (VD: `{"pump_action": "on", "duration_seconds": 5}`).
5. **Sensor Node** nhận phản hồi và kích hoạt rơ-le bơm nước theo thời gian yêu cầu.

### 2.2. Chụp ảnh & Chẩn đoán AI (AI Diagnosis)
1. **Camera Node** chụp ảnh -> `POST /api/hardware/camera` gửi file ảnh JPEG dạng multipart.
2. **Backend** lưu ảnh vào thư mục `/uploads/`.
3. **Backend** gọi mô hình MobileNetV2 đã tải sẵn để phân tích hình ảnh và trả về tên bệnh, độ tin cậy (confidence), cùng gợi ý chăm sóc cây.
4. Ghi kết quả vào bảng `ai_diagnoses` và hiển thị lên giao diện Web/Mobile.

### 2.3. Điều khiển máy bơm thủ công (Manual Remote Watering)
1. **User** ấn nút "Tưới nước" trên Web/Mobile -> `POST /api/pump/toggle?action=on&duration_seconds=10`.
2. **Backend** đặt cờ trạng thái bơm thành hoạt động và ghi nhận sự kiện tưới nước cục bộ.
3. Ở lần gửi telemetry tiếp theo, **Sensor Node** nhận phản hồi từ Backend yêu cầu bật bơm và thực hiện tại vòi.

---

## 3. UI/UX Design System (Hệ thống thiết kế)
* **Chủ đề (Theme)**: Lấy cảm hứng từ thiên nhiên (Nature-inspired), sạch sẽ, hiện đại. Tông màu chính là Xanh lá cây tự nhiên (Green Palette), kết hợp với phong cách Glassmorphism.
* **Mobile Dashboard**:
  * Hiển thị avatar cảm xúc động của cây dựa trên chỉ số thực tế:
    * Khát nước 😢: Độ ẩm đất < 30%.
    * Quá nóng 🥵: Nhiệt độ khí >= 35°C.
    * Khỏe mạnh 😊: Điều kiện lý tưởng.
  * Các thẻ đo lường cảm biến được thiết kế với thanh tiến trình trực quan.
  * Nút điều khiển máy bơm nhấp nháy phát sáng (pulsing wave animation) biểu thị trạng thái đang hoạt động.
