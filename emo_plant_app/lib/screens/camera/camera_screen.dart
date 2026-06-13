import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/constants.dart';
import '../../providers/diagnosis_provider.dart';
import '../../models/diagnosis_result.dart';

class CameraScreen extends ConsumerWidget {
  const CameraScreen({super.key});

  // Helper to construct image URL safely
  String _getImageUrl(String imagePath) {
    if (imagePath.startsWith('http')) return imagePath;
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '${AppConstants.baseUrl}/$cleanPath';
  }

  // Format date helper
  String _formatDateTime(DateTime dt) {
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    final day = dt.day.toString().padLeft(2, '0');
    final month = dt.month.toString().padLeft(2, '0');
    return '$hour:$minute - $day/$month/${dt.year}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(diagnosisProvider);
    final picker = ImagePicker();

    // Listen to analysis result to trigger popup modal
    ref.listen(diagnosisProvider, (previous, next) {
      if (next.latestAnalysisResult != null &&
          (previous?.latestAnalysisResult == null ||
              previous!.latestAnalysisResult!.id != next.latestAnalysisResult!.id)) {
        _showResultDialog(context, ref, next.latestAnalysisResult!);
      }
      if (next.errorMessage != null &&
          (previous?.errorMessage == null || previous!.errorMessage != next.errorMessage)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF4F9F4), // Premium soft green-grey
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                _buildHeader(context, ref),
                const SizedBox(height: 16),

                // Upload Actions Card
                _buildUploadActionsCard(context, ref, picker),
                const SizedBox(height: 20),

                // History Title
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.0),
                  child: Text(
                    'Lịch sử chẩn đoán AI',
                    style: TextStyle(
                      color: Color(0xFF1B5E20),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Diagnosis History List
                Expanded(
                  child: _buildHistorySection(context, state),
                ),
              ],
            ),

            // Loading overlay during analysis
            if (state.isAnalyzing) _buildAnalyzingOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Chẩn đoán AI 📸',
                style: TextStyle(
                  color: Color(0xFF1B5E20),
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Quét lá và kiểm tra sức khỏe cây',
                style: TextStyle(
                  color: Color(0xFF558B2F),
                  fontSize: 14,
                ),
              ),
            ],
          ),
          IconButton(
            onPressed: () => ref.read(diagnosisProvider.notifier).fetchHistory(),
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF2E7D32)),
            tooltip: 'Làm mới lịch sử',
          ),
        ],
      ),
    );
  }

  Widget _buildUploadActionsCard(
    BuildContext context,
    WidgetRef ref,
    ImagePicker picker,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20.0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: const Color(0xFFE8F0E8),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.center_focus_weak_rounded,
            size: 48,
            color: Color(0xFF2E7D32),
          ),
          const SizedBox(height: 12),
          const Text(
            'Chẩn đoán sức khỏe lá cây tức thì',
            style: TextStyle(
              color: Color(0xFF1B5E20),
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Hãy chụp ảnh rõ nét một chiếc lá của cây để AI phân tích phát hiện sâu bệnh và đề xuất cách chăm sóc.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF757575),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              // Camera button
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final photo = await picker.pickImage(
                      source: ImageSource.camera,
                      imageQuality: 85,
                    );
                    if (photo != null) {
                      ref.read(diagnosisProvider.notifier).uploadAndDiagnose(photo);
                    }
                  },
                  icon: const Icon(Icons.photo_camera_rounded, color: Colors.white),
                  label: const Text('Chụp ảnh'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Gallery button
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final photo = await picker.pickImage(
                      source: ImageSource.gallery,
                      imageQuality: 85,
                    );
                    if (photo != null) {
                      ref.read(diagnosisProvider.notifier).uploadAndDiagnose(photo);
                    }
                  },
                  icon: const Icon(Icons.photo_library_rounded, color: Color(0xFF2E7D32)),
                  label: const Text('Thư viện'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF2E7D32),
                    side: const BorderSide(color: Color(0xFF2E7D32)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistorySection(BuildContext context, DiagnosisState state) {
    if (state.isLoadingHistory && state.history.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.history.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.history_rounded, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 12),
              Text(
                'Chưa có lượt chẩn đoán nào',
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
      itemCount: state.history.length,
      itemBuilder: (context, index) {
        final diagnosis = state.history[index];
        return _buildHistoryCard(context, diagnosis);
      },
    );
  }

  Widget _buildHistoryCard(BuildContext context, DiagnosisResult diagnosis) {
    final percent = (diagnosis.confidence * 100).toStringAsFixed(0);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(
          color: const Color(0xFFE8F0E8),
          width: 1,
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Thumbnail
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                bottomLeft: Radius.circular(20),
              ),
              child: Image.network(
                _getImageUrl(diagnosis.imagePath),
                width: 90,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 90,
                  color: Colors.grey[200],
                  child: const Icon(Icons.broken_image_rounded, color: Colors.grey),
                ),
              ),
            ),
            // Info Description
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: diagnosis.isHealthy
                                ? const Color(0xFFE8F5E9)
                                : const Color(0xFFFFEBEE),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            diagnosis.isHealthy ? 'Khỏe mạnh' : 'Phát hiện bệnh',
                            style: TextStyle(
                              color: diagnosis.isHealthy
                                  ? const Color(0xFF2E7D32)
                                  : const Color(0xFFC62828),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$percent% tin cậy',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      diagnosis.diseaseName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF1B5E20),
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDateTime(diagnosis.timestamp),
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Arrow indicator to detail dialog
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded, color: Color(0xFF2E7D32)),
              onPressed: () {
                _showResultDialog(context, null, diagnosis);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyzingOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.55),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF2E7D32)),
              ),
              SizedBox(height: 20),
              Text(
                'AI Đang Phân Tích Lá Cây...',
                style: TextStyle(
                  color: Color(0xFF1B5E20),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Mô hình MobileNetV2 đang nhận diện các đốm bệnh và triệu chứng của cây. Quá trình này mất vài giây.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFF757575),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showResultDialog(BuildContext context, WidgetRef? ref, DiagnosisResult result) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        final percent = (result.confidence * 100).toStringAsFixed(0);

        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Image
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                      ),
                      child: Image.network(
                        _getImageUrl(result.imagePath),
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 200,
                          color: Colors.grey[200],
                          child: const Icon(Icons.broken_image_rounded, size: 48, color: Colors.grey),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: CircleAvatar(
                        backgroundColor: Colors.black.withOpacity(0.5),
                        child: IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                        ),
                      ),
                    ),
                  ],
                ),
                // Text Results
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: result.isHealthy
                                  ? const Color(0xFFE8F5E9)
                                  : const Color(0xFFFFEBEE),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              result.isHealthy ? 'Khỏe mạnh' : 'Phát hiện bệnh',
                              style: TextStyle(
                                color: result.isHealthy
                                    ? const Color(0xFF2E7D32)
                                    : const Color(0xFFC62828),
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          Text(
                            '$percent% độ chính xác',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        result.diseaseName,
                        style: const TextStyle(
                          color: Color(0xFF1B5E20),
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Ngày quét: ${_formatDateTime(result.timestamp)}',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 12,
                        ),
                      ),
                      const Divider(height: 24, thickness: 1),
                      const Text(
                        'Khuyến nghị từ AI:',
                        style: TextStyle(
                          color: Color(0xFF1B5E20),
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        result.recommendation.isNotEmpty
                            ? result.recommendation
                            : 'Không có lời khuyên cụ thể cho tình trạng này.',
                        style: const TextStyle(
                          color: Color(0xFF37474F),
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2E7D32),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Text('Đã hiểu'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    ).then((_) {
      if (ref != null) {
        // Clear latest result once the popup is closed
        ref.read(diagnosisProvider.notifier).clearLatestResult();
      }
    });
  }
}
