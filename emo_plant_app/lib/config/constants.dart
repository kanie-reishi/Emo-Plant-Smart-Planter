class AppConstants {
  // Use 10.0.2.2:8000 for Android Emulator, or computer's local IP (e.g. 192.168.1.108:8000) for physical device.
  static const String baseUrl = 'http://10.0.2.2:8000';
  
  // Hardware secret key for any authorized requests (if needed)
  static const String apiKey = 'EmoPlant_ESP32_SecretKey_2026';
  
  // Polling interval in seconds for sensor updates
  static const int pollingIntervalSeconds = 5;
}
