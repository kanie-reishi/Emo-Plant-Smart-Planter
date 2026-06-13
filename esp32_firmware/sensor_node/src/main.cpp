#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"

DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastTelemetryTime = 0;

void setupWiFi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nWiFi connection failed.");
    }
}

void sendTelemetryAndHandleResponse() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping telemetry.");
        return;
    }

    // 1. Read Sensors
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    
    // Analog readings (0-4095 on ESP32)
    int raw_soil = analogRead(SOIL_MOISTURE_PIN);
    int raw_water = analogRead(WATER_LEVEL_PIN);
    int raw_light = analogRead(LIGHT_SENSOR_PIN);

    // Convert to percentages (Simplified map logic)
    // Note: Calibrate these values based on your specific sensors
    float soil_pct = map(raw_soil, 4095, 0, 0, 100); 
    if(soil_pct < 0) soil_pct = 0;
    if(soil_pct > 100) soil_pct = 100;

    float water_pct = map(raw_water, 0, 4095, 0, 100);
    float light_pct = map(raw_light, 4095, 0, 0, 100);

    // 2. Prepare JSON Payload
    StaticJsonDocument<256> doc;
    doc["temperature"] = isnan(t) ? 0 : t;
    doc["humidity"] = isnan(h) ? 0 : h;
    doc["soil_moisture"] = soil_pct;
    doc["light_level"] = light_pct;
    doc["water_level"] = water_pct;

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
                digitalWrite(PUMP_RELAY_PIN, HIGH);
                delay(duration * 1000);
                digitalWrite(PUMP_RELAY_PIN, LOW);
                Serial.println("Pump turned OFF");
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

    dht.begin();
    setupWiFi();
}

void loop() {
    if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL || lastTelemetryTime == 0) {
        lastTelemetryTime = millis();
        sendTelemetryAndHandleResponse();
    }
    
    delay(10); // Small delay to yield to FreeRTOS
}
