importScripts(
  'https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js',
);
const firebaseConfig = {
  // @ts-ignore
  apiKey: import.meta.env.VITE_API_KEY,
  // @ts-ignore
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  // @ts-ignore
  projectId: import.meta.env.VITE_PROJECT_ID,
  // @ts-ignore
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  // @ts-ignore
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  // @ts-ignore
  appId: import.meta.env.VITE_APP_ID,
  // @ts-ignore
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
