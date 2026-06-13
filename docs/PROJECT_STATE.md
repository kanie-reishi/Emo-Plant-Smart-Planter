# Smart Planter AI: Project State

## High-Level Roadmap

### Phase 1: Web Dashboard & Mock Data (100% Done)
**Objective**: Xây dựng cơ sở dữ liệu nền tảng, thiết kế API routers, bộ tạo dữ liệu giả lập (mock telemetry) và hoàn thiện giao diện Dashboard Web React.

* **Module 1: Backend Database & Models**: 🟩 Done (SQLAlchemy + SQLite)
* **Module 2: Backend API Routers**: 🟩 Done (Sensor, Diagnosis, Control, Hardware endpoints)
* **Module 3: Mock Data Generator**: 🟩 Done (Giả lập gửi dữ liệu và chụp ảnh tự động)
* **Module 4: Firebase Auth Integration**: 🟩 Done (Tài khoản thử nghiệm admin/user, Google Sign-In)
* **Module 5: Frontend Design System & Layout**: 🟩 Done (Giao diện thiên nhiên, mượt mà)
* **Module 6-10: Web Dashboard, Charts, Camera AI, History, Settings Pages**: 🟩 Done
* **Module 11: Firebase Cloud Messaging (FCM)**: 🟩 Done (Sẵn sàng gửi tin nhắn đẩy trên Backend)

---

### Phase 2: ESP32 Hardware Integration & Flutter Companion App (90% Done)
**Objective**: Thay thế bộ tạo dữ liệu giả lập bằng mạch ESP32 thực tế và tích hợp Companion App trên thiết bị di động.

* **Mạch Cảm Biến & Bơm (Sensor Node - ESP32)**:
  * Viết code C++ đọc cảm biến DHT11, độ ẩm đất, mực nước, ánh sáng và điều khiển Relay: 🟩 Done
  * Nạp và kiểm tra thực tế: 🟨 In Progress (Đang chờ nạp code lên mạch thực tế khi chuẩn bị đầy đủ phần cứng)
* **Mạch Camera & Phân tích AI (Camera Node - ESP32-CAM)**:
  * Cấu hình chân camera, kết nối WiFi nội bộ, tắt brownout detector: 🟩 Done
  * Chụp ảnh và upload Multipart Form-Data thành công lên Backend: 🟩 Done
* **Mobile Companion App (Flutter)**:
  * Khởi tạo dự án, GoRouter Shell & Navigation: 🟩 Done
  * Giao diện Dashboard hiển thị biểu cảm cây động (Vui, buồn, nóng) theo thời gian thực: 🟩 Done
  * Gọi API Polling định kỳ mỗi 5s qua Riverpod AsyncNotifier: 🟩 Done
  * Điều khiển bật/tắt máy bơm từ xa đồng bộ qua backend: 🟩 Done
  * Tích hợp chụp ảnh bằng camera di động, gửi lên server chạy AI MobileNetV2 và xem lịch sử chẩn đoán: 🟩 Done
  * Kết nối trang cấu hình cài đặt ngưỡng tưới, tên cây và bật/tắt tự động tưới từ di động (Settings): 🟩 Done

---

## Current Status & Next Steps

### Immediate Next Steps (Các bước tiếp theo)
1. **Nạp code và kiểm tra mạch cảm biến (Sensor Node)**: Nạp và kiểm duyệt thực tế mạch ESP32 Sensor Node khi bạn chuẩn bị đầy đủ linh kiện (DHT11, Cảm biến đất, Relay, Mini Pump).
2. **Triển khai thực tế trên thực địa (Production Deploy)**: Đưa FastAPI Backend lên Render/Railway và cập nhật các URL endpoints trong code C++ cũng như app Flutter để hoạt động độc lập qua môi trường Internet.
