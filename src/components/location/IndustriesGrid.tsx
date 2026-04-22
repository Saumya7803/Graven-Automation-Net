import { Card, CardContent } from "@/components/ui/card";
import { Factory, Wrench, Building2, Warehouse, Droplets, Drill, Hammer, Cog } from "lucide-react";

interface IndustriesGridProps {
  industries: string[];
}

const industryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  manufacturing: Factory,
  "process industries": Droplets,
  "oil & gas": Drill,
  construction: Hammer,
  automotive: Wrench,
  infrastructure: Building2,
  logistics: Warehouse,
  default: Cog,
};

const industryColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-purple-500",
  "from-red-500 to-pink-500",
  "from-teal-500 to-green-500",
];

export const IndustriesGrid = ({ industries }: IndustriesGridProps) => {
  const getIcon = (industry: string) => {
    const key = industry.toLowerCase();
    return industryIcons[key] || industryIcons.default;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Industries We Serve
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Providing specialized VFD solutions across diverse industrial sectors
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => {
            const Icon = getIcon(industry);
            const colorClass = industryColors[index % industryColors.length];

            return (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer border-border/50"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative z-10">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Industry Name */}
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {industry}
                  </h3>

                  {/* Hover Description */}
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20">
                    Specialized VFD solutions for {industry.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
