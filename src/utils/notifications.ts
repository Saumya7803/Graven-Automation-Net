interface CallbackRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  created_at: string;
  priority: string;
}

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  areNotificationsSupported(): boolean {
    return 'Notification' in window;
  }

  getNotificationPermission(): NotificationPermission {
    if (!this.areNotificationsSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.areNotificationsSupported()) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  showCallbackNotification(callback: CallbackRequest): void {
    if (!this.areNotificationsSupported() || Notification.permission !== 'granted') {
      return;
    }

    const timeAgo = this.getTimeAgo(new Date(callback.created_at));
    
    const notification = new Notification('🚨 Urgent Callback Request', {
      body: `${callback.customer_name} - ${callback.customer_phone}\nRequested: ${timeAgo}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `callback-${callback.id}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      // Dispatch custom event to open callback detail
      window.dispatchEvent(new CustomEvent('open-callback-detail', { 
        detail: { callbackId: callback.id } 
      }));
      notification.close();
    };
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return '1 hour ago';
    return `${Math.floor(seconds / 3600)} hours ago`;
  }

  async playAlertSound(): Promise<void> {
    try {
      // Create a simple beep using Web Audio API as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play alert sound:', error);
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
