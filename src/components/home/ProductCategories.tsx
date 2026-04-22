import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Cpu, Gauge, Settings, Activity, Zap, Power } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "PLCs & Industrial Controllers",
    icon: Cpu,
    description: "Programmable Logic Controllers for industrial automation",
    slug: "plc",
  },
  {
    id: 2,
    name: "VFDs & AC Drives",
    icon: Gauge,
    description: "Motor speed control and energy efficiency solutions",
    slug: "vfd",
  },
  {
    id: 3,
    name: "Servo Motors & Motion Control",
    icon: Settings,
    description: "Precision motion control systems",
    slug: "servo",
  },
  {
    id: 4,
    name: "HMI Touch Panels",
    icon: Activity,
    description: "Human Machine Interface displays and panels",
    slug: "hmi",
  },
  {
    id: 5,
    name: "Switchgear & Protection",
    icon: Zap,
    description: "Circuit breakers and power protection equipment",
    slug: "switchgear",
  },
  {
    id: 6,
    name: "Industrial Sensors",
    icon: Power,
    description: "Industrial sensors and measurement devices",
    slug: "sensors",
  },
];

const ProductCategories = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-primary">Automation Product Range</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive range of industrial automation components for every application
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} to={`/shop?category=${category.slug}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50 h-full">
                  <CardContent className="p-8">
                    <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                      Explore Products
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center text-lg font-semibold text-primary hover:gap-3 transition-all group"
          >
            View All Products
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
