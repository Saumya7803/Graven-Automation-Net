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

export default function DelhiVFD() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Locations", url: "/" },
    { name: "Delhi", url: "/locations/delhi" },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Schneider Electric VFD Solutions - Delhi",
    image: "https://schneidervfd.com/company-logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Connaught Place",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110001",
      addressCountry: "IN",
    },
    telephone: "+91-11-XXXX-XXXX",
    priceRange: "₹₹₹",
    areaServed: ["Delhi", "NCR", "Gurgaon", "Noida", "Ghaziabad"],
  };

  return (
    <>
      <SEOHead
        title="VFD Supplier in Delhi | Schneider Electric Variable Frequency Drives"
        description="Leading VFD supplier in Delhi NCR. Authorized Schneider Electric dealer offering ATV310, ATV320, ATV340, ATV930 drives with installation, service & support across Delhi, Noida, Gurgaon."
        keywords="vfd delhi, vfd supplier delhi, schneider vfd delhi, variable frequency drive delhi ncr, vfd noida, vfd gurgaon"
        canonical="/locations/delhi"
      />
      <StructuredData data={generateOrganizationSchema()} />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="text-primary font-semibold">Delhi NCR</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Schneider Electric VFD Solutions in Delhi
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Trusted VFD supplier serving businesses across Delhi, Noida, Gurgaon, and entire NCR region with premium Schneider Electric drives
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/contact">Request Quote</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/shop">Browse Products</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-muted-foreground">+91-11-XXXX-XXXX</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">delhi@schneidervfd.com</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Working Hours</h3>
                    <p className="text-muted-foreground">Mon-Sat: 9 AM - 7 PM</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Why Choose Us in Delhi */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <Award className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why Choose Us in Delhi?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Authorized Schneider Electric dealer",
                    "Same-day delivery across Delhi NCR",
                    "On-site installation & commissioning",
                    "24/7 technical support",
                    "Competitive pricing with warranty",
                    "Serving 200+ Delhi-based businesses",
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

          {/* Service Areas */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">Areas We Serve in Delhi NCR</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    "Connaught Place", "Karol Bagh", "Rohini",
                    "Dwarka", "Janakpuri", "Mayur Vihar",
                    "Noida", "Greater Noida", "Gurgaon",
                    "Faridabad", "Ghaziabad", "All NCR Areas"
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
