import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Login', style: Theme.of(context).textTheme.displayLarge),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Dummy login action: navigate to dashboard
                context.go('/dashboard');
              },
              child: const Text('Simulate Login'),
            ),
          ],
        ),
      ),
    );
  }
}
