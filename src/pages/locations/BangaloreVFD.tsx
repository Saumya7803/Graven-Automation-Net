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

export default function BangaloreVFD() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Locations", url: "/" },
    { name: "Bangalore", url: "/locations/bangalore" },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Schneider Electric VFD Solutions - Bangalore",
    image: "https://schneidervfd.com/company-logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Whitefield",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      postalCode: "560066",
      addressCountry: "IN",
    },
    telephone: "+91-80-XXXX-XXXX",
    priceRange: "₹₹₹",
    areaServed: ["Bangalore", "Mysore", "Mangalore", "Karnataka"],
  };

  return (
    <>
      <SEOHead
        title="VFD Supplier in Bangalore | Schneider Electric Drives Karnataka"
        description="Leading VFD supplier in Bangalore. Authorized Schneider Electric distributor for industrial automation. Serving Bangalore, Mysore, Mangalore with premium VFD solutions."
        keywords="vfd bangalore, vfd supplier bangalore, schneider vfd karnataka, variable frequency drive bangalore, vfd mysore, vfd mangalore"
        canonical="/locations/bangalore"
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
                  <span className="text-primary font-semibold">Bangalore, Karnataka</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Schneider Electric VFD in Bangalore
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Powering IT hubs and manufacturing industries in India's Silicon Valley with advanced VFD technology
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
                    <p className="text-muted-foreground">+91-80-XXXX-XXXX</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">bangalore@schneidervfd.com</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Hours</h3>
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
                  <h2 className="text-3xl font-bold">Why Bangalore Businesses Choose Us</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "IT industry specialist solutions",
                    "Rapid deployment across Bangalore",
                    "Certified installation engineers",
                    "24/7 technical support hotline",
                    "Energy-efficient solutions",
                    "250+ successful installations",
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
                <h2 className="text-3xl font-bold mb-8 text-center">Our Service Areas in Bangalore</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    "Whitefield", "Electronic City", "Koramangala",
                    "Indiranagar", "Marathahalli", "BTM Layout",
                    "Yelahanka", "HSR Layout", "Hebbal",
                    "Jayanagar", "JP Nagar", "Banashankari"
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
