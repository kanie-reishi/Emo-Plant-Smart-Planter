class PlantSettings {
  final String plantName;
  final String plantType;
  final double moistureThresholdLow;
  final double moistureThresholdHigh;
  final int captureIntervalHours;
  final bool autoWaterEnabled;
  final bool alertEnabled;

  PlantSettings({
    required this.plantName,
    required this.plantType,
    required this.moistureThresholdLow,
    required this.moistureThresholdHigh,
    required this.captureIntervalHours,
    required this.autoWaterEnabled,
    required this.alertEnabled,
  });

  factory PlantSettings.fromJson(Map<String, dynamic> json) {
    return PlantSettings(
      plantName: json['plant_name'] as String? ?? 'Cây của tôi',
      plantType: json['plant_type'] as String? ?? 'Cây cảnh',
      moistureThresholdLow: (json['moisture_threshold_low'] as num?)?.toDouble() ?? 30.0,
      moistureThresholdHigh: (json['moisture_threshold_high'] as num?)?.toDouble() ?? 70.0,
      captureIntervalHours: json['capture_interval_hours'] as int? ?? 6,
      autoWaterEnabled: json['auto_water_enabled'] as bool? ?? true,
      alertEnabled: json['alert_enabled'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'plant_name': plantName,
      'plant_type': plantType,
      'moisture_threshold_low': moistureThresholdLow,
      'moisture_threshold_high': moistureThresholdHigh,
      'capture_interval_hours': captureIntervalHours,
      'auto_water_enabled': autoWaterEnabled,
      'alert_enabled': alertEnabled,
    };
  }

  PlantSettings copyWith({
    String? plantName,
    String? plantType,
    double? moistureThresholdLow,
    double? moistureThresholdHigh,
    int? captureIntervalHours,
    bool? autoWaterEnabled,
    bool? alertEnabled,
  }) {
    return PlantSettings(
      plantName: plantName ?? this.plantName,
      plantType: plantType ?? this.plantType,
      moistureThresholdLow: moistureThresholdLow ?? this.moistureThresholdLow,
      moistureThresholdHigh: moistureThresholdHigh ?? this.moistureThresholdHigh,
      captureIntervalHours: captureIntervalHours ?? this.captureIntervalHours,
      autoWaterEnabled: autoWaterEnabled ?? this.autoWaterEnabled,
      alertEnabled: alertEnabled ?? this.alertEnabled,
    );
  }
}
