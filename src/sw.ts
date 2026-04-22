/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './integrations/supabase/config';

declare const self: ServiceWorkerGlobalScope;

// Precache assets
precacheAndRoute(self.__WB_MANIFEST);

// Listen for push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, data: notificationData, tag } = data;

  const options: NotificationOptions = {
    body,
    icon: icon || '/icon-192.png',
    badge: badge || '/favicon.ico',
    data: notificationData,
    tag: tag || 'default',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Helper function to track notification interactions
async function trackNotificationInteraction(notificationId: string, action: string) {
  if (!notificationId) return;

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/track-notification-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({
        notificationId,
        action,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to track notification interaction:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    // Track dismissal
    event.waitUntil(
      trackNotificationInteraction(event.notification.data?.notificationId, 'dismiss')
    );
    return;
  }

  // Track click
  event.waitUntil(
    trackNotificationInteraction(event.notification.data?.notificationId, 'click')
  );

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event: any) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options.applicationServerKey
    }).then((subscription) => {
      return fetch(`${SUPABASE_URL}/functions/v1/update-push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription?.endpoint,
          subscription: subscription.toJSON(),
          userAgent: self.navigator.userAgent
        })
      });
    })
  );
});
