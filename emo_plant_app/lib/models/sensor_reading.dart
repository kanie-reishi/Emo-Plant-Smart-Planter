class SensorReading {
  final int? id;
  final double soilMoisture;
  final double temperature;
  final double humidity;
  final double lightLevel;
  final double waterLevel;
  final DateTime? timestamp;

  SensorReading({
    this.id,
    required this.soilMoisture,
    required this.temperature,
    required this.humidity,
    required this.lightLevel,
    required this.waterLevel,
    this.timestamp,
  });

  factory SensorReading.fromJson(Map<String, dynamic> json) {
    return SensorReading(
      id: json['id'] as int?,
      soilMoisture: (json['soil_moisture'] as num?)?.toDouble() ?? 0.0,
      temperature: (json['temperature'] as num?)?.toDouble() ?? 0.0,
      humidity: (json['humidity'] as num?)?.toDouble() ?? 0.0,
      lightLevel: (json['light_level'] as num?)?.toDouble() ?? 0.0,
      waterLevel: (json['water_level'] as num?)?.toDouble() ?? 0.0,
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'soil_moisture': soilMoisture,
      'temperature': temperature,
      'humidity': humidity,
      'light_level': lightLevel,
      'water_level': waterLevel,
      if (timestamp != null) 'timestamp': timestamp!.toIso8601String(),
    };
  }
}
