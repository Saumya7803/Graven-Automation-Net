import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { pushNotificationManager } from "@/utils/pushNotifications";
import { useToast } from "@/hooks/use-toast";

export const PushNotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkShouldShowBanner();
  }, []);

  const checkShouldShowBanner = async () => {
    const subscription = await pushNotificationManager.getCurrentSubscription();
    if (subscription) return;

    const dismissed = localStorage.getItem("push-banner-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    if (!isInstalled) return;

    setIsVisible(true);
  };

  const handleEnable = async () => {
    setIsRequesting(true);

    const granted = await pushNotificationManager.requestPermission();
    if (granted) {
      const subscription = await pushNotificationManager.subscribeToPush();

      if (subscription) {
        toast({
          title: "Notifications Enabled!",
          description: "You'll receive updates about your orders and quotations.",
        });
        setIsVisible(false);
      } else {
        toast({
          title: "Subscription Failed",
          description: "Could not subscribe to notifications. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }

    setIsRequesting(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("push-banner-dismissed", Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 right-4 bottom-4 md:left-auto md:right-6 md:bottom-6 md:w-[460px] z-40">
      <Alert className="border-blue-500 bg-blue-50 shadow-xl dark:bg-blue-950/30">
        <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          Stay Updated with Push Notifications
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Get instant updates about your orders, quotation responses, and special offers even when the app is closed.
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            <Button onClick={handleEnable} disabled={isRequesting} variant="default" size="sm">
              {isRequesting ? "Enabling..." : "Enable Now"}
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm" aria-label="Dismiss notification banner">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
