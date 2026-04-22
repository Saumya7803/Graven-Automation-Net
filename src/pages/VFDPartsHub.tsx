import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, AlertCircle, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateBreadcrumbSchema } from "@/lib/seo";

const parts = [
  {
    slug: "braking-resistor",
    icon: Zap,
    title: "Braking Resistor",
    description: "Essential for high inertia loads and rapid deceleration. Learn sizing and selection.",
    keywords: ["vfd braking resistor", "brake resistor sizing", "dynamic braking"]
  },
  {
    slug: "line-choke",
    icon: Shield,
    title: "Line Choke (AC Reactor)",
    description: "Reduces harmonics and protects from voltage spikes. Improve power quality.",
    keywords: ["line choke for vfd", "ac line reactor", "input reactor"]
  },
  {
    slug: "emc-filter",
    icon: AlertCircle,
    title: "EMC Filter",
    description: "EMI suppression for regulatory compliance and equipment protection.",
    keywords: ["emc filter in vfd", "emi filter", "electromagnetic compatibility"]
  }
];

const VFDPartsHub = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: window.location.origin },
    { name: "VFD Parts", url: window.location.href },
  ]);

  return (
    <>
      <SEOHead
        title="VFD Parts & Components Guide - Braking Resistor, Line Choke, EMC Filter"
        description="Complete guide to VFD parts and components. Learn about braking resistors, line chokes, EMC filters, and other essential VFD accessories."
        keywords="vfd parts, vfd components, braking resistor, line choke, emc filter, vfd accessories"
        canonical="https://yourdomain.com/vfd-parts"
      />
      <StructuredData data={breadcrumbSchema} />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">Components Guide</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                VFD Parts & Components
              </h1>
              <p className="text-xl text-muted-foreground">
                Essential guide to VFD accessories - selection, sizing, and installation best practices
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {parts.map((part) => (
              <Link
                key={part.slug}
                to={`/vfd-components/${part.slug}`}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-lg hover:border-primary/50 transition-all">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <part.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {part.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{part.description}</p>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VFDPartsHub;