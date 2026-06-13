import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/plant_settings.dart';

class SettingsState {
  final PlantSettings? settings;
  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final bool saveSuccess;

  SettingsState({
    this.settings,
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.saveSuccess = false,
  });

  SettingsState copyWith({
    PlantSettings? settings,
    bool? isLoading,
    bool? isSaving,
    String? errorMessage,
    bool? saveSuccess,
  }) {
    return SettingsState(
      settings: settings ?? this.settings,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: errorMessage,
      saveSuccess: saveSuccess ?? this.saveSuccess,
    );
  }
}

class SettingsNotifier extends Notifier<SettingsState> {
  @override
  SettingsState build() {
    Future.microtask(() => fetchSettings());
    return SettingsState(isLoading: true);
  }

  Future<void> fetchSettings() async {
    state = state.copyWith(isLoading: true, errorMessage: null, saveSuccess: false);

    try {
      final response = await http.get(Uri.parse('${AppConstants.baseUrl}/api/settings'));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final settings = PlantSettings.fromJson(data);
        state = state.copyWith(settings: settings, isLoading: false);
      } else {
        throw Exception('Server returned code: ${response.statusCode}');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Không thể tải cài đặt: $e',
      );
    }
  }

  Future<void> saveSettings(PlantSettings newSettings) async {
    state = state.copyWith(isSaving: true, errorMessage: null, saveSuccess: false);

    try {
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/api/settings'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(newSettings.toJson()),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final settings = PlantSettings.fromJson(data);
        state = state.copyWith(
          settings: settings, 
          isSaving: false, 
          saveSuccess: true,
        );
      } else {
        throw Exception('Server returned code: ${response.statusCode}');
      }
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Lỗi lưu cấu hình: $e',
      );
    }
  }

  void resetSaveStatus() {
    state = state.copyWith(saveSuccess: false);
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, SettingsState>(() {
  return SettingsNotifier();
});
