importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Fetch credentials dynamically from API route at runtime
fetch('/api/firebase-config')
    .then(res => res.json())
    .then(config => {
        if (!config.apiKey || !config.messagingSenderId) {
            console.warn("⚠️ Firebase Service Worker: Configuration keys are missing. Push alerts deactivated.");
            return;
        }

        firebase.initializeApp(config);
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            const notificationTitle = payload.notification?.title || '🚕 New Ride Request Available!';
            const notificationOptions = {
                body: payload.notification?.body || 'A client is requesting a ride in your area.',
                icon: '/icon.png',
                badge: '/icon.png',
                data: payload.data
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    })
    .catch(err => {
        console.error('[firebase-messaging-sw.js] Failed to load config dynamically:', err);
    });

// Handle notification click to open the driver portal
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes('/driver') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/driver');
            }
        })
    );
});
