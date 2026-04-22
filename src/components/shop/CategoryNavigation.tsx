import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Cpu, 
  Gauge, 
  Settings, 
  Activity, 
  Monitor, 
  Database, 
  Network, 
  Server, 
  Zap, 
  Battery, 
  Plug, 
  LayoutGrid, 
  Fuel, 
  BarChart, 
  Wifi, 
  Bot, 
  ShieldCheck, 
  Box, 
  Cable, 
  Thermometer, 
  Wrench, 
  Settings2, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  { name: "PLCs", slug: "plc", icon: Cpu },
  { name: "VFDs", slug: "vfd", icon: Gauge },
  { name: "Servo", slug: "servo", icon: Settings },
  { name: "Sensors", slug: "sensors", icon: Activity },
  { name: "HMI", slug: "hmi", icon: Monitor },
  { name: "SCADA", slug: "scada", icon: Database },
  { name: "Remote I/O", slug: "remote-io", icon: Network },
  { name: "Industrial PCs", slug: "industrial-pc", icon: Server },
  { name: "Switchgear", slug: "switchgear", icon: Zap },
  { name: "Power Supplies", slug: "power-supplies", icon: Battery },
  { name: "Transformers", slug: "transformers", icon: Plug },
  { name: "Motor Panels", slug: "motor-control-panels", icon: LayoutGrid },
  { name: "Generators", slug: "generators", icon: Fuel },
  { name: "Power Quality", slug: "power-quality", icon: BarChart },
  { name: "Networking", slug: "networking", icon: Wifi },
  { name: "Robotics", slug: "robotics", icon: Bot },
  { name: "Safety", slug: "safety", icon: ShieldCheck },
  { name: "Enclosures", slug: "enclosures", icon: Box },
  { name: "Cables", slug: "cables-accessories", icon: Cable },
  { name: "Process Control", slug: "process-control", icon: Thermometer },
  { name: "Test Instruments", slug: "test-instruments", icon: Wrench },
  { name: "Spares & Services", slug: "spares-services", icon: Settings2 },
  { name: "Other", slug: "other", icon: MoreHorizontal }
];

export const CategoryNavigation = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Extract active category from URL
  const activeSlug = location.pathname.match(/\/category\/([^/]+)/)?.[1] || null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-2 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          
          {/* Left scroll button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hidden md:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Scrollable pills container */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeSlug === category.slug;
              
              return (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Link>
              );
            })}
          </div>

          {/* Right scroll button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hidden md:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
