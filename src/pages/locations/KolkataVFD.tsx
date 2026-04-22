import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { BreadcrumbSchema } from "@/components/SEO/BreadcrumbSchema";
import { generateOrganizationSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Award, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function KolkataVFD() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Locations", url: "/" },
    { name: "Kolkata", url: "/locations/kolkata" },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Schneider Electric VFD Solutions - Kolkata",
    image: "https://schneidervfd.com/company-logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Salt Lake",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      postalCode: "700091",
      addressCountry: "IN",
    },
    telephone: "+91-33-XXXX-XXXX",
    priceRange: "₹₹₹",
    areaServed: ["Kolkata", "Howrah", "Durgapur", "West Bengal"],
  };

  return (
    <>
      <SEOHead
        title="VFD Supplier in Kolkata | Schneider Electric Drives West Bengal"
        description="Leading VFD supplier in Kolkata. Authorized Schneider Electric partner for industrial VFD solutions. Serving Kolkata, Howrah, Durgapur with expert support."
        keywords="vfd kolkata, vfd supplier kolkata, schneider vfd west bengal, variable frequency drive kolkata, vfd howrah, vfd durgapur"
        canonical="/locations/kolkata"
      />
      <StructuredData data={generateOrganizationSchema()} />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="flex-1">
          <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="text-primary font-semibold">Kolkata, West Bengal</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Schneider Electric VFD in Kolkata
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Empowering Eastern India's industries with reliable VFD solutions and expert technical support
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/contact">Get Quote</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/shop">View Products</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <p className="text-muted-foreground">+91-33-XXXX-XXXX</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">kolkata@schneidervfd.com</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Timing</h3>
                    <p className="text-muted-foreground">Mon-Sat: 9 AM - 7 PM</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <Award className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why Choose Us in Kolkata</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Eastern India's trusted partner",
                    "Fast delivery across Kolkata",
                    "Skilled technical support team",
                    "24/7 helpline available",
                    "Competitive local pricing",
                    "150+ installations in West Bengal",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">Service Areas in Kolkata</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    "Salt Lake", "Park Street", "Howrah",
                    "New Town", "Rajarhat", "Ballygunge",
                    "Jadavpur", "Behala", "Dum Dum",
                    "Baranagar", "Barasat", "All Kolkata Areas"
                  ].map((area, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <p className="font-medium">{area}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
