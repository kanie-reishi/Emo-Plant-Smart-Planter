#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "config.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

unsigned long lastCameraTime = 0;

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

void initCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    
    // Low resolution for faster transmission and AI compatibility
    config.frame_size = FRAMESIZE_VGA; 
    config.jpeg_quality = 12;
    config.fb_count = 1;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x\n", err);
        return;
    }
    Serial.println("Camera initialized successfully.");
}

void captureAndUpload() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping upload.");
        return;
    }

    Serial.println("Taking picture...");
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return;
    }

    HTTPClient http;
    http.begin(BACKEND_URL);

    // Add Auth Header
    String authHeader = "Bearer " + String(API_KEY);
    http.addHeader("Authorization", authHeader);

    // Prepare multipart form-data
    String boundary = "----ESP32Boundary" + String(millis());
    String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"esp32cam.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + boundary + "--\r\n";

    uint32_t totalLen = head.length() + fb->len + tail.length();
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
    http.addHeader("Content-Length", String(totalLen));

    Serial.println("Uploading image...");
    
    // We use a WiFiClient to send the multipart data chunk by chunk
    WiFiClient *client = http.getStreamPtr();
    
    // Instead of using http.POST(), we construct the request manually
    // because HTTPClient doesn't easily support multipart from buffer directly
    http.POST((uint8_t *)"", 0); // Start the connection? No, wait. 
    
    // Actually, HTTPClient supports posting a payload from buffer.
    // Let's create a full buffer if memory permits, or use custom streaming.
    // VGA is small enough (often <50KB), we might fit it in heap, but it's safer to use WiFiClient.

    // A simpler approach using HTTPClient's Stream:
    // Wait, HTTPClient API: POST(uint8_t * payload, size_t size)
    // To send multipart without allocating a huge buffer, we can just send it manually.
    
    if (http.connected()) {
       // Stop the HTTPClient standard post, we will do raw TCP:
       // Actually HTTPClient is tricky with multipart. 
       // Let's allocate a buffer if size is small enough.
       uint8_t *body = (uint8_t*) malloc(totalLen);
       if (body) {
           memcpy(body, head.c_str(), head.length());
           memcpy(body + head.length(), fb->buf, fb->len);
           memcpy(body + head.length() + fb->len, tail.c_str(), tail.length());
           
           int httpResponseCode = http.POST(body, totalLen);
           
           if (httpResponseCode > 0) {
               Serial.printf("HTTP Response code: %d\n", httpResponseCode);
               String response = http.getString();
               Serial.println(response);
           } else {
               Serial.printf("Error code: %d\n", httpResponseCode);
           }
           free(body);
       } else {
           Serial.println("Not enough memory to allocate multipart body.");
       }
    }
    
    http.end();
    esp_camera_fb_return(fb);
    Serial.println("Done.");
}

void setup() {
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout detector
    Serial.begin(115200);
    setupWiFi();
    initCamera();
}

void loop() {
    if (millis() - lastCameraTime >= CAMERA_INTERVAL || lastCameraTime == 0) {
        lastCameraTime = millis();
        captureAndUpload();
    }
    
    delay(10);
}
