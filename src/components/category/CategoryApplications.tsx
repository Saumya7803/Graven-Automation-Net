import { 
  Factory, 
  Cog, 
  Package, 
  Truck, 
  Droplets, 
  Wind, 
  Building2,
  Pill,
  Utensils,
  Car,
  Zap,
  Settings
} from "lucide-react";

interface CategoryApplicationsProps {
  categoryName: string;
  applications?: string[] | null;
  categorySlug: string;
}

// Icon mapping for common industrial applications
const APPLICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "assembly": Factory,
  "packaging": Package,
  "material handling": Truck,
  "pumps": Droplets,
  "fans": Wind,
  "hvac": Wind,
  "conveyor": Truck,
  "manufacturing": Factory,
  "process": Cog,
  "automotive": Car,
  "pharmaceutical": Pill,
  "food": Utensils,
  "beverage": Utensils,
  "textile": Settings,
  "water": Droplets,
  "cement": Building2,
  "mining": Cog,
  "oil": Droplets,
  "gas": Zap,
  "energy": Zap,
  "default": Settings
};

// Fallback applications by category type
const FALLBACK_APPLICATIONS: Record<string, string[]> = {
  vfd: [
    "Pumps & Water Treatment",
    "HVAC & Ventilation",
    "Conveyor Systems",
    "Packaging Machines",
    "Material Handling",
    "Process Industries"
  ],
  plc: [
    "Assembly Lines",
    "Packaging Machines",
    "Process Control",
    "Material Handling",
    "Building Automation",
    "Water Treatment"
  ],
  hmi: [
    "Production Monitoring",
    "Process Visualization",
    "Machine Control",
    "Data Logging",
    "SCADA Systems",
    "Quality Control"
  ],
  servo: [
    "CNC Machines",
    "Robotics",
    "Packaging Equipment",
    "Printing Machines",
    "Assembly Automation",
    "Textile Machinery"
  ],
  default: [
    "Manufacturing",
    "Process Industries",
    "Machine Building",
    "Infrastructure",
    "OEM Applications",
    "System Integration"
  ]
};

// Industries served
const INDUSTRIES = [
  { name: "Manufacturing", icon: Factory },
  { name: "Automotive", icon: Car },
  { name: "Food & Beverage", icon: Utensils },
  { name: "Pharmaceuticals", icon: Pill },
  { name: "Water & Wastewater", icon: Droplets },
  { name: "HVAC & Buildings", icon: Building2 }
];

const getIconForApplication = (app: string): React.ComponentType<{ className?: string }> => {
  const lowerApp = app.toLowerCase();
  for (const [key, Icon] of Object.entries(APPLICATION_ICONS)) {
    if (lowerApp.includes(key)) return Icon;
  }
  return APPLICATION_ICONS.default;
};

export const CategoryApplications = ({ categoryName, applications, categorySlug }: CategoryApplicationsProps) => {
  // Determine fallback based on category slug
  const getFallbackKey = (slug: string): string => {
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug.includes('vfd') || lowerSlug.includes('drive') || lowerSlug.includes('inverter')) return 'vfd';
    if (lowerSlug.includes('plc') || lowerSlug.includes('controller')) return 'plc';
    if (lowerSlug.includes('hmi') || lowerSlug.includes('panel') || lowerSlug.includes('display')) return 'hmi';
    if (lowerSlug.includes('servo')) return 'servo';
    return 'default';
  };

  const fallbackKey = getFallbackKey(categorySlug);
  const displayApplications = applications && applications.length > 0 
    ? applications 
    : FALLBACK_APPLICATIONS[fallbackKey] || FALLBACK_APPLICATIONS.default;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Applications Section */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Where It's Used
            </h2>
            <p className="text-muted-foreground mb-8">
              Common applications for {categoryName} in industrial environments
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayApplications.map((app, index) => {
                const Icon = getIconForApplication(app);
                return (
                  <div 
                    key={index}
                    className="flex flex-col items-center p-4 bg-background rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all text-center"
                  >
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-foreground">{app}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Industries Section */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Industries Served
            </h3>
            <div className="flex flex-wrap gap-3">
              {INDUSTRIES.map((industry, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border"
                >
                  <industry.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{industry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
