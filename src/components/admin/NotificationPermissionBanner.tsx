import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { notificationManager } from '@/utils/notifications';
import { useToast } from '@/hooks/use-toast';

const BANNER_DISMISSED_KEY = 'callback-notification-banner-dismissed';
const BANNER_DISMISSED_TIMESTAMP_KEY = 'callback-notification-banner-dismissed-timestamp';
const DISMISS_DURATION_DAYS = 7;

export const NotificationPermissionBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    if (!notificationManager.areNotificationsSupported()) {
      return;
    }

    // Check if already granted
    if (notificationManager.getNotificationPermission() === 'granted') {
      return;
    }

    // Check if user dismissed the banner
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissed === 'true') {
      // Check if 7 days have passed
      const dismissedTimestamp = localStorage.getItem(BANNER_DISMISSED_TIMESTAMP_KEY);
      if (dismissedTimestamp) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
          return;
        }
      }
    }

    setIsVisible(true);
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const granted = await notificationManager.requestNotificationPermission();
    setIsRequesting(false);

    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll be alerted for urgent callback requests.",
      });
      setIsVisible(false);
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    localStorage.setItem(BANNER_DISMISSED_TIMESTAMP_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/30">
      <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Enable notifications to get instant alerts for urgent callback requests
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Get notified even when this tab is in the background
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            variant="default"
            size="sm"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
