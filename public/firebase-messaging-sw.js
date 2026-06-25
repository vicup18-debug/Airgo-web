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
            const isIncomingCall = payload.data && payload.data.type === 'incoming_call';
            
            const notificationTitle = payload.notification?.title || 
                (isIncomingCall ? '📞 Incoming Voice Call!' : '🚕 New Ride Request Available!');
            
            const notificationOptions = {
                body: payload.notification?.body || 
                    (isIncomingCall ? 'Call regarding booking.' : 'A client is requesting a ride in your area.'),
                icon: '/icon.png',
                badge: '/icon.png',
                data: payload.data
            };

            if (isIncomingCall) {
                notificationOptions.requireInteraction = true;
                notificationOptions.tag = 'incoming-call';
                notificationOptions.renotify = true;
                notificationOptions.vibrate = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 350];
            }

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    })
    .catch(err => {
        console.error('[firebase-messaging-sw.js] Failed to load config dynamically:', err);
    });

// Handle notification click to open the driver portal or passenger dashboard
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const targetBase = notificationData.click_action || '/driver';
    
    let targetUrl = targetBase;
    if (notificationData.type === 'incoming_call') {
        const bookingId = notificationData.bookingId || '';
        const callerName = encodeURIComponent(notificationData.callerName || '');
        const offer = encodeURIComponent(notificationData.offer || '');
        targetUrl = `${targetBase}?incomingCallBookingId=${bookingId}&callerName=${callerName}&offer=${offer}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(targetBase)) {
                    if ('navigate' in client) {
                        return client.navigate(targetUrl).then(client => client.focus());
                    }
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
