import API from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push no soportado en este navegador.');
      return;
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permiso denegado.');
      return;
    }

    const { data } = await API.get('/api/push/vapid-public-key');
    const convertedKey = urlBase64ToUint8Array(data.publicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    await API.post('/api/push/subscribe', { subscription });
    console.log('✅ Push activadas.');
  } catch (error) {
    console.error('Error registrando push:', error);
  }
}
