import { Shield, Zap, HeadphonesIcon, Wrench } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Genuine & Verified Components",
    description: "We supply only authentic automation products sourced from trusted channels with full documentation and warranty.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable Sourcing",
    description: "Critical parts delivered quickly to reduce plant downtime. We specialize in urgent and hard-to-find components.",
  },
  {
    icon: HeadphonesIcon,
    title: "Technical Expertise",
    description: "Our team understands industrial systems, not just part numbers. We provide guidance on selection and compatibility.",
  },
  {
    icon: Wrench,
    title: "End-to-End Support",
    description: "From enquiry to after-sales assistance, we stay accountable throughout your automation journey.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Industries Choose <span className="text-primary">Graven Automation</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted partner for genuine automation components and expert support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
