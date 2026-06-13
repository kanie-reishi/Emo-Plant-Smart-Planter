import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/sensor_provider.dart';
import '../../models/sensor_reading.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sensorStateAsync = ref.watch(sensorProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F9F4), // Premium soft nature grey-green
      body: SafeArea(
        child: sensorStateAsync.when(
          data: (state) => _buildDashboardContent(context, ref, state),
          error: (err, stack) => _buildErrorState(context, ref, err),
          loading: () => _buildLoadingState(),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF2E7D32)),
          ),
          SizedBox(height: 16),
          Text(
            'Đang tải dữ liệu vườn Emo Plant...',
            style: TextStyle(
              color: Color(0xFF2E7D32),
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, WidgetRef ref, Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              color: Color(0xFFD32F2F),
              size: 64,
            ),
            const SizedBox(height: 16),
            const Text(
              'Không thể kết nối đến server',
              style: TextStyle(
                color: Color(0xFF1B5E20),
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Hãy đảm bảo server FastAPI đang chạy và điện thoại của bạn kết nối đúng địa chỉ IP.\n\nChi tiết lỗi: $error',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF558B2F),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                // Refresh provider
                ref.invalidate(sensorProvider);
              },
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardContent(
    BuildContext context,
    WidgetRef ref,
    SensorState state,
  ) {
    final reading = state.latestReading;
    final isOnline = reading != null;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
          _buildHeader(),
          const SizedBox(height: 16),

          // Server Connection Warning Banner (if offline or error)
          if (state.errorMessage != null)
            _buildWarningBanner(state.errorMessage!)
          else if (!isOnline)
            _buildWarningBanner('Không có dữ liệu cảm biến. Hãy kiểm tra kết nối thiết bị.'),

          const SizedBox(height: 8),

          // Plant Emotional Status Card
          _buildPlantExpressionCard(reading),
          const SizedBox(height: 20),

          // Section Title
          const Text(
            'Thông số cảm biến',
            style: TextStyle(
              color: Color(0xFF1B5E20),
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          // 2x2 Grid of Sensor Cards
          _buildSensorGrid(reading),
          const SizedBox(height: 24),

          // Pump Control Panel
          _buildPumpControlCard(context, ref, state),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emo Plant 🌱',
              style: TextStyle(
                color: Color(0xFF1B5E20),
                fontSize: 26,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Dashboard giám sát cây thông minh',
              style: TextStyle(
                color: Color(0xFF558B2F),
                fontSize: 14,
              ),
            ),
          ],
        ),
        CircleAvatar(
          backgroundColor: Color(0xFFC8E6C9),
          child: Icon(
            Icons.local_florist_rounded,
            color: Color(0xFF2E7D32),
          ),
        ),
      ],
    );
  }

  Widget _buildWarningBanner(String message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEBEE),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFFCDD2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Color(0xFFD32F2F)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: Color(0xFFC62828),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlantExpressionCard(SensorReading? reading) {
    // Determine plant emotion
    String emotionTitle = 'Đang ngủ';
    String emotionDescription = 'Không nhận được dữ liệu từ chậu cây.';
    IconData emotionIcon = Icons.nights_stay_rounded;
    List<Color> gradientColors = [const Color(0xFFB0BEC5), const Color(0xFF78909C)]; // Grey

    if (reading != null) {
      final moisture = reading.soilMoisture;
      final temp = reading.temperature;

      if (moisture < 30) {
        emotionTitle = 'Khát nước! 😢';
        emotionDescription = 'Cây đang rất khô. Hãy tưới nước ngay nhé!';
        emotionIcon = Icons.sentiment_very_dissatisfied_rounded;
        gradientColors = [const Color(0xFFFFD54F), const Color(0xFFF57C00)]; // Orange/Yellow
      } else if (temp >= 35) {
        emotionTitle = 'Quá nóng! 🥵';
        emotionDescription = 'Nhiệt độ quá cao. Hãy đưa cây vào bóng râm!';
        emotionIcon = Icons.sentiment_dissatisfied_rounded;
        gradientColors = [const Color(0xFFE57373), const Color(0xFFD32F2F)]; // Red
      } else {
        emotionTitle = 'Vui vẻ & Khỏe mạnh 😊';
        emotionDescription = 'Mọi điều kiện của cây đều hoàn hảo!';
        emotionIcon = Icons.sentiment_very_satisfied_rounded;
        gradientColors = [const Color(0xFF81C784), const Color(0xFF2E7D32)]; // Green
      }
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: gradientColors.last.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          // Emotion Avatar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.25),
              shape: BoxShape.circle,
            ),
            child: Icon(
              emotionIcon,
              color: Colors.white,
              size: 54,
            ),
          ),
          const SizedBox(width: 16),
          // Description
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  emotionTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  emotionDescription,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorGrid(SensorReading? reading) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - 16) / 2;
        return Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            _buildSensorCard(
              width: cardWidth,
              title: 'Độ ẩm đất',
              value: reading != null ? '${reading.soilMoisture.toStringAsFixed(0)}%' : '--',
              icon: Icons.opacity_rounded,
              iconColor: const Color(0xFF1E88E5),
              bgColor: const Color(0xFFE3F2FD),
              subtitle: 'Ngưỡng tưới: 30%',
              progress: reading != null ? reading.soilMoisture / 100.0 : 0.0,
              progressColor: const Color(0xFF1E88E5),
            ),
            _buildSensorCard(
              width: cardWidth,
              title: 'Ánh sáng',
              value: reading != null ? '${reading.lightLevel.toStringAsFixed(0)}%' : '--',
              icon: Icons.wb_sunny_rounded,
              iconColor: const Color(0xFFFDD835),
              bgColor: const Color(0xFFFFFDE7),
              subtitle: 'Độ phơi sáng',
              progress: reading != null ? reading.lightLevel / 100.0 : 0.0,
              progressColor: const Color(0xFFFBC02D),
            ),
            _buildSensorCard(
              width: cardWidth,
              title: 'Nhiệt độ & Khí',
              value: reading != null
                  ? '${reading.temperature.toStringAsFixed(1)}°C'
                  : '--',
              icon: Icons.thermostat_rounded,
              iconColor: const Color(0xFFF4511E),
              bgColor: const Color(0xFFFBE9E7),
              subtitle: reading != null ? 'H: ${reading.humidity.toStringAsFixed(0)}%' : 'Độ ẩm khí',
              progress: reading != null ? reading.temperature / 50.0 : 0.0, // Scale temperature up to 50C
              progressColor: const Color(0xFFF4511E),
            ),
            _buildSensorCard(
              width: cardWidth,
              title: 'Nước bình chứa',
              value: reading != null ? '${reading.waterLevel.toStringAsFixed(0)}%' : '--',
              icon: Icons.water_drop_rounded,
              iconColor: const Color(0xFF00ACC1),
              bgColor: const Color(0xFFE0F7FA),
              subtitle: reading != null && reading.waterLevel < 20 ? 'Sắp hết nước!' : 'Bình chứa nước',
              progress: reading != null ? reading.waterLevel / 100.0 : 0.0,
              progressColor: const Color(0xFF00ACC1),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSensorCard({
    required double width,
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String subtitle,
    required double progress,
    required Color progressColor,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: const Color(0xFFE8F0E8),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon and Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: bgColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(left: 8.0),
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: Color(0xFF558B2F),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Value
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF1B5E20),
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          // Subtitle
          Text(
            subtitle,
            style: TextStyle(
              color: subtitle.contains('hết') ? const Color(0xFFD32F2F) : const Color(0xFF7CB342),
              fontSize: 11,
              fontWeight: subtitle.contains('hết') ? FontWeight.bold : FontWeight.normal,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: const Color(0xFFF0F4F0),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPumpControlCard(
    BuildContext context,
    WidgetRef ref,
    SensorState state,
  ) {
    final isRunning = state.isPumpRunning;
    final isToggling = state.isTogglingPump;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: const Color(0xFFE8F0E8),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.shower_rounded, color: Color(0xFF2E7D32)),
              SizedBox(width: 8),
              Text(
                'Điều khiển tưới nước',
                style: TextStyle(
                  color: Color(0xFF1B5E20),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Kích hoạt tưới nước thủ công. Bơm sẽ tự động tắt sau 10 giây để đảm bảo an toàn.',
            style: TextStyle(
              color: Color(0xFF757575),
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Pump status text
              Row(
                children: [
                  // Pulse animation indicator
                  _buildStatusDot(isRunning),
                  const SizedBox(width: 8),
                  Text(
                    isRunning ? 'Đang bơm nước...' : 'Bơm đang tắt',
                    style: TextStyle(
                      color: isRunning ? const Color(0xFF1976D2) : const Color(0xFF616161),
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              // Toggle Button
              ElevatedButton(
                onPressed: isToggling
                    ? null
                    : () {
                        // Toggle pump state
                        ref.read(sensorProvider.notifier).togglePump(!isRunning);
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isRunning ? const Color(0xFFD32F2F) : const Color(0xFF2E7D32),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: isToggling
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        isRunning ? 'Tắt Bơm' : 'Tưới Nước',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusDot(bool isActive) {
    if (!isActive) {
      return Container(
        width: 10,
        height: 10,
        decoration: const BoxDecoration(
          color: Colors.grey,
          shape: BoxShape.circle,
        ),
      );
    }

    return _AnimatedPulseDot();
  }
}

class _AnimatedPulseDot extends StatefulWidget {
  @override
  State<_AnimatedPulseDot> createState() => _AnimatedPulseDotState();
}

class _AnimatedPulseDotState extends State<_AnimatedPulseDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: const Color(0xFF1976D2).withOpacity(0.3 + 0.7 * _controller.value),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1976D2).withOpacity(0.5 * (1.0 - _controller.value)),
                blurRadius: 6,
                spreadRadius: 4,
              ),
            ],
          ),
        );
      },
    );
  }
}
