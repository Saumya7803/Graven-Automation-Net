import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema, generateLocalBusinessSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Headphones, 
  Award,
  Package,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface SeriesSummary {
  series_name: string;
  series_slug: string;
  power_range_min: string;
  power_range_max: string;
  product_count: number;
}

const BuySchneiderVFDIndia = () => {
  const [seriesSummary, setSeriesSummary] = useState<SeriesSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: seriesData } = await supabase
          .from("series_pages")
          .select("series_name, series_slug, power_range_min, power_range_max")
          .eq("is_active", true)
          .order("series_name");

        if (seriesData) {
          // Get product counts for each series
          const seriesWithCounts = await Promise.all(
            seriesData.map(async (series) => {
              const { count } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("series", series.series_name)
                .eq("is_active", true);

              return {
                ...series,
                product_count: count || 0,
              };
            })
          );

          setSeriesSummary(seriesWithCounts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const faqs = [
    {
      question: "Are you an authorized Schneider Electric dealer?",
      answer: "Yes, we are an authorized distributor of Schneider Electric products in India. All our products come with manufacturer warranty and genuine certification."
    },
    {
      question: "What is the delivery time for VFD orders?",
      answer: "Most in-stock items are delivered within 3-7 business days across India. Custom orders may take 2-3 weeks depending on specifications."
    },
    {
      question: "Do you provide installation support?",
      answer: "Yes, we offer complete installation, commissioning, and technical support services. Our certified technicians can help with setup and configuration."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, cheques, and online payment methods. For bulk orders, we also offer flexible payment terms and financing options."
    },
    {
      question: "Do you offer warranty on VFD drives?",
      answer: "All Schneider Electric VFDs come with standard manufacturer warranty. Extended warranty options are also available."
    }
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Authorized Dealer",
      description: "100% genuine Schneider Electric products with warranty"
    },
    {
      icon: Package,
      title: "Large Inventory",
      description: "Over 255+ models in stock for immediate delivery"
    },
    {
      icon: Truck,
      title: "Pan-India Delivery",
      description: "Fast shipping to all major cities and industrial areas"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert technical support for selection and troubleshooting"
    },
    {
      icon: Award,
      title: "1000+ Installations",
      description: "Trusted by industrial clients across India"
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "Competitive pricing with bulk order discounts"
    }
  ];

  const orgSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();
  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Buy Schneider Electric VFD Drives in India | Authorized Dealer Delhi"
        description="Buy authentic Schneider Electric Variable Frequency Drives in India. Authorized dealer. All series: ATV320, ATV310, ATV630, ATV650. Best prices, fast delivery, technical support."
        keywords="buy schneider vfd, schneider vfd india, vfd dealer delhi, authorized schneider dealer, vfd supplier india"
        canonical="/buy-schneider-vfd-india"
      />
      <StructuredData data={[orgSchema, localBusinessSchema, faqSchema]} />

      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                Authorized Schneider Electric Dealer
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Buy Authentic Schneider Electric VFDs in India
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Complete range of Variable Frequency Drives for industrial automation. 
                Genuine products, competitive prices, and expert support.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/shop">
                  <Button size="lg" variant="secondary">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Request Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-4 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Authorized Dealer</span>
              </div>
              <div className="hidden md:block">|</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>1000+ Installations</span>
              </div>
              <div className="hidden md:block">|</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>24/7 Technical Support</span>
              </div>
              <div className="hidden md:block">|</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Pan-India Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Buy From Us */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Buy From Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your trusted partner for Schneider Electric VFD drives in India
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Product Series */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Complete Product Range</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We stock all major Schneider Electric VFD series for various industrial applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seriesSummary.map((series) => (
                <Card key={series.series_slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{series.series_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {series.power_range_min} - {series.power_range_max}
                        </p>
                      </div>
                      <Badge>{series.product_count} Models</Badge>
                    </div>
                    <Link to={`/series/${series.series_slug}`}>
                      <Button className="w-full" variant="outline">
                        View Series
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Buy Schneider VFD Drives?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Get the best prices and expert support for your industrial automation needs
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" variant="secondary">
                  Browse All Products
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Request Detailed Quote
                </Button>
              </Link>
              <a href="tel:+917905350134">
                <Button size="lg" variant="outline">
                  Call: +91 7905350134
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuySchneiderVFDIndia;
