# Smart Planter AI: Design State

## 1. High-Level System Architecture

The project follows a decoupled, two-phase architecture designed for scalability from a mock environment to actual hardware integration.

### Phase 1: Web + Mobile App + Mock Data (Current Focus)
- **Web Frontend**: React (Vite) application (`web-demo`). Uses a component-driven design system.
- **Mobile Frontend**: Android Companion App using Flutter and Riverpod (`emo_plant_app`).
- **Backend**: Python FastAPI server (`backend/main.py`).
- **Database**: SQLite (via SQLAlchemy) storing telemetry, diagnosis history, alerts, and user settings.
- **AI Model**: PyTorch MobileNetV2 for plant disease classification.
- **Mock Data Generator**: A background Python process simulating ESP32-CAM sensor data (moisture, temperature) and hardware events.

### Phase 2: ESP32-CAM & Sensor Integration
- **Hardware**: ESP32-CAM module, Capacitive Soil Moisture Sensor, 5V Mini Pump, OLED Display.
- **Communication**: ESP32-CAM communicates with the FastAPI backend via REST (HTTP POST) for telemetry and image uploads.
- **Power**: 2S Li-ion battery pack with BMS and Buck Regulator (5V).

## 2. Data Flow
1. **Sensor Telemetry**: ESP32 (or Mock Generator) -> `POST /api/hardware/telemetry` -> Database -> Frontend (via polling or WebSocket).
2. **AI Diagnosis**: ESP32 captures image -> `POST /api/hardware/upload-image` -> FastAPI Server -> PyTorch Model -> Database (History) -> Frontend.
3. **Pump Control**: Frontend -> `POST /api/control/pump` -> Database -> ESP32 polls state or receives webhook -> Hardware execution.

## 3. UI/UX Design Choices
- **Theme**: Nature-inspired, modern, and clean dashboard.
- **Components**: Reusable cards, modal dialogs, and responsive grid layouts.
- **Data Visualization**: Interactive charts for soil moisture and temperature history.
- **User Alerts**: Real-time toast notifications for critical events (e.g., "Moisture level critically low").
