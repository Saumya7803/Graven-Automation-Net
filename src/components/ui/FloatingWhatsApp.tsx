import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { trackWidgetEvent } from "@/utils/widgetAnalytics";

export const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const positionZohoChat = () => {
      const chat = document.getElementById("zsiq_float");
      if (!chat) return;

      chat.style.bottom = "80px";
      chat.style.right = "20px";
      chat.style.zIndex = "9998";
    };

    positionZohoChat();

    const delayedUpdate = window.setTimeout(() => {
      positionZohoChat();
    }, 2000);

    const intervalUpdate = window.setInterval(positionZohoChat, 1500);
    const observer = new MutationObserver(positionZohoChat);

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.clearTimeout(delayedUpdate);
      window.clearInterval(intervalUpdate);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('whatsapp-tooltip-seen');
    
    if (!hasSeenTooltip && isVisible) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        trackWidgetEvent('tooltip_shown');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        handleDismissTooltip(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleDismissTooltip = (isManual: boolean = false) => {
    setShowTooltip(false);
    localStorage.setItem('whatsapp-tooltip-seen', 'true');
    
    if (isManual) {
      trackWidgetEvent('tooltip_dismissed_manual');
    } else {
      trackWidgetEvent('tooltip_dismissed_auto');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="whatsapp-float">
      {showTooltip && (
        <div 
          className="absolute bottom-16 right-0 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 fade-in-0 whitespace-nowrap"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Chat with us!</span>
            <button
              onClick={() => handleDismissTooltip(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div 
            className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
            style={{
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
            }}
          />
        </div>
      )}
      
      <Button
        asChild
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg animate-fade-in hover:scale-110 transition-all duration-300"
        style={{ backgroundColor: '#25D366' }}
        aria-label="Chat on WhatsApp"
        onClick={() => {
          handleDismissTooltip(false);
          trackWidgetEvent('whatsapp_clicked');
        }}
      >
        <a
          href="https://wa.me/917905350134?text=Hi,%20I'm%20interested%20in%20VFD%20products"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={whatsappIcon} alt="WhatsApp" className="w-8 h-8" />
        </a>
      </Button>
    </div>
  );
};
