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

        /**
         * onBackgroundMessage fires for ALL data-only FCM messages when the
         * app is in the background or the screen is locked.
         *
         * IMPORTANT: The backend sends data-only payloads (no 'notification' key).
         * If a 'notification' key were present, Android FCM would deliver the
         * message directly to the system tray WITHOUT waking this service worker —
         * so the lock-screen popup would never appear and onBackgroundMessage
         * would never fire. The data-only approach guarantees this handler always
         * runs, giving us full control over vibration, requireInteraction, etc.
         */
        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Background message received:', payload);

            // Title and body are embedded in the data payload by the backend
            const data = payload.data || {};
            const type = data.type || '';

            const notificationTitle = data.title || getDefaultTitle(type);
            const notificationBody  = data.body  || getDefaultBody(type);

            // Driver-action events: must be persistent so the driver sees them on
            // the lock screen. requireInteraction keeps the banner until dismissed.
            const isDriverActionRequired = [
                'incoming_call',
                'client_counter',    // passenger countered the driver's bid
                'driver_selected',   // passenger selected this driver (confirm/pay step)
                'payment_secured',   // escrow paid — driver needs to prepare
                'new_driver_bid',    // (shown to client, but keep persistent for clarity)
            ].includes(type);

            const notificationOptions = {
                body: notificationBody,
                icon: '/icon.png',
                badge: '/icon.png',
                data: data,
                tag: type || 'airgo-notification',
                renotify: true,
            };

            if (isDriverActionRequired) {
                // Persistent — stays on lock screen until tapped or dismissed
                notificationOptions.requireInteraction = true;
                notificationOptions.vibrate = [
                    500, 110, 500, 110, 450, 110, 200, 110,
                    170, 40,  450, 110, 200, 110, 170, 40, 350
                ];
            } else {
                // Informational — short pulse, auto-dismisses
                notificationOptions.requireInteraction = false;
                notificationOptions.vibrate = [200, 100, 200];
            }

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    })
    .catch(err => {
        console.error('[firebase-messaging-sw.js] Failed to load config dynamically:', err);
    });

/** Default titles by event type — fallback when data.title is missing */
function getDefaultTitle(type) {
    const map = {
        'new_driver_bid':    '🚗 New Driver Bid!',
        'driver_accepted':   '✅ Driver Accepted!',
        'client_counter':    '💬 Counter-Offer Received!',
        'driver_selected':   '🎉 Passenger Selected You!',
        'payment_confirmed': '💳 Payment Confirmed!',
        'payment_secured':   '💰 Funds in Escrow!',
        'trip_started':      '🚗 Trip Has Started!',
        'trip_completed':    '✅ Trip Completed!',
        'booking_cancelled': '❌ Booking Cancelled',
        'booking_expired':   '⏰ Booking Expired',
        'incoming_call':     '📞 Incoming Call!'
    };
    return map[type] || '✈️ Airgo Notification';
}

/** Default bodies by event type — fallback when data.body is missing */
function getDefaultBody(type) {
    const map = {
        'new_driver_bid':    'A driver submitted a bid for your ride. Open the app to review.',
        'driver_accepted':   'Your driver accepted the fare. Tap to complete payment.',
        'client_counter':    'The passenger countered your offer. Open the app to respond.',
        'driver_selected':   'A passenger selected your vehicle. Check your driver portal.',
        'payment_confirmed': 'Escrow payment confirmed. Your trip is locked in.',
        'payment_secured':   'Client payment secured in escrow. Prepare for pickup.',
        'trip_started':      'Your trip has started. Have a safe journey!',
        'trip_completed':    'Your trip is complete. Thank you for riding with Airgo!',
        'booking_cancelled': 'Your booking was cancelled.',
        'booking_expired':   'Your booking expired due to inactivity. Please re-book.',
        'incoming_call':     'A caller is waiting. Tap to answer.'
    };
    return map[type] || 'You have a new notification from Airgo.';
}

// Handle notification click — open the correct portal or tab
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};
    const targetBase = notificationData.click_action || '/dashboard';

    let targetUrl = targetBase;
    if (notificationData.type === 'incoming_call') {
        const bookingId  = notificationData.bookingId  || '';
        const callerName = encodeURIComponent(notificationData.callerName || '');
        const offer      = encodeURIComponent(notificationData.offer      || '');
        targetUrl = `${targetBase}?incomingCallBookingId=${bookingId}&callerName=${callerName}&offer=${offer}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(targetBase)) {
                    if ('navigate' in client) {
                        return client.navigate(targetUrl).then(c => c.focus());
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
