import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, CheckCircle2, Percent, TrendingDown, Package } from "lucide-react";

interface PricingPageData {
  id: string;
  page_type: string;
  product_series: string | null;
  slug: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  pricing_table_data: any;
  special_offers: string | null;
  bulk_discount_info: string | null;
  show_exact_prices: boolean;
  show_discount_info: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  series: string;
  power_range: string;
}

export default function PricingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pricingData, setPricingData] = useState<PricingPageData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricingData = async () => {
      if (!slug) return;

      setLoading(true);
      
      // Fetch pricing page data
      const { data: pricingData, error: pricingError } = await supabase
        .from("seo_pricing_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (pricingError) {
        console.error("Error fetching pricing data:", pricingError);
        setLoading(false);
        return;
      }

      setPricingData(pricingData);

      // Fetch products based on series filter
      let query = supabase
        .from("products")
        .select("id, name, sku, price, series, power_range")
        .eq("is_active", true)
        .order("power_range");

      if (pricingData.product_series) {
        query = query.eq("series", pricingData.product_series);
      }

      const { data: productsData } = await query;

      if (productsData) {
        setProducts(productsData);
      }

      setLoading(false);
    };

    fetchPricingData();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!pricingData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Pricing Page Not Found</h1>
            <p className="text-muted-foreground mb-8">The pricing page you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={pricingData.meta_title}
        description={pricingData.meta_description}
      />
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{pricingData.h1_title}</h1>
              <p className="text-lg text-muted-foreground mb-8">{pricingData.intro_text}</p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge variant="secondary" className="px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Best Price Guarantee
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Package className="w-4 h-4 mr-2" />
                  All-Inclusive Pricing
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Volume Discounts Available
                </Badge>
              </div>

              {/* CTA Button */}
              <Button size="lg" asChild>
                <a href="tel:+917905350134">
                  <Phone className="w-5 h-5 mr-2" />
                  Call for Best Quote: +91-7905350134
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Special Offers */}
        {pricingData.special_offers && (
          <section className="py-8 bg-primary/10">
            <div className="container mx-auto px-4">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Percent className="w-6 h-6 mr-3" />
                    Special Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{pricingData.special_offers}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Pricing Table */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">
              {pricingData.product_series ? `${pricingData.product_series} Price List` : "Schneider VFD Price List"}
            </h2>
            
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Model</TableHead>
                    <TableHead className="font-bold">SKU</TableHead>
                    <TableHead className="font-bold">Series</TableHead>
                    <TableHead className="font-bold">Power Range</TableHead>
                    {pricingData.show_exact_prices && (
                      <TableHead className="font-bold text-right">Price (₹)</TableHead>
                    )}
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.series}</Badge>
                      </TableCell>
                      <TableCell>{product.power_range}</TableCell>
                      {pricingData.show_exact_prices && (
                        <TableCell className="text-right font-semibold text-primary">
                          ₹{product.price.toLocaleString()}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/product/${product.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>* Prices include GST. Final prices may vary based on quantity and delivery location.</p>
              <p className="mt-2">All products are genuine Schneider Electric with full manufacturer warranty.</p>
            </div>
          </div>
        </section>

        {/* Bulk Discount Info */}
        {pricingData.show_discount_info && pricingData.bulk_discount_info && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Percent className="w-6 h-6 mr-3" />
                    Volume Discount Information
                  </CardTitle>
                  <CardDescription>Save more with bulk orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{pricingData.bulk_discount_info}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Why Choose Us for Pricing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Our Pricing is the Best</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
                    Transparent Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No hidden charges. What you see is what you pay. All prices include GST and are all-inclusive.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-primary" />
                    Competitive Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We guarantee the best prices in the market. If you find lower, we'll match it.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Percent className="w-5 h-5 mr-2 text-primary" />
                    Volume Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Special bulk pricing available for large orders. Contact us for customized quotes.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Place Your Order?</h2>
            <p className="text-xl mb-8 opacity-90">Get instant quote and same-day delivery</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <a href="tel:+917905350134">
                  <Phone className="w-5 h-5 mr-2" />
                  Call: +91-7905350134
                </a>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white" asChild>
                <a href="https://wa.me/917905350134" target="_blank" rel="noopener noreferrer">
                  WhatsApp Quote
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
