import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../config/constants.dart';
import '../models/diagnosis_result.dart';

class DiagnosisState {
  final List<DiagnosisResult> history;
  final bool isLoadingHistory;
  final bool isAnalyzing;
  final DiagnosisResult? latestAnalysisResult;
  final String? errorMessage;

  DiagnosisState({
    this.history = const [],
    this.isLoadingHistory = false,
    this.isAnalyzing = false,
    this.latestAnalysisResult,
    this.errorMessage,
  });

  DiagnosisState copyWith({
    List<DiagnosisResult>? history,
    bool? isLoadingHistory,
    bool? isAnalyzing,
    DiagnosisResult? latestAnalysisResult,
    String? errorMessage,
    bool clearLatestResult = false,
  }) {
    return DiagnosisState(
      history: history ?? this.history,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      latestAnalysisResult: clearLatestResult ? null : (latestAnalysisResult ?? this.latestAnalysisResult),
      errorMessage: errorMessage,
    );
  }
}

class DiagnosisNotifier extends Notifier<DiagnosisState> {
  @override
  DiagnosisState build() {
    // Fetch history asynchronously after initialization
    Future.microtask(() => fetchHistory());
    return DiagnosisState();
  }

  Future<void> fetchHistory() async {
    state = state.copyWith(isLoadingHistory: true, errorMessage: null);

    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/diagnose/history'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final List<DiagnosisResult> history = data
            .map((item) => DiagnosisResult.fromJson(item))
            .toList();
        state = state.copyWith(history: history, isLoadingHistory: false);
      } else {
        throw Exception('Server returned code: ${response.statusCode}');
      }
    } catch (e) {
      state = state.copyWith(
        isLoadingHistory: false,
        errorMessage: 'Không thể lấy lịch sử chẩn đoán: $e',
      );
    }
  }

  Future<void> uploadAndDiagnose(XFile xFile) async {
    state = state.copyWith(
      isAnalyzing: true, 
      errorMessage: null,
      clearLatestResult: true,
    );

    try {
      // Read bytes to support cross-platform uploading (Web & Mobile)
      final bytes = await xFile.readAsBytes();
      
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConstants.baseUrl}/api/diagnose'),
      );

      final multipartFile = http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: xFile.name,
      );
      
      request.files.add(multipartFile);

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final result = DiagnosisResult.fromJson(data);
        
        // Add to the top of the history list
        final updatedHistory = [result, ...state.history];
        
        state = state.copyWith(
          history: updatedHistory,
          isAnalyzing: false,
          latestAnalysisResult: result,
          errorMessage: null,
        );
      } else {
        throw Exception('Server chẩn đoán lỗi: ${response.statusCode}');
      }
    } catch (e) {
      state = state.copyWith(
        isAnalyzing: false,
        errorMessage: 'Lỗi tải ảnh/phân tích: $e',
      );
    }
  }

  void clearLatestResult() {
    state = state.copyWith(clearLatestResult: true);
  }
}

final diagnosisProvider = NotifierProvider<DiagnosisNotifier, DiagnosisState>(() {
  return DiagnosisNotifier();
});
