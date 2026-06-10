import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAhEZNCTSnzi-c-n_vTfjXs8Ng_ZftAx28",
  authDomain: "emo-plant.firebaseapp.com",
  projectId: "emo-plant",
  storageBucket: "emo-plant.firebasestorage.app",
  messagingSenderId: "653508686531",
  appId: "1:653508686531:web:33af987949b64089f6e876",
  measurementId: "G-M0Z8WHQW19"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const messaging = getMessaging(app);

// VAPID Key for Cloud Messaging
export const VAPID_KEY = "BCB1WPmQL4xFbJflZ60MP6MUJJZYkWEhbY5dZoARaK49h3EDraPhhFfxWXIlQna7T-T8u4HqEyny4ENEihpYCNg";

export default app;
