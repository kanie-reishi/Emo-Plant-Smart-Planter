importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAhEZNCTSnzi-c-n_vTfjXs8Ng_ZftAx28",
  authDomain: "emo-plant.firebaseapp.com",
  projectId: "emo-plant",
  storageBucket: "emo-plant.firebasestorage.app",
  messagingSenderId: "653508686531",
  appId: "1:653508686531:web:33af987949b64089f6e876",
  measurementId: "G-M0Z8WHQW19"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
