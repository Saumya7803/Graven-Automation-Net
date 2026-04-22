import { Card, CardContent } from "@/components/ui/card";
import { Factory, Building2, Droplets, Wheat, Pickaxe, Fuel, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const industries = [
  {
    id: 1,
    name: "Manufacturing",
    icon: Factory,
    description: "VFD automation for production lines, assembly, and processing equipment",
    applications: ["Production Lines", "Assembly", "CNC Machines", "Conveyors"],
  },
  {
    id: 2,
    name: "HVAC Systems",
    icon: Building2,
    description: "Variable speed control for climate control fans, pumps, and compressors",
    applications: ["Climate Control", "Air Handling", "Pumps", "Compressors"],
  },
  {
    id: 3,
    name: "Water & Wastewater",
    icon: Droplets,
    description: "Reliable VFDs for water treatment pumps and distribution systems",
    applications: ["Water Treatment", "Pumping Stations", "Distribution", "Waste Management"],
  },
  {
    id: 4,
    name: "Food & Beverage",
    icon: Wheat,
    description: "Washdown-rated VFD solutions for food processing motor control",
    applications: ["Processing", "Packaging", "Material Handling", "Mixers"],
  },
  {
    id: 5,
    name: "Mining & Metals",
    icon: Pickaxe,
    description: "Heavy-duty VFDs for extraction and processing conveyors and mills",
    applications: ["Extraction", "Processing", "Conveyors", "Mills"],
  },
  {
    id: 6,
    name: "Oil & Gas",
    icon: Fuel,
    description: "Robust VFD solutions for upstream, midstream, and downstream pump control",
    applications: ["Drilling", "Pumping", "Refining", "Pipeline Control"],
  },
];

const IndustrySolutions = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Industry-Specific <span className="text-primary">VFD Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tailored VFD solutions for diverse industrial motor control applications
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Card
                key={industry.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden"
              >
                <Link to={`/shop?industry=${industry.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-0">
                    {/* Icon Header */}
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border-b">
                      <div className="inline-flex p-4 rounded-2xl bg-background shadow-md group-hover:scale-110 transition-transform">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {industry.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {industry.description}
                      </p>

                      {/* Applications Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {industry.applications.map((app, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                          >
                            {app}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all pt-2">
                        Explore Solutions
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Not sure which solution fits your needs?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Talk to Our VFD Experts
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutions;
