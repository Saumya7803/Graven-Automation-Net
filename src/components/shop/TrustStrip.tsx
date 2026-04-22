import { ShieldCheck, Zap, Headphones, Truck } from "lucide-react";

const trustPoints = [
  {
    icon: ShieldCheck,
    text: "100% Genuine & Verified Products"
  },
  {
    icon: Zap,
    text: "Fast Sourcing for Urgent Requirements"
  },
  {
    icon: Headphones,
    text: "Technical Assistance Available"
  },
  {
    icon: Truck,
    text: "Pan-India Delivery Support"
  }
];

export const TrustStrip = () => {
  return (
    <section className="bg-primary/5 border-y border-border py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div key={index} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm text-foreground font-medium">
                  {point.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
