import { useState } from "react";
import { MapPin, Phone, Mail, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CallbackRequestDialog } from "./CallbackRequestDialog";

interface HeroSectionProps {
  city: string;
  state: string;
  title: string;
  description: string;
}

export const HeroSection = ({ city, state, title, description }: HeroSectionProps) => {
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAyOGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6bTAgMTRjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0ek0wIDQ0YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-white/80">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-white">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/locations" className="hover:text-white">Locations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">{city}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="text-white space-y-6">
            {/* Location Badge */}
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-4">
              <MapPin className="w-3 h-3 mr-1" />
              {city}, {state}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              {description}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 py-4">
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <div className="font-bold">4.9★</div>
                  <div className="text-sm text-white/80">1800+ Reviews</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">24/7</div>
                  <div className="text-sm text-white/80">Support</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" variant="secondary" className="group shadow-elegant" asChild>
                <a href="tel:+917905350134">
                  <Phone className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Call Now
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-primary backdrop-blur-sm"
                onClick={() => setShowCallbackDialog(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            </div>
          </div>

          {/* Floating Stats Card */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-elegant animate-scale-in">
              <h3 className="text-white text-xl font-semibold mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                {[
                  { label: "Same Day Delivery", icon: "🚀" },
                  { label: "Expert Installation", icon: "🔧" },
                  { label: "1 Year Warranty", icon: "✅" },
                  { label: "Lowest Prices", icon: "💰" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-white/90 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      {/* Callback Dialog */}
      <CallbackRequestDialog
        open={showCallbackDialog}
        onOpenChange={setShowCallbackDialog}
        locationPage={`${city}, ${state}`}
        source="location_hero"
      />
    </section>
  );
};
