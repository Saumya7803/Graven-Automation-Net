import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BKpFXVxhLlxkEMbwbqw5TZm_VGYCCyLmqFm2sKUr_3HtVXGMJ8Hqk7P8vWQNLXQTxYw4qCM0RVbXPzK9wHdF3Nk';

export class PushNotificationManager {
  private static instance: PushNotificationManager;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async isPushSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async requestPermission(): Promise<boolean> {
    if (!await this.isPushSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!await this.isPushSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource
        });
      }

      // Save to database
      await this.savePushSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removePushSubscription(subscription.endpoint);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }

  private async savePushSubscription(subscription: PushSubscription) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subscriptionJson = subscription.toJSON();
    const deviceInfo = this.getDeviceInfo();

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        device_name: deviceInfo.name,
        device_type: deviceInfo.type,
        user_agent: navigator.userAgent,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Error saving push subscription:', error);
    }
  }

  private async removePushSubscription(endpoint: string) {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing push subscription:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);

    return {
      name: isMobile ? 'Mobile Device' : isTablet ? 'Tablet' : 'Desktop',
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    };
  }

  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!await this.isPushSupported()) return null;

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  }
}

export const pushNotificationManager = PushNotificationManager.getInstance();
