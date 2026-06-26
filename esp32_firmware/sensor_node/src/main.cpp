#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_GC9A01A.h>
#include <SPI.h>
#include <Wire.h>
#include <BH1750.h>
#include "config.h"
#include "faces.h"

DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

SPIClass hspi(HSPI);
Adafruit_GC9A01A tft = Adafruit_GC9A01A(&hspi, TFT_DC, TFT_CS, TFT_RST);

unsigned long lastTelemetryTime = 0;

float last_temp = 0;
float last_hum = 0;
float last_soil = 0;
float last_light = 0;
float last_water = 0;

enum ScreenMode { MODE_EMO, MODE_TELEMETRY };
ScreenMode currentMode = MODE_EMO;
unsigned long telemetryDisplayStartTime = 0;
const unsigned long TELEMETRY_DISPLAY_DURATION = 10000;
void printCentered(const char* text, int16_t y, uint8_t size, uint16_t color) {
    tft.setTextSize(size);
    tft.setTextColor(color);
    int16_t len = strlen(text);
    int16_t x = 120 - (len * 6 * size) / 2;
    if (x < 0) x = 0;
    tft.setCursor(x, y);
    tft.print(text);
}

void printCentered(String text, int16_t y, uint8_t size, uint16_t color) {
    tft.setTextSize(size);
    tft.setTextColor(color);
    int16_t len = text.length();
    int16_t x = 120 - (len * 6 * size) / 2;
    if (x < 0) x = 0;
    tft.setCursor(x, y);
    tft.print(text);
}

void drawTelemetryScreen() {
    tft.fillScreen(GC9A01A_BLACK);
    
    // Draw decorative border circle
    tft.drawCircle(120, 120, 118, GC9A01A_GREEN);
    
    // Title
    printCentered("Emo Plant Monitor", 25, 1, GC9A01A_GREEN);
    
    // Divider line
    tft.drawFastHLine(40, 42, 160, GC9A01A_WHITE);

    // Temperature & Humidity
    String tempStr = "Temp: " + (isnan(last_temp) ? "ERR" : String(last_temp, 1) + " C");
    printCentered(tempStr, 50, 1, GC9A01A_WHITE);

    String humStr = "Humidity: " + (isnan(last_hum) ? "ERR" : String(last_hum, 1) + " %");
    printCentered(humStr, 65, 1, GC9A01A_WHITE);

    // Soil Moisture Label & Bar
    String soilStr = "Soil: " + String((int)last_soil) + "%";
    printCentered(soilStr, 85, 1, GC9A01A_BLUE);
    tft.drawRect(60, 97, 120, 8, GC9A01A_BLUE);
    int soilBarWidth = (int)(1.2 * last_soil);
    if (soilBarWidth > 120) soilBarWidth = 120;
    if (soilBarWidth < 0) soilBarWidth = 0;
    tft.fillRect(60, 97, soilBarWidth, 8, GC9A01A_BLUE);

    // Light Level Label & Bar
    String lightStr = "Light: " + String((int)last_light) + "%";
    printCentered(lightStr, 115, 1, GC9A01A_YELLOW);
    tft.drawRect(60, 127, 120, 8, GC9A01A_YELLOW);
    int lightBarWidth = (int)(1.2 * last_light);
    if (lightBarWidth > 120) lightBarWidth = 120;
    if (lightBarWidth < 0) lightBarWidth = 0;
    tft.fillRect(60, 127, lightBarWidth, 8, GC9A01A_YELLOW);

    // Water Level Label & Bar
    String waterStr = "Water: " + String((int)last_water) + "%";
    printCentered(waterStr, 145, 1, GC9A01A_CYAN);
    tft.drawRect(60, 157, 120, 8, GC9A01A_CYAN);
    int waterBarWidth = (int)(1.2 * last_water);
    if (waterBarWidth > 120) waterBarWidth = 120;
    if (waterBarWidth < 0) waterBarWidth = 0;
    tft.fillRect(60, 157, waterBarWidth, 8, GC9A01A_CYAN);

    // WiFi status bar at bottom
    tft.drawFastHLine(40, 185, 160, GC9A01A_WHITE);
    if (WiFi.status() == WL_CONNECTED) {
        printCentered("WiFi: Connected", 195, 1, GC9A01A_GREEN);
    } else {
        printCentered("WiFi: Disconnected", 195, 1, GC9A01A_RED);
    }
}

Emotion determineEmotion() {
    if (last_soil < 30.0) return THIRSTY;
    if (last_temp > 30.0) return HOT;
    if (last_temp > 0 && last_temp < 15.0) return COLD;
    if (last_light < 10.0) return SLEEPY;
    return HAPPY;
}

void setupWiFi() {
    Serial.println("Connecting to WiFi...");
    tft.fillScreen(GC9A01A_BLACK);
    tft.drawCircle(120, 120, 118, GC9A01A_GREEN);
    printCentered("WiFi: Connecting...", 100, 1, GC9A01A_WHITE);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    tft.fillRect(30, 95, 180, 20, GC9A01A_BLACK);
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        printCentered("WiFi: Connected!", 100, 1, GC9A01A_GREEN);
    } else {
        Serial.println("\nWiFi connection failed.");
        printCentered("WiFi: Failed!", 100, 1, GC9A01A_RED);
    }
    delay(1000); // Give the user time to read the status
}

void sendTelemetryAndHandleResponse() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping telemetry.");
        return;
    }

    // 1. Read Sensors
    last_temp = dht.readTemperature();
    last_hum = dht.readHumidity();
    
    // Analog readings (0-4095 on ESP32)
    int raw_soil = analogRead(SOIL_MOISTURE_PIN);
    int raw_water = analogRead(WATER_LEVEL_PIN);

    // Convert to percentages (Simplified map logic)
    last_soil = map(raw_soil, 4095, 0, 0, 100); 
    if(last_soil < 0) last_soil = 0;
    if(last_soil > 100) last_soil = 100;

    last_water = map(raw_water, 0, 4095, 0, 100);
    if(last_water < 0) last_water = 0;
    if(last_water > 100) last_water = 100;

    // Read light level from BH1750 (GY-30) via I2C in lux, map to 0-100%
    // NOTE: Disabled for now — using default value until BH1750 is wired up
    // float lux = lightMeter.readLightLevel();
    // last_light = (lux / BH1750_MAX_LUX) * 100.0;
    // if(last_light < 0) last_light = 0;
    // if(last_light > 100) last_light = 100;
    last_light = 50.0; // Default: assume normal light level

    // Update TFT LCD screen based on current mode
    if (currentMode == MODE_TELEMETRY) {
        drawTelemetryScreen();
    }
    // In MODE_EMO, loop() will continuously drive the animated face, so we don't draw it here.

    // 2. Prepare JSON Payload
    StaticJsonDocument<256> doc;
    doc["temperature"] = isnan(last_temp) ? 0 : last_temp;
    doc["humidity"] = isnan(last_hum) ? 0 : last_hum;
    doc["soil_moisture"] = last_soil;
    doc["light_level"] = last_light;
    doc["water_level"] = last_water;

    String requestBody;
    serializeJson(doc, requestBody);

    // 3. Send HTTP POST
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");
    
    // Add Auth Header
    String authHeader = "Bearer " + String(API_KEY);
    http.addHeader("Authorization", authHeader);

    Serial.println("Sending Telemetry...");
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
        String responseBody = http.getString();
        Serial.print("HTTP Code: ");
        Serial.println(httpResponseCode);
        Serial.println("Response: " + responseBody);

        // 4. Parse Response to control pump
        StaticJsonDocument<256> resDoc;
        DeserializationError error = deserializeJson(resDoc, responseBody);

        if (!error) {
            const char* pump_action = resDoc["pump_action"];
            int duration = resDoc["duration_seconds"];

            if (String(pump_action) == "on" && duration > 0) {
                Serial.printf("Turn ON pump for %d seconds\n", duration);
                
                // Show status on screen
                if (currentMode == MODE_TELEMETRY) {
                    tft.fillRect(40, 190, 160, 20, GC9A01A_BLACK);
                    printCentered("PUMPING WATER...", 195, 1, GC9A01A_BLUE);
                } else {
                    tft.fillScreen(GC9A01A_BLACK);
                    printCentered("PUMPING...", 195, 1, GC9A01A_BLUE);
                }

                digitalWrite(PUMP_RELAY_PIN, HIGH);
                delay(duration * 1000);
                digitalWrite(PUMP_RELAY_PIN, LOW);
                Serial.println("Pump turned OFF");

                // Restore screen status
                if (currentMode == MODE_TELEMETRY) {
                    tft.fillRect(40, 190, 160, 20, GC9A01A_BLACK);
                    printCentered("WiFi: Connected", 195, 1, GC9A01A_GREEN);
                } else {
                    resetFaceState(); // Forces a full redraw of the pure black face
                }
            }
        }
    } else {
        Serial.print("Error sending POST: ");
        Serial.println(httpResponseCode);
    }
    http.end();
}

void setup() {
    Serial.begin(115200);
    
    // Init pins
    pinMode(PUMP_RELAY_PIN, OUTPUT);
    digitalWrite(PUMP_RELAY_PIN, LOW);

    // Initialize SPI bus for left-side pins
    hspi.begin(TFT_SCLK, -1, TFT_MOSI, TFT_CS); // sck, miso, mosi, ss

    // Initialize TFT screen (GC9A01 240x240)
    tft.begin();
    tft.setRotation(0);
    tft.fillScreen(GC9A01A_BLACK);
    
    // Draw decorative border circle
    tft.drawCircle(120, 120, 118, GC9A01A_GREEN);
    
    // Render splash screen
    printCentered("Emo Plant", 80, 2, GC9A01A_GREEN);
    printCentered("Initializing...", 130, 1, GC9A01A_WHITE);

    // Initialize I2C bus for GY-30 (BH1750) light sensor
    // NOTE: Disabled for now — uncomment when BH1750 is wired up
    // Wire.begin(I2C_SDA, I2C_SCL);
    // if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    //     Serial.println("BH1750 initialized successfully.");
    // } else {
    //     Serial.println("ERROR: BH1750 not found! Check wiring.");
    // }

    dht.begin();
    delay(1500); // Allow splash screen to be readable
    setupWiFi();
    
    // Initial read to populate sensors and draw the first face
    sendTelemetryAndHandleResponse();
}

void loop() {
    unsigned long currentMillis = millis();
    
    if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL || lastTelemetryTime == 0) {
        lastTelemetryTime = currentMillis;
        sendTelemetryAndHandleResponse();
    }
    
    // Wave gesture detection (Light sensor polling)
    // NOTE: Disabled for now — uncomment when BH1750 is wired up
    // static unsigned long lastLightPoll = 0;
    // if (currentMillis - lastLightPoll >= 200) {
    //     lastLightPoll = currentMillis;
    //     float currentLightLux = lightMeter.readLightLevel();
    //     float currentLightPct = (currentLightLux / BH1750_MAX_LUX) * 100.0;
    //     if(currentLightPct < 0) currentLightPct = 0;
    //     if(currentLightPct > 100) currentLightPct = 100;
    //     
    //     if (currentLightPct < 5.0 && last_light > 15.0 && currentMode != MODE_TELEMETRY) {
    //         Serial.println("Wave gesture detected! Showing telemetry...");
    //         currentMode = MODE_TELEMETRY;
    //         telemetryDisplayStartTime = currentMillis;
    //         drawTelemetryScreen();
    //     }
    // }
    
    // Handle screen mode timeout
    if (currentMode == MODE_TELEMETRY) {
        if (currentMillis - telemetryDisplayStartTime >= TELEMETRY_DISPLAY_DURATION) {
            Serial.println("Telemetry timeout. Returning to EMO face...");
            currentMode = MODE_EMO;
            resetFaceState(); // Force full screen clear and redraw of face
        }
    }

    // Run animation if in EMO mode
    if (currentMode == MODE_EMO) {
        Emotion e = determineEmotion();
        animateFace(tft, e);
    }
    
    delay(10); // Small delay to yield to FreeRTOS
}


