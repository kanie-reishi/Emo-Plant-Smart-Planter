import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(FirebaseAuth.instance, const FlutterSecureStorage());
});

class AuthService {
  final FirebaseAuth _firebaseAuth;
  final FlutterSecureStorage _secureStorage;

  AuthService(this._firebaseAuth, this._secureStorage);

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  Future<UserCredential?> signInWithEmail(String email, String password) async {
    try {
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Store token securely
      final token = await credential.user?.getIdToken();
      if (token != null) {
        await _secureStorage.write(key: 'auth_token', value: token);
      }
      
      return credential;
    } catch (e) {
      // Handle or rethrow error
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _secureStorage.delete(key: 'auth_token');
    await _firebaseAuth.signOut();
  }
}
