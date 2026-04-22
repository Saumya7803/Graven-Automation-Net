import { Card, CardContent } from "@/components/ui/card";
import { Phone, FileText, Package, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Phone,
    title: "Contact Us",
    description: "Call or submit your requirements online",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Get Quote",
    description: "Receive detailed quotation within 2 hours",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Package,
    title: "Delivery",
    description: "Fast delivery to your location",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: CheckCircle,
    title: "Installation",
    description: "Expert installation and support",
    color: "from-green-500 to-emerald-500",
  },
];

export const ProcessTimeline = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How to Order
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple and streamlined process from inquiry to installation
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden md:grid md:grid-cols-4 gap-6 relative">
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 -z-10" />

            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border/50"
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mt-4`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-elegant transition-all duration-300 border-border/50"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </CardContent>

                {/* Connecting Line for Mobile */}
                {index < steps.length - 1 && (
                  <div className="absolute left-12 bottom-0 w-0.5 h-6 bg-gradient-to-b from-primary/50 to-transparent translate-y-full" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
