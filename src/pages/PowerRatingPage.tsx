import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateCollectionPageSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { ProductCard } from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  power_range: string;
  series: string;
  image_url: string | null;
  stock_quantity: number;
  short_description: string | null;
  product_category_mapping: Array<{
    product_categories: { id: string; name: string; slug: string } | null;
  }>;
}

const PowerRatingPage = () => {
  const { power } = useParams<{ power: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [isHpRoute, setIsHpRoute] = useState(false);
  const [kwEquivalent, setKwEquivalent] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!power) return;

      try {
        // Format power parameter (e.g., "22kw" or "0.55kw")
        const powerQuery = power.replace("kw", " kW").replace("KW", " kW");
        
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_category_mapping(
              product_categories(id, name, slug)
            )
          `)
          .ilike("power_range", `%${powerQuery}%`)
          .eq("is_active", true)
          .order("series");

        if (error) throw error;
        
        setProducts((data as Product[]) || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [power]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const powerDisplay = power?.toUpperCase() || "";
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: `${powerDisplay} VFDs`, url: `/vfd/${power}` },
  ];

  // Group products by series for comparison
  const seriesGroups = products.reduce((acc, product) => {
    if (!acc[product.series]) {
      acc[product.series] = [];
    }
    acc[product.series].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const collectionSchema = generateCollectionPageSchema({
    name: `${powerDisplay} Variable Frequency Drives`,
    description: `Complete range of Schneider Electric ${powerDisplay} VFD drives for industrial automation. Compare prices and features across all series.`,
    url: `/vfd/${power}`,
    breadcrumbs,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      url: `/product/${p.id}`,
      image: p.image_url || undefined,
      price: p.price || undefined,
      availability:
        p.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const avgPrice = products
    .filter(p => p.price)
    .reduce((sum, p) => sum + (p.price || 0), 0) / products.filter(p => p.price).length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`Schneider Electric ${powerDisplay} VFD Drives | Price & Specifications India`}
        description={`Buy Schneider Electric ${powerDisplay} Variable Frequency Drives in India. Compare ${powerDisplay} VFD models across ATV320, ATV310, ATV630 series. Best prices, genuine products.`}
        keywords={`schneider vfd ${power}, ${power} vfd price, ${power} variable frequency drive, atv320 ${power}, atv630 ${power}`}
        canonical={`/vfd/${power}`}
      />
      <StructuredData data={[collectionSchema, breadcrumbSchema]} />

      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-foreground">Shop</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{powerDisplay} VFDs</span>
            </nav>

            <div className="max-w-4xl">
              <Badge className="mb-4">Schneider Electric</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {powerDisplay} Variable Frequency Drives
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Complete range of {powerDisplay} VFD drives from Schneider Electric. 
                Compare specifications and prices across all series.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <Zap className="h-6 w-6 text-primary mb-2" />
                    <div className="text-2xl font-bold">{products.length}</div>
                    <div className="text-sm text-muted-foreground">Models Available</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-lg font-bold">
                      {Object.keys(seriesGroups).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Series Options</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-lg font-bold">
                      {avgPrice ? `₹${(avgPrice / 1000).toFixed(0)}k` : "Quote"}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Price</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-bold">In Stock</div>
                    <div className="text-sm text-muted-foreground">Ready to Ship</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        {Object.keys(seriesGroups).length > 1 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6">
                Compare {powerDisplay} Models Across Series
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Series</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Best For</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(seriesGroups).map(([series, seriesProducts]) =>
                          seriesProducts.slice(0, 2).map((product, idx) => (
                            <TableRow key={product.id}>
                              {idx === 0 && (
                                <TableCell rowSpan={seriesProducts.length > 1 ? 2 : 1} className="font-semibold">
                                  {series}
                                </TableCell>
                              )}
                              <TableCell className="font-medium">{product.sku}</TableCell>
                              <TableCell>
                                {product.price ? `₹${(product.price / 1000).toFixed(1)}k` : "Quote"}
                              </TableCell>
                              <TableCell>
                                {product.stock_quantity > 0 ? (
                                  <Badge variant="secondary">In Stock</Badge>
                                ) : (
                                  <Badge variant="outline">Order</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {series === "ATV320" && "Simple machines"}
                                {series === "ATV310" && "Basic applications"}
                                {series === "ATV630" && "Process control"}
                                {series === "ATV650" && "High dynamics"}
                              </TableCell>
                              <TableCell>
                                <Link to={`/product/${product.id}`}>
                                  <Button size="sm" variant="ghost">View →</Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">
              All {powerDisplay} VFD Models
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isSelected={comparisonProducts.includes(product.id)}
                  onSelectChange={(selected) => {
                    if (selected) {
                      if (comparisonProducts.length < 4) {
                        setComparisonProducts([...comparisonProducts, product.id]);
                      }
                    } else {
                      setComparisonProducts(comparisonProducts.filter(id => id !== product.id));
                    }
                  }}
                  onAddToCart={() => {}}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No {powerDisplay} VFD models found. Try browsing our complete range.
                </p>
                <Link to="/shop">
                  <Button>Browse All Products</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Typical Applications for {powerDisplay} VFDs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Pumps & Fans</h3>
                    <p className="text-sm text-muted-foreground">
                      HVAC systems, water pumps, cooling fans, exhaust systems
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Conveyors</h3>
                    <p className="text-sm text-muted-foreground">
                      Material handling, packaging lines, warehouse systems
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Mixers & Agitators</h3>
                    <p className="text-sm text-muted-foreground">
                      Chemical processing, food & beverage, wastewater treatment
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Compressors</h3>
                    <p className="text-sm text-muted-foreground">
                      Air compressors, refrigeration systems, pneumatic tools
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Selecting the Right {powerDisplay} VFD?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our experts can help you choose the perfect drive for your application
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  Get Expert Advice
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

export default PowerRatingPage;
