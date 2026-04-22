import { ShieldCheck, Zap, Headphones, Truck } from "lucide-react";

const trustPoints = [
  {
    icon: ShieldCheck,
    text: "100% Genuine & Verified"
  },
  {
    icon: Zap,
    text: "Fast Sourcing"
  },
  {
    icon: Headphones,
    text: "Technical Assistance"
  },
  {
    icon: Truck,
    text: "Pan-India Delivery"
  }
];

export const ProductTrustStrip = () => {
  return (
    <div className="grid grid-cols-2 gap-2 pt-4 border-t">
      {trustPoints.map((point, index) => {
        const Icon = point.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">
              {point.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
