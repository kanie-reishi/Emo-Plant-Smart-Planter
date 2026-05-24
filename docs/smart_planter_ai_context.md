# Tài liệu Đặc tả Kiến trúc Hệ thống: Dự án Smart Planter AI

Tài liệu này tổng hợp toàn bộ bối cảnh, các quyết định thiết kế kỹ thuật, kiến trúc phần cứng, phần mềm và cơ khí của dự án **Smart Planter AI**. File markdown này được tối ưu hóa để làm ngữ cảnh đầu vào (Context) cho các AI Agent trên Anti Gravity nhằm tiếp tục phát triển dự án một cách đồng bộ.

---

## 1. Tổng quan Dự án (Project Overview)
* **Tên dự án:** Smart Planter AI (Chậu cây thông minh tích hợp trí tuệ nhân tạo).
* **Mục tiêu:** Xây dựng một hệ thống chậu cây tự động hóa hoàn toàn, có khả năng tự theo dõi độ ẩm đất, tự động tưới nước thông minh bằng thuật toán PWM, đồng thời sử dụng Camera để chụp ảnh và phân tích sức khỏe tán lá, nhận diện sâu bệnh bằng mô hình học máy (AI).
* **Mô hình quản lý:** Dự án được phát triển theo mô hình Agile/Scrum, quản lý toàn diện trên Notion (gồm Master Task List, BOM, Hardware Docs, và Bảng tin Changelog tự động hóa) với lộ trình thực hiện trong vòng 3 tháng.

---

## 2. Kiến trúc Phần cứng & Điện tử (Hardware Architecture)

Hệ thống phần cứng được thiết kế theo dạng **Module-Ready** (sử dụng chân cắm socket/header để kết nối các module thay vì hàn chết, giúp dễ dàng bảo trì và lập trình).

### 2.1 Khối Nguồn (Power Block)
* **Nguồn năng lượng:** Hệ 2 pin Li-ion 18650 mắc nối tiếp (Điện áp tổng 7.4V - 8.4V).
* **Mạch quản lý pin (BMS):** Sử dụng Mạch BMS 2S (8.4V - 3A) hỗ trợ tính năng sạc/xả chung một cổng (Common Port), tự động cân bằng cell (Balancing) và ngắt bảo vệ quá áp/quá cạn.
* **Mạch sạc:** Module sạc pin 2S chuyên dụng (sử dụng chip **IP2326** hoặc **TP5100**), đầu vào nhận nguồn 5V từ cổng USB Type-C rời (Panel Mount) gắn trên thân hộp, tự động kích áp (Boost) để sạc hệ pin 2S qua BMS.
* **Mạch hạ áp (Buck Regulator):** Sử dụng IC nguồn Buck **TPS54302** để hạ áp từ nguồn thô của pin xuống `+5V` ổn định cấp cho toàn hệ thống MCU và động cơ bơm.

### 2.2 Khối Điều khiển Trung tâm (MCU Block)
* **Vi điều khiển:** Module **I/O ESP32-CAM (AI-Thinker)**.
* **Bảo vệ nguồn chống sụt áp (Brownout):** Thiết kế cụm tụ lọc song song gồm **1 tụ hóa/tantalum 220µF** (bù áp tức thời khi bật WiFi/Camera) và **1 tụ gốm 100nF** (lọc nhiễu cao tần), đặt vật lý cực kỳ sát chân nguồn 5V và GND của ESP32-CAM trên PCB.
* **Khối dịch vụ nạp code:** Thiết kế Header 1x05 kết nối chân TXD/RXD (U0R/U0T) ra mạch nạp FTDI ngoài. Thêm một **Jumper 2 chân cho GPIO 0** nối xuống GND để kích hoạt chế độ Flash chương trình.
* **Lưu trữ dữ liệu:** Tận dụng khe cắm **MicroSD Card** tích hợp sẵn trên mạch để ghi nhật ký dữ liệu (Data Logging) khi mất mạng và lưu trữ ảnh gốc.

### 2.3 Khối Chấp hành & Cảm biến (Actuators & Sensors)
* **Mạch lái máy bơm (Pump Driver):** Máy bơm mini 5V DC điều khiển bằng chân **GPIO 13** của ESP32 qua mạch đệm **MOSFET N-Channel (IRLML2502 hoặc AO3400)**. 
    * Chân Gate (G) có trở hạn dòng 220Ω và trở xả kéo xuống mát (Pull-down) 10kΩ để chống tự kích khi MCU khởi động.
    * Bắt buộc tích hợp **Flyback Diode (1N4007 hoặc SS14)** mắc song song ngược đầu với hai cực của máy bơm để triệt tiêu dòng cảm ứng ngược bảo vệ MOSFET.
* **Màn hình hiển thị:** OLED 0.96 inch (giao tiếp I2C, chân SCL nối GPIO 14, SDA nối GPIO 15).
* **Cảm biến độ ẩm đất:** Loại cảm biến điện dung chống ăn mòn (Capacitive Soil Moisture Sensor v1.2), xuất tín hiệu Analog nối vào chân **GPIO 12 (ADC)**.
* **Cụm giao tiếp trên đầu:** Tích hợp 1 Nút nhấn (Button) tại GPIO 4 và 1 Đèn LED trợ sáng tại GPIO 2 để bật/tắt thủ công khi chụp ảnh ban đêm.

---

## 3. Kiến trúc Cơ khí & Chống thấm (Mechanical & Waterproofing)

Sản phẩm áp dụng nguyên lý thiết kế **Trade-off** để tối ưu hóa đồng thời trải nghiệm sạc, góc chụp của Camera và độ an toàn điện tử.

* **Cấu trúc phân khoang dọc (Left-Right Split):** * **Khoang Trái (Khoang ướt):** Chứa đất, cây trồng và máy bơm. Thiết kế nắp mở độc lập hoặc dạng ngăn kéo để tháo lắp chăm sóc cây dễ dàng mà không ảnh hưởng tới phần điện. Đáy khoang có dốc thoát nước ngược hướng khoang điện.
    * **Khoang Phải (Khoang kỹ thuật - Khô):** Kín khí hoàn toàn, chứa mạch PCB đặt thẳng đứng, mạch sạc và hệ pin 18650 đặt ngang ở đáy làm bệ trọng tâm.
* **Định vị PCB dọc (Vertical PCB):** Giúp cổng sạc Type-C hàn trực tiếp trên PCB có thể hướng thẳng ra lỗ khoét thành bên của chậu, đồng thời các giắc cắm dây (JST-XH 2.54mm) hướng lên trên để tạo vòng nhỏ giọt tự nhiên.
* **Tách rời mắt Camera (De-coupled Camera):** Mắt camera được tách khỏi bo mạch PCB chính thông qua một sợi **cáp bẹt FPC 24-pin nối dài (10-15cm)**, luồn lên hệ thống tay treo cơ khí phía trên và cố định ở góc **nghênh nghiêng 45°** để bao quát toàn bộ tán lá cây.
* **Hệ thống Lỗ thông tuyến (Cable Pass-through):** Tất cả các dây tín hiệu (OLED, Camera, Bơm, Cảm biến) luồn qua một lỗ kỹ thuật duy nhất nằm ở vị trí cao nhất trên vách ngăn. Lỗ này được bịt kín bằng **Grommet cao su** và **Keo Silicon/Keo nến**.
* **Chống ẩm thụ động:** Toàn bộ bề mặt bo mạch PCB sau khi hàn xong được phủ một lớp **sơn bảo vệ mạch (Conformal Coating)**. Bên trong khoang kỹ thuật bố trí thêm túi hút ẩm (Silica Gel) và giấy chỉ thị ẩm để kiểm soát rò rỉ sớm.

---

## 4. Kiến trúc Phần mềm & AI (Software & AI Pipeline)

Để tối ưu hóa quá trình phát triển song song (Agile), luồng phần mềm được thiết kế giả lập hoàn chỉnh (Mock Architecture) trước khi tích hợp vào bo mạch thật.

```
[Webcam/Dataset Ảnh] ───> [FastAPI Server (Python)] ───> [AI Model (YOLO/TF)] ───┐
                                                                                 ├──> [Notion API / Web Dashboard]
[Script giả lập Data] ──> [Độ ẩm (%) & Áp Pin (V)] ──────────────────────────────┘
```

* **Local AI Server:** Viết bằng **Python (FastAPI)** đóng vai trò như một API Gateway nhận ảnh gửi lên dưới dạng `FormData`, xử lý bằng OpenCV và đưa qua mô hình phân loại để chẩn đoán sức khỏe lá.
* **Mobile App:** Được phát triển bằng framework đa nền tảng (**Flutter hoặc React Native via Expo**). Giao diện tối giản gồm chức năng mở Camera/Thư viện, gửi ảnh tới endpoint `http://<Server_IP>:8000/predict` và nhận chuỗi JSON kết quả trả về.
* **Giả lập dữ liệu cảm biến (Mock Data Generator):** Một script Python/Node.js chạy ngầm liên tục sinh dữ liệu độ ẩm giảm tuyến tính theo thời gian và tăng vọt khi kích hoạt bơm để kiểm tra logic hiển thị đồ thị và tính năng kết nối của Frontend.

---

## 5. Cấu trúc Phân rã Công việc (WBS) Tổng quát
* **1.0 Project Management:** Thiết lập Dashboard Notion, quản lý BOM, đặt mua vật tư.
* **2.0 Hardware Design:** Vẽ mạch nguyên lý KiCad, thiết kế mạch in PCB đứng lớp phủ đồng GND, đặt hàng gia công ngoài, hàn mạch kiểm tra sụt áp khối nguồn.
* **3.0 Mechanical Design:** Thiết kế SolidWorks khoang Trái-Phải, tính toán FOV của Camera nghiêng 45°, in 3D mẫu thử bằng nhựa PETG, chống thấm vách ngăn và xử lý gioăng nắp.
* **4.0 Software & AI:** Lập trình nhúng (PWM điều tốc bơm, Driver OLED, Sensor), thu thập Dataset lá cây, huấn luyện mô hình nhận diện bệnh, viết Mobile App kết nối qua API.
* **5.0 System Integration:** Luồn dây kẹp ngàm, đi dây Drip Loop, chạy thử nghiệm kiểm tra rò rỉ nước và độ ổn định nguồn liên tục (Burn-in Test).
