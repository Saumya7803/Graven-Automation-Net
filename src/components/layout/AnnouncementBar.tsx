import { useState } from "react";
import { X, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-red-500 to-orange-500 text-white animate-slide-down bg-[length:200%_100%] animate-gradient-shift">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-4 pb-2 relative">
        <div className="flex items-center justify-between h-10 text-xs">
          {/* Left: Promotional Message */}
          <div className="hidden md:flex items-center gap-2">
            <span className="font-bold animate-pulse-subtle">⚡ Fast Sourcing • Genuine Products • Pan World Delivery</span>
          </div>

          {/* Center: Contact Info */}
          <div className="flex items-center gap-4 mx-auto md:mx-0 font-medium">
            <a href="tel:+917905350134" className="flex items-center gap-1.5 hover:scale-105 transition-all duration-300 hover:drop-shadow-lg">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+91 7905350134</span>
            </a>
            <a href="mailto:sales@gravenautomation.com" className="flex items-center gap-1.5 hover:scale-105 transition-all duration-300 hover:drop-shadow-lg">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">sales@gravenautomation.com</span>
            </a>
          </div>

          {/* Right: Social Links + Close */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <a href="#" className="hover:scale-125 hover:rotate-12 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" aria-label="Facebook">
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="hover:scale-125 hover:rotate-12 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" aria-label="Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="hover:scale-125 hover:rotate-12 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" aria-label="LinkedIn">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="hover:scale-125 hover:rotate-12 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" aria-label="Instagram">
                <Instagram className="h-3.5 w-3.5" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/20 transition-all duration-300 hover:rotate-90 hover:scale-110"
              onClick={() => setIsVisible(false)}
              aria-label="Close announcement"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
