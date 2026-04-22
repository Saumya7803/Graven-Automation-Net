import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  GraduationCap,
  Wrench,
  Network,
  Package,
  Zap,
} from "lucide-react";

const services = [
  {
    id: "installation",
    title: "Installation & Commissioning",
    description: "Expert installation and commissioning of Altivar VFD systems with parameter configuration and motor tuning",
    icon: Settings,
  },
  {
    id: "training",
    title: "Technical Training",
    description: "Comprehensive training programs on ATV drive programming, operation, and troubleshooting",
    icon: GraduationCap,
  },
  {
    id: "maintenance",
    title: "Preventive Maintenance",
    description: "Scheduled maintenance for VFD systems including capacitor checks, thermal imaging, and performance testing",
    icon: Wrench,
  },
  {
    id: "integration",
    title: "System Integration",
    description: "Integration of Altivar drives with PLC, SCADA, and industrial communication protocols (Modbus, Profibus, EtherNet/IP)",
    icon: Network,
  },
  {
    id: "spares",
    title: "Spare Parts Supply",
    description: "Genuine Schneider Electric VFD spare parts including control boards, power modules, and cooling fans",
    icon: Package,
  },
  {
    id: "audit",
    title: "Energy Audit",
    description: "VFD energy audits to analyze motor efficiency and identify opportunities for energy savings",
    icon: Zap,
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Comprehensive VFD Services & Support</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            More than just drives – complete VFD solutions for your motor control needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
