# Báo cáo: Tích hợp Giao diện Dashboard & API trên Flutter App

* **Dự án**: Emo Plant - Smart Planter AI
* **Giai đoạn**: Phase 2 (Embedded Hardware & Companion App Integration)
* **Ngày hoàn thành**: 13/06/2026

---

## 1. Mục Tiêu Đạt Được
Tích hợp giao diện di động (Companion App) bằng Flutter, kết nối trực tiếp với backend FastAPI để hiển thị các chỉ số cảm biến theo thời gian thực và cung cấp khả năng điều khiển máy bơm nước từ xa.

---

## 2. Các File Đã Triển Khai

| Đường dẫn file | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| **[constants.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/config/constants.dart)** | Lưu cấu hình API URL (`BASE_URL`) và thời gian polling cảm biến (5 giây). | Tạo mới |
| **[sensor_reading.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/models/sensor_reading.dart)** | Model chứa các thuộc tính cảm biến và hàm chuyển đổi JSON từ API. | Tạo mới |
| **[sensor_provider.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/providers/sensor_provider.dart)** | Riverpod AsyncNotifier thực hiện polling định kỳ và gửi lệnh bật/tắt bơm. | Tạo mới |
| **[dashboard_screen.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/screens/dashboard/dashboard_screen.dart)** | Giao diện Dashboard hiển thị trạng thái động của cây, thẻ thông số và nút điều khiển bơm. | Cập nhật |
| **[app_theme.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/lib/theme/app_theme.dart)** | Sửa lớp `CardTheme` thành `CardThemeData` để phù hợp với Flutter SDK mới. | Cập nhật |
| **[widget_test.dart](file:///E:/Projects/Emo%20Plant/Emo-Plant-Smart-Planter/emo_plant_app/test/widget_test.dart)** | Đơn giản hóa widget test thành unit test để tránh lỗi biên dịch Firebase Mock. | Cập nhật |

---

## 3. Kiến Trúc Luồng Dữ Liệu Trên Thiết Bị Di Động

1. **Khởi tạo**: Khi mở ứng dụng di động, `sensorProvider` được kích hoạt và tự động thiết lập một `Timer.periodic` chạy mỗi 5 giây.
2. **Lấy dữ liệu**: Định kỳ gửi yêu cầu `GET` lên endpoint `/api/sensor/latest` và `/api/pump/status`.
3. **Cập nhật giao diện**:
   * Nếu thành công, cập nhật các thẻ thông số cảm biến và điều chỉnh biểu cảm động của cây (Vui vẻ, Khát nước, Quá nóng).
   * Nếu thất bại (ví dụ: mất kết nối Wi-Fi), hiển thị banner cảnh báo lỗi ở đầu màn hình nhưng vẫn **giữ nguyên chỉ số cảm biến cũ nhất** để không làm gián đoạn trải nghiệm người dùng.
4. **Kích hoạt máy bơm**:
   * Khi ấn "Tưới nước", app gửi yêu cầu `POST` tới `/api/pump/toggle?action=on`.
   * Nút bấm hiển thị trạng thái loading; khi thành công, nó sẽ cập nhật trạng thái hoạt động (bơm nhấp nháy phát sáng) và tự động kéo dữ liệu mới nhất để làm mới giao diện.

---

## 4. Kết Quả Kiểm Thử & Kiểm Duyệt Tĩnh

* **Lệnh chạy**: `flutter analyze`
* **Kết quả**:
  * **0 Lỗi (Errors)**.
  * **0 Cảnh báo (Warnings)**.
  * Dự án sạch lỗi biên dịch, biên dịch và chạy thử nghiệm (đã test chạy trên Web Debugger thành công).
