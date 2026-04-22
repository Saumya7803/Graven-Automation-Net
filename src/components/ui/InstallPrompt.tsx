import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptState {
  visitCount: number;
  lastDismissed: number | null;
  installAttempted: boolean;
}

const getPromptState = (): InstallPromptState => {
  const stored = localStorage.getItem('pwa-install-state');
  if (!stored) {
    return { visitCount: 0, lastDismissed: null, installAttempted: false };
  }
  return JSON.parse(stored);
};

const updatePromptState = (updates: Partial<InstallPromptState>) => {
  const current = getPromptState();
  localStorage.setItem('pwa-install-state', JSON.stringify({ ...current, ...updates }));
};

const checkShouldShowPrompt = (state: InstallPromptState, visitCount: number): boolean => {
  // Never show if user installed the app
  if (state.installAttempted) return false;

  // Don't show on first 2 visits (let them explore)
  if (visitCount < 3) return false;

  // If dismissed, check if 7 days have passed
  if (state.lastDismissed) {
    const daysSinceDismissed = (Date.now() - state.lastDismissed) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) return false;
  }

  return true;
};

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const state = getPromptState();
    
    // Increment visit count
    const newVisitCount = state.visitCount + 1;
    updatePromptState({ visitCount: newVisitCount });

    // Check if we should show the prompt
    const shouldShow = checkShouldShowPrompt(state, newVisitCount);
    
    if (!shouldShow) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show immediately for returning visitors (3+ visits)
      if (newVisitCount >= 3) {
        setTimeout(() => setShowPrompt(true), 2000);
      } else {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Detect when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const state = getPromptState();
        const shouldShow = checkShouldShowPrompt(state, state.visitCount);
        
        if (shouldShow && deferredPrompt && !showPrompt) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [deferredPrompt, showPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      updatePromptState({ installAttempted: true });
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    updatePromptState({ lastDismissed: Date.now() });
  };

  if (!showPrompt || !deferredPrompt) return null;

  const state = getPromptState();
  const isReturningVisitor = state.visitCount >= 3;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-in-up">
      <div className="bg-card border shadow-xl rounded-lg p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {isReturningVisitor ? "Welcome Back!" : "Install Our App"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isReturningVisitor 
                ? "Install our app for instant access, offline browsing, and faster load times."
                : "Get faster access, offline browsing, and instant notifications for your VFD orders."
              }
            </p>

            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Install
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
