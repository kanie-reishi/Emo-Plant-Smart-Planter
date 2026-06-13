import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    // Currently using the web credentials as a placeholder for Android Phase 2.
    // Replace with the native Android AppID once Google Sign-In or FCM is needed.
    return const FirebaseOptions(
      apiKey: 'AIzaSyAhEZNCTSnzi-c-n_vTfjXs8Ng_ZftAx28',
      appId: '1:653508686531:web:33af987949b64089f6e876', // Web App ID
      messagingSenderId: '653508686531',
      projectId: 'emo-plant',
      authDomain: 'emo-plant.firebaseapp.com',
      storageBucket: 'emo-plant.firebasestorage.app',
      measurementId: 'G-M0Z8WHQW19',
    );
  }
}
