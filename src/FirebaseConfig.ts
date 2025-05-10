import { initializeApp } from 'firebase/app';
import { getToken, getMessaging, isSupported } from 'firebase/messaging';
import CONSTANTS from './utils/constants';

// @ts-ignore
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

const firebaseApp = initializeApp(firebaseConfig);

const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return await getMessaging(firebaseApp);
    }
    console.log('Firebase not supported this browser');
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
})();

export const messagingInstance = await messaging;

async function registerServiceWorkerAndGetToken() {
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    await navigator.serviceWorker.ready;
    console.log('Service Worker is active.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Please allow notifications in your browser settings.');
      return;
    }

    const accessToken = localStorage.getItem('token');

    if (!accessToken) return;
    getAndSaveToken();
  } catch (error) {
    console.error(error);
  }
}

const getAndSaveToken = async () => {
  const token = await getToken(messagingInstance, {
    // @ts-ignore
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  });
  // @ts-ignore
  await fetch(`${CONSTANTS.api}notification/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
};

export { registerServiceWorkerAndGetToken, getAndSaveToken };
