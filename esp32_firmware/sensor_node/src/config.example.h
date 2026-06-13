#ifndef CONFIG_H
#define CONFIG_H

// --- WiFi Configuration ---
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- Backend Configuration ---
// Replace with your FastAPI backend URL (e.g. http://192.168.1.108:8000/api/hardware/telemetry)
const char* BACKEND_URL = "http://YOUR_BACKEND_IP:8000/api/hardware/telemetry";

// Secure token matching HARDWARE_SECRET_KEY on the backend
const char* API_KEY = "YOUR_HARDWARE_SECRET_KEY";

// --- Pin Definitions ---
#define DHT_PIN 4
#define DHT_TYPE DHT11

#define SOIL_MOISTURE_PIN 34
#define WATER_LEVEL_PIN 35
#define LIGHT_SENSOR_PIN 32

#define PUMP_RELAY_PIN 23

// --- Timing ---
const unsigned long TELEMETRY_INTERVAL = 30000; // 30 seconds

#endif
