import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IndianRupee, TrendingDown, Package, FileText } from "lucide-react";

interface PriceData {
  series: string;
  power_range: string;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  product_count: number;
}

const SchneiderVFDPriceIndia = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const { data: products } = await supabase
          .from("products")
          .select("series, power_range, price")
          .eq("is_active", true)
          .not("price", "is", null);

        if (products) {
          // Group by series and calculate price ranges
          const grouped = products.reduce((acc: any, product) => {
            const key = product.series;
            if (!acc[key]) {
              acc[key] = {
                series: product.series,
                prices: [],
                power_ranges: new Set()
              };
            }
            if (product.price) {
              acc[key].prices.push(product.price);
            }
            acc[key].power_ranges.add(product.power_range);
            return acc;
          }, {});

          const priceRanges: PriceData[] = Object.values(grouped).map((group: any) => {
            const prices = group.prices.sort((a: number, b: number) => a - b);
            return {
              series: group.series,
              power_range: Array.from(group.power_ranges).join(", "),
              min_price: prices.length > 0 ? Math.min(...prices) : null,
              max_price: prices.length > 0 ? Math.max(...prices) : null,
              avg_price: prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : null,
              product_count: prices.length
            };
          });

          setPriceData(priceRanges);
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, []);

  const faqs = [
    {
      question: "What factors affect Schneider VFD prices in India?",
      answer: "VFD prices depend on several factors: power rating (kW), voltage rating (single/three phase), series features (basic vs advanced), communication protocols, additional I/O options, and bulk order quantities. Higher power drives naturally cost more due to increased component requirements."
    },
    {
      question: "Do prices include GST and shipping?",
      answer: "The prices shown are base prices exclusive of GST. Shipping charges vary based on location and order value. We offer free shipping on orders above ₹50,000 within major metros. Final invoice will include all applicable taxes."
    },
    {
      question: "Are bulk order discounts available?",
      answer: "Yes, we offer attractive discounts on bulk orders. Discounts typically start from 5% for orders above ₹2 lakhs and can go up to 15-20% for large project orders. Contact us for a customized quote."
    },
    {
      question: "How do I get the latest price list?",
      answer: "Prices are subject to change based on exchange rates and manufacturer updates. For the most current pricing, request a detailed quotation through our website or call us at +91 7905350134."
    },
    {
      question: "Do you offer financing options?",
      answer: "Yes, we work with leading financial institutions to offer flexible payment terms and financing options for qualified businesses. EMI options are available for orders above ₹1 lakh."
    }
  ];

  const pricingFactors = [
    {
      title: "Power Rating",
      description: "Higher kW ratings require larger components and more robust construction, directly impacting price."
    },
    {
      title: "Voltage Class",
      description: "Three-phase drives are typically more expensive than single-phase models due to additional circuitry."
    },
    {
      title: "Series Features",
      description: "Advanced series like ATV630/650 cost more than basic series like ATV310 due to additional features."
    },
    {
      title: "Communication Options",
      description: "Built-in Ethernet, EtherCAT, or other fieldbus protocols add to the overall cost."
    },
    {
      title: "Safety Functions",
      description: "SIL-rated safety features and redundant systems increase the drive cost but ensure safer operation."
    },
    {
      title: "Environmental Rating",
      description: "Higher IP ratings (IP54/IP55) for harsh environments require additional protection, affecting price."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Schneider VFD Price List India 2024 | All Series Price Guide"
        description="Complete Schneider VFD price list for India. ATV320, ATV310, ATV630, ATV650, ATV1200 prices. Get instant quotes. Authorized dealer with best prices."
        keywords="schneider vfd price, vfd price list india, atv320 price, schneider drive price, vfd cost india"
        canonical="/schneider-vfd-price-india"
      />
      <StructuredData data={[faqSchema]} />

      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4">Updated 2024</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Schneider VFD Price List India
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transparent pricing for all Schneider Electric Variable Frequency Drives. 
                Compare prices across series and power ratings.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact">
                  <Button size="lg">
                    Request Detailed Quote
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="lg" variant="outline">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Price Table */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">VFD Price Range by Series</h2>
              <p className="text-muted-foreground">
                Price ranges for Schneider Electric VFD drives across different series (prices in INR, exclusive of GST)
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Series</TableHead>
                        <TableHead className="font-bold">Power Range</TableHead>
                        <TableHead className="font-bold">Starting Price</TableHead>
                        <TableHead className="font-bold">Up To</TableHead>
                        <TableHead className="font-bold text-center">Models Available</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceData.map((data) => (
                        <TableRow key={data.series}>
                          <TableCell className="font-semibold">{data.series}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {data.power_range.split(",").slice(0, 2).join(", ")}...
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            {data.min_price ? `₹${(data.min_price / 1000).toFixed(1)}k` : "Quote"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {data.max_price ? `₹${(data.max_price / 1000).toFixed(1)}k` : "Quote"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{data.product_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link to={`/shop?series=${data.series}`}>
                              <Button size="sm" variant="ghost">View →</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Prices are indicative and subject to change based on specifications, 
                order quantity, and current exchange rates. GST extra as applicable. 
                Contact us for exact pricing and bulk order discounts.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Factors */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Affects VFD Pricing?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Understanding the factors that influence Variable Frequency Drive costs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingFactors.map((factor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{factor.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingDown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bulk Discounts</h3>
                  <p className="text-muted-foreground">
                    Save up to 20% on large project orders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Volume Pricing</h3>
                  <p className="text-muted-foreground">
                    Special rates for repeat customers and dealers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Flexible Terms</h3>
                  <p className="text-muted-foreground">
                    Credit facilities and EMI options available
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Pricing FAQs
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

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <IndianRupee className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Get Your Custom Quote Today
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Tell us your requirements and get the best price for Schneider VFD drives
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  Request Quotation
                </Button>
              </Link>
              <a href="tel:+917905350134">
                <Button size="lg" variant="outline">
                  Call for Price: +91 7905350134
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

export default SchneiderVFDPriceIndia;
