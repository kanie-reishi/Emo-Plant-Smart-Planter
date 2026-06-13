import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/settings_provider.dart';
import '../../models/plant_settings.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late TextEditingController _nameController;
  late TextEditingController _typeController;
  double _lowThreshold = 30.0;
  double _highThreshold = 70.0;
  int _captureInterval = 6;
  bool _autoWater = true;
  bool _alert = true;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _typeController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _typeController.dispose();
    super.dispose();
  }

  void _initFields(PlantSettings settings) {
    _nameController.text = settings.plantName;
    _typeController.text = settings.plantType;
    _lowThreshold = settings.moistureThresholdLow;
    _highThreshold = settings.moistureThresholdHigh;
    _captureInterval = settings.captureIntervalHours;
    _autoWater = settings.autoWaterEnabled;
    _alert = settings.alertEnabled;
    _isInitialized = true;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(settingsProvider);

    // Initialize values when settings are fetched
    if (state.settings != null && !_isInitialized) {
      _initFields(state.settings!);
    }

    // Listen to changes for showing Snackbars
    ref.listen(settingsProvider, (previous, next) {
      if (next.saveSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lưu cài đặt thành công! 🌱'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
        ref.read(settingsProvider.notifier).resetSaveStatus();
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
      backgroundColor: const Color(0xFFF4F9F4),
      body: SafeArea(
        child: state.isLoading && state.settings == null
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    _buildHeader(),
                    const SizedBox(height: 16),

                    // Warning/Error Banner
                    if (state.errorMessage != null)
                      _buildWarningBanner(state.errorMessage!),

                    // Form
                    _buildSettingsForm(state),
                    const SizedBox(height: 24),

                    // Save Button
                    _buildSaveButton(state),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildHeader() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Cài đặt cấu hình ⚙️',
          style: TextStyle(
            color: Color(0xFF1B5E20),
            fontSize: 26,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          'Thiết lập ngưỡng tưới nước và thông số thiết bị',
          style: TextStyle(
            color: Color(0xFF558B2F),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildWarningBanner(String message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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

  Widget _buildSettingsForm(SettingsState state) {
    return Column(
      children: [
        // 1. Thẻ thông tin cây (Plant Info Card)
        _buildCard(
          title: 'Thông tin chậu cây',
          icon: Icons.info_outline_rounded,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Tên cây',
                  labelStyle: const TextStyle(color: Color(0xFF558B2F)),
                  hintText: 'Nhập tên cây cảnh của bạn',
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
                  ),
                  prefixIcon: const Icon(Icons.label_rounded, color: Color(0xFF2E7D32)),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _typeController,
                decoration: InputDecoration(
                  labelText: 'Loại cây',
                  labelStyle: const TextStyle(color: Color(0xFF558B2F)),
                  hintText: 'Ví dụ: Kim Ngân, Trầu Bà',
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
                  ),
                  prefixIcon: const Icon(Icons.grass_rounded, color: Color(0xFF2E7D32)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 2. Thẻ cài đặt ngưỡng nước (Moisture Threshold Card)
        _buildCard(
          title: 'Ngưỡng ẩm & Tưới tự động',
          icon: Icons.shower_outlined,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Auto water switch
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                activeColor: const Color(0xFF2E7D32),
                title: const Text(
                  'Tưới nước tự động',
                  style: TextStyle(
                    color: Color(0xFF1B5E20),
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: const Text(
                  'Bơm tự kích hoạt khi độ ẩm dưới mức tối thiểu.',
                  style: TextStyle(fontSize: 12),
                ),
                value: _autoWater,
                onChanged: (val) {
                  setState(() {
                    _autoWater = val;
                  });
                },
              ),
              const Divider(height: 20),

              // Low threshold slider
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Độ ẩm tối thiểu kích tưới:',
                    style: TextStyle(color: Color(0xFF37474F), fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  Text(
                    '${_lowThreshold.toStringAsFixed(0)}%',
                    style: const TextStyle(
                      color: Color(0xFFD32F2F),
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Slider(
                value: _lowThreshold,
                min: 10,
                max: 50,
                divisions: 8,
                activeColor: const Color(0xFFD32F2F),
                inactiveColor: const Color(0xFFFFCDD2),
                onChanged: _autoWater
                    ? (val) {
                        setState(() {
                          _lowThreshold = val;
                        });
                      }
                    : null,
              ),
              const SizedBox(height: 12),

              // High threshold slider
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Độ ẩm mục tiêu ngắt tưới:',
                    style: TextStyle(color: Color(0xFF37474F), fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  Text(
                    '${_highThreshold.toStringAsFixed(0)}%',
                    style: const TextStyle(
                      color: Color(0xFF1976D2),
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Slider(
                value: _highThreshold,
                min: 50,
                max: 90,
                divisions: 8,
                activeColor: const Color(0xFF1976D2),
                inactiveColor: const Color(0xFFBBDEFB),
                onChanged: _autoWater
                    ? (val) {
                        setState(() {
                          _highThreshold = val;
                        });
                      }
                    : null,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 3. Thẻ thiết bị & thông báo (Device Settings Card)
        _buildCard(
          title: 'Cài đặt cảnh báo & Camera',
          icon: Icons.sensors_outlined,
          child: Column(
            children: [
              // Alert toggle
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                activeColor: const Color(0xFF2E7D32),
                title: const Text(
                  'Nhận cảnh báo sức khỏe',
                  style: TextStyle(
                    color: Color(0xFF1B5E20),
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: const Text(
                  'Gửi tin nhắn cảnh báo khi độ ẩm nguy hại hoặc phát hiện bệnh.',
                  style: TextStyle(fontSize: 12),
                ),
                value: _alert,
                onChanged: (val) {
                  setState(() {
                    _alert = val;
                  });
                },
              ),
              const Divider(height: 20),

              // Photo interval setting
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Khoảng thời gian chụp ảnh AI',
                        style: TextStyle(
                          color: Color(0xFF1B5E20),
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Khoảng cách giữa các chu kỳ chụp lá.',
                        style: TextStyle(fontSize: 11, color: Colors.grey),
                      ),
                    ],
                  ),
                  DropdownButton<int>(
                    value: _captureInterval,
                    icon: const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF2E7D32)),
                    underline: Container(
                      height: 2,
                      color: const Color(0xFF2E7D32),
                    ),
                    onChanged: (int? newValue) {
                      if (newValue != null) {
                        setState(() {
                          _captureInterval = newValue;
                        });
                      }
                    },
                    items: const [
                      DropdownMenuItem(value: 1, child: Text('1 giờ')),
                      DropdownMenuItem(value: 3, child: Text('3 giờ')),
                      DropdownMenuItem(value: 6, child: Text('6 giờ')),
                      DropdownMenuItem(value: 12, child: Text('12 giờ')),
                      DropdownMenuItem(value: 24, child: Text('24 giờ')),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.04),
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
          Row(
            children: [
              Icon(icon, color: const Color(0xFF2E7D32), size: 22),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF1B5E20),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildSaveButton(SettingsState state) {
    return ElevatedButton(
      onPressed: state.isSaving
          ? null
          : () {
              final newSettings = PlantSettings(
                plantName: _nameController.text.trim(),
                plantType: _typeController.text.trim(),
                moistureThresholdLow: _lowThreshold,
                moistureThresholdHigh: _highThreshold,
                captureIntervalHours: _captureInterval,
                autoWaterEnabled: _autoWater,
                alertEnabled: _alert,
              );
              ref.read(settingsProvider.notifier).saveSettings(newSettings);
            },
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF2E7D32),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
      child: state.isSaving
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : const Text(
              'LƯU CẤU HÌNH',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
    );
  }
}
