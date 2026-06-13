# Báo cáo: Tích hợp Camera & Chẩn đoán AI trên Flutter App

* **Dự án**: Emo Plant - Smart Planter AI
* **Giai đoạn**: Phase 2 (Embedded Hardware & Companion App Integration)
* **Ngày hoàn thành**: 13/06/2026

---

## 1. Mục Tiêu Đạt Được
Tích hợp khả năng chụp ảnh lá cây bằng camera của điện thoại (hoặc tải lên từ thư viện ảnh), gửi hình ảnh dạng byte lên server FastAPI chạy mô hình phân tích AI MobileNetV2, trả về tên bệnh của cây, độ tin cậy và gợi ý chữa trị, đồng thời hiển thị lịch sử chẩn đoán dưới dạng danh sách chuyên nghiệp.

---

## 2. Các File Đã Triển Khai

| Đường dẫn file | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| **[diagnosis_result.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/models/diagnosis_result.dart)** | Model chứa các trường của kết quả chẩn đoán chậu cây. | Tạo mới |
| **[diagnosis_provider.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/providers/diagnosis_provider.dart)** | Quản lý lịch sử chẩn đoán qua Riverpod Notifier, thực hiện gọi API upload ảnh đa nền tảng (Web và Mobile). | Tạo mới |
| **[camera_screen.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/screens/camera/camera_screen.dart)** | Thiết kế giao diện tab Camera/Chẩn đoán, hỗ trợ chụp ảnh, màn hình loading khi AI phân tích và hiển thị chi tiết kết quả. | Cập nhật |

---

## 3. Kiến Trúc Luồng Phân Tích & Upload Đa Nền Tảng

Do ứng dụng Flutter cần chạy thử nghiệm trên cả Web Debugger (Chrome) và Emulator/Physical devices, luồng nạp ảnh được thiết kế dưới dạng truyền byte (byte streams):
1. **Chụp/Chọn ảnh**: Dùng package `image_picker` trả về đối tượng `XFile`.
2. **Đọc mảng byte**: Thay vì lấy đường dẫn file (sẽ bị lỗi bảo mật blob trên Web), app gọi `xFile.readAsBytes()` để chuyển đổi hình ảnh thành mảng bytes.
3. **Multipart Request**: Gửi HTTP POST dạng `multipart/form-data` lên `/api/diagnose`.
4. **Hiển thị Overlay**: Trong khi request đang chạy, ứng dụng hiển thị một màn hình phủ mờ (overlay loading) thông báo "AI Đang Phân Tích Lá Cây..." để tăng cường trải nghiệm người dùng.
5. **Hiển thị Kết Quả**:
   * Khi server trả về dữ liệu chẩn đoán (JSON), app tự động giải mã thành `DiagnosisResult` và đẩy vào đầu danh sách lịch sử.
   * Đồng thời, mở một Dialog hiển thị ảnh chụp lá, nhãn bệnh (màu đỏ nếu có bệnh, xanh nếu khỏe mạnh), độ tin cậy phần trăm và lời khuyên điều trị cụ thể từ AI.

---

## 4. Kết Quả Kiểm Thử & Kiểm Duyệt Tĩnh

* **Lệnh chạy**: `flutter analyze`
* **Kết quả**:
  * **0 Lỗi (Errors)**.
  * **0 Cảnh báo (Warnings)**.
  * Ứng dụng di động đã hoàn tất kiểm tra cú pháp và loại trừ toàn bộ xung đột kiểu dữ liệu hay lỗi cấu trúc Riverpod.
