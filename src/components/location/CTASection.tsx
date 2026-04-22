import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, Shield, RotateCcw, Truck, PhoneCall } from "lucide-react";
import { CallbackRequestDialog } from "./CallbackRequestDialog";

export const CTASection = () => {
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);

  const handleEmailClick = () => {
    window.location.href = "mailto:info@schneidervfd.com?subject=VFD Product Inquiry - Location Page";
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Dual-tone diagonal gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent" />
      
      {/* Animated floating elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold animate-fade-in">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-white/90 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Contact us today for the best VFD solutions with expert support and competitive pricing
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-6 py-8 max-w-2xl mx-auto">
            {[
              { icon: Shield, label: "Secure Payment" },
              { icon: RotateCcw, label: "30-Day Return" },
              { icon: Truck, label: "Fast Delivery" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {/* Call Now Button */}
            <Button 
              size="lg" 
              variant="secondary" 
              className="group shadow-elegant h-14 flex-1"
              asChild
            >
              <a href="tel:+917905350134">
                <Phone className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Call Now
              </a>
            </Button>

            {/* Email Us Button */}
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1 h-14 text-base font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-primary backdrop-blur-sm"
              onClick={handleEmailClick}
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </Button>

            {/* WhatsApp Button */}
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1 h-14 text-base font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-primary backdrop-blur-sm"
              asChild
            >
              <a 
                href="https://wa.me/917905350134?text=Hi,%20I'm%20interested%20in%20VFD%20products"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </Button>

            {/* Request Callback Button */}
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 text-base font-semibold bg-background/10 hover:bg-background/20 border-white/20 hover:border-white/40"
              onClick={() => setShowCallbackDialog(true)}
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Request Callback
            </Button>
          </div>
        </div>
      </div>

      {/* Callback Request Dialog */}
      <CallbackRequestDialog
        open={showCallbackDialog}
        onOpenChange={setShowCallbackDialog}
        source="location_page"
      />
    </section>
  );
};
