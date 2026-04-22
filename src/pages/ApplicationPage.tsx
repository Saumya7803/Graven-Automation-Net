import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Wind, Droplets, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateBreadcrumbSchema, generateArticleSchema } from "@/lib/seo";

const applicationData: Record<string, {
  title: string;
  description: string;
  icon: any;
  content: string;
  benefits: string[];
  powerRanges: string[];
  keyFeatures: string[];
}> = {
  "solar-vfd": {
    title: "Solar VFD - Variable Frequency Drive for Solar Water Pumps",
    description: "Complete guide to solar VFDs for agricultural water pumping. MPPT technology, benefits, sizing, and top models in India.",
    icon: Sun,
    content: "Solar VFDs are specially designed variable frequency drives that convert DC power from solar panels to 3-phase AC for running submersible and surface pumps without batteries...",
    benefits: [
      "No electricity bills - 100% solar powered",
      "MPPT technology for maximum solar energy extraction",
      "Works without batteries - direct panel to pump",
      "Automatic dry-run protection",
      "Monsoon-proof - works in cloudy conditions",
      "20+ year lifespan with minimal maintenance"
    ],
    powerRanges: ["0.75 kW", "1.5 kW", "2.2 kW", "3.7 kW", "5.5 kW", "7.5 kW", "11 kW"],
    keyFeatures: [
      "Wide input voltage range (200-900V DC)",
      "Built-in MPPT algorithm",
      "IP65 weatherproof enclosure",
      "LCD display showing solar power, flow, etc.",
      "Remote monitoring via GSM/GPRS",
      "Soft start for pump protection"
    ]
  },
  "hvac-vfd": {
    title: "HVAC VFD - Variable Frequency Drives for Heating Ventilation Air Conditioning",
    description: "Expert guide to VFDs in HVAC systems. Energy savings, applications, fan control, chiller optimization, and AHU retrofits.",
    icon: Wind,
    content: "HVAC VFDs control fan and pump speeds in heating, ventilation, and air conditioning systems, delivering 20-50% energy savings...",
    benefits: [
      "20-50% energy cost reduction",
      "Better temperature control and comfort",
      "Reduced mechanical stress on equipment",
      "Quieter operation at low speeds",
      "Extended equipment lifespan",
      "Improved building automation integration"
    ],
    powerRanges: ["0.75 kW", "1.5 kW", "2.2 kW", "3.7 kW", "5.5 kW", "7.5 kW", "11 kW", "15 kW"],
    keyFeatures: [
      "Fire mode bypass functionality",
      "BACnet/Modbus integration",
      "Sleep mode for unoccupied periods",
      "Multiple pump control",
      "PID control for pressure/temperature",
      "Harmonic mitigation for power quality"
    ]
  },
  "pump-vfd": {
    title: "VFD for Pumps - Variable Speed Drive for Water Pump Applications",
    description: "Complete guide to VFDs for pump control. Constant pressure, energy savings, water hammer prevention, and pump protection.",
    icon: Droplets,
    content: "Pump VFDs maintain constant pressure by automatically adjusting pump speed based on demand, eliminating need for throttle valves...",
    benefits: [
      "Constant pressure regardless of demand",
      "30-70% energy savings vs throttling",
      "Eliminates water hammer",
      "Soft start reduces mechanical stress",
      "Prevents pump cavitation",
      "Multiple pump sequencing"
    ],
    powerRanges: ["0.75 kW", "1.5 kW", "2.2 kW", "3.7 kW", "5.5 kW", "7.5 kW", "11 kW", "15 kW", "22 kW"],
    keyFeatures: [
      "Built-in PID controller",
      "Dry-run protection",
      "Pump alternation and sequencing",
      "Sleep/wake mode",
      "Pressure transducer input",
      "Cascade control for multiple pumps"
    ]
  }
};

const ApplicationPage = () => {
  const { application } = useParams<{ application: string }>();
  const data = application ? applicationData[application] : null;

  if (!data) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Application Not Found</h1>
          <Button asChild>
            <Link to="/vfd-guide">Browse VFD Guide</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const Icon = data.icon;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: window.location.origin },
    { name: data.title, url: window.location.href },
  ]);

  const articleSchema = generateArticleSchema({
    title: data.title,
    description: data.description,
    publishedDate: new Date().toISOString(),
    author: "VFD India Experts",
  });

  return (
    <>
      <SEOHead
        title={data.title}
        description={data.description}
        canonical={`https://yourdomain.com/${application}`}
      />
      <StructuredData data={[breadcrumbSchema, articleSchema]} />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Icon className="mr-1 h-4 w-4" />
                Application Guide
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{data.title}</h1>
              <p className="text-xl text-muted-foreground">{data.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Overview */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{data.content}</p>
          </Card>

          {/* Benefits */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Features */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Essential Features</h2>
            <ul className="space-y-3">
              {data.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Common Power Ratings */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Common Power Ratings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.powerRanges.map((power, idx) => (
                <Link
                  key={idx}
                  to={`/vfd/${power.toLowerCase().replace(" ", "")}`}
                  className="p-4 text-center bg-muted hover:bg-primary/10 hover:border-primary/30 rounded-lg border transition-all group"
                >
                  <div className="font-bold text-lg group-hover:text-primary transition-colors">
                    {power}
                  </div>
                  <div className="text-xs text-muted-foreground">View Models</div>
                </Link>
              ))}
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <h2 className="text-2xl font-bold mb-4">Need Application-Specific Advice?</h2>
            <p className="text-muted-foreground mb-6">
              Our experts can help you select the perfect VFD for your specific application.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Get Expert Consultation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop">Browse VFD Models</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ApplicationPage;