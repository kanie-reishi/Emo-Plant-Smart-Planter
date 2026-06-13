import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/sensor_reading.dart';

class SensorState {
  final SensorReading? latestReading;
  final bool isPumpRunning;
  final bool isTogglingPump;
  final String? errorMessage;

  SensorState({
    this.latestReading,
    this.isPumpRunning = false,
    this.isTogglingPump = false,
    this.errorMessage,
  });

  SensorState copyWith({
    SensorReading? latestReading,
    bool? isPumpRunning,
    bool? isTogglingPump,
    String? errorMessage,
  }) {
    return SensorState(
      latestReading: latestReading ?? this.latestReading,
      isPumpRunning: isPumpRunning ?? this.isPumpRunning,
      isTogglingPump: isTogglingPump ?? this.isTogglingPump,
      errorMessage: errorMessage,
    );
  }
}

class SensorNotifier extends AsyncNotifier<SensorState> {
  Timer? _timer;

  @override
  FutureOr<SensorState> build() async {
    // Start periodic polling
    _startPolling();

    // Cancel timer when provider is destroyed
    ref.onDispose(() {
      _timer?.cancel();
    });

    final latest = await _fetchLatestReading();
    final pumpStatus = await _fetchPumpStatus();

    return SensorState(
      latestReading: latest,
      isPumpRunning: pumpStatus,
    );
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(
      const Duration(seconds: AppConstants.pollingIntervalSeconds),
      (_) => _pollData(),
    );
  }

  Future<void> _pollData() async {
    try {
      final latest = await _fetchLatestReading();
      final pumpStatus = await _fetchPumpStatus();
      
      state = AsyncValue.data(
        state.value?.copyWith(
          latestReading: latest,
          isPumpRunning: pumpStatus,
          errorMessage: null, // Reset error on successful poll
        ) ?? SensorState(latestReading: latest, isPumpRunning: pumpStatus),
      );
    } catch (e) {
      // Keep previous data but attach error message to notify user
      state = AsyncValue.data(
        state.value?.copyWith(
          errorMessage: 'Không thể kết nối đến server: $e',
        ) ?? SensorState(errorMessage: 'Không thể kết nối đến server: $e'),
      );
    }
  }

  Future<SensorReading?> _fetchLatestReading() async {
    try {
      final response = await http.get(Uri.parse('${AppConstants.baseUrl}/api/sensor/latest'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data != null && data is Map<String, dynamic> && !data.containsKey('message')) {
          return SensorReading.fromJson(data);
        }
      }
    } catch (_) {
      rethrow;
    }
    return null;
  }

  Future<bool> _fetchPumpStatus() async {
    try {
      final response = await http.get(Uri.parse('${AppConstants.baseUrl}/api/pump/status'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['is_running'] as bool? ?? false;
      }
    } catch (_) {
      rethrow;
    }
    return false;
  }

  Future<void> togglePump(bool turnOn) async {
    final currentState = state.value;
    if (currentState == null || currentState.isTogglingPump) return;

    state = AsyncValue.data(currentState.copyWith(isTogglingPump: true));

    try {
      final action = turnOn ? 'on' : 'off';
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/pump/toggle?action=$action&duration_seconds=10'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          state = AsyncValue.data(
            state.value?.copyWith(
              isPumpRunning: turnOn,
              isTogglingPump: false,
              errorMessage: null,
            ) ?? SensorState(isPumpRunning: turnOn, isTogglingPump: false),
          );
          // Refresh immediately
          await _pollData();
          return;
        }
      }
      throw Exception('Không thể điều khiển máy bơm (HTTP ${response.statusCode})');
    } catch (e) {
      state = AsyncValue.data(
        state.value?.copyWith(
          isTogglingPump: false,
          errorMessage: 'Lỗi điều khiển bơm: $e',
        ) ?? SensorState(isTogglingPump: false, errorMessage: 'Lỗi điều khiển bơm: $e'),
      );
    }
  }
}

final sensorProvider = AsyncNotifierProvider<SensorNotifier, SensorState>(() {
  return SensorNotifier();
});
