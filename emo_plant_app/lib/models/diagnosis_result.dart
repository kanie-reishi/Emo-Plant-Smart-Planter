class DiagnosisResult {
  final int id;
  final DateTime timestamp;
  final String imagePath;
  final String diseaseName;
  final double confidence;
  final String recommendation;
  final bool isHealthy;

  DiagnosisResult({
    required this.id,
    required this.timestamp,
    required this.imagePath,
    required this.diseaseName,
    required this.confidence,
    required this.recommendation,
    required this.isHealthy,
  });

  factory DiagnosisResult.fromJson(Map<String, dynamic> json) {
    return DiagnosisResult(
      id: json['id'] as int? ?? 0,
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'] as String) 
          : DateTime.now(),
      imagePath: json['image_path'] as String? ?? '',
      diseaseName: json['disease_name'] as String? ?? 'Chưa xác định',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      recommendation: json['recommendation'] as String? ?? '',
      isHealthy: json['is_healthy'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'image_path': imagePath,
      'disease_name': diseaseName,
      'confidence': confidence,
      'recommendation': recommendation,
      'is_healthy': isHealthy,
    };
  }
}
