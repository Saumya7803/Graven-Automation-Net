import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateCollectionPageSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { ProductCard } from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Settings, Shield, TrendingUp } from "lucide-react";

interface SeriesPageData {
  id: string;
  series_slug: string;
  series_name: string;
  title: string;
  meta_description: string;
  meta_keywords: string[];
  hero_title: string;
  hero_description: string;
  content: string;
  power_range_min: string;
  power_range_max: string;
}

interface SeriesFAQ {
  question: string;
  answer: string;
}

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

const SeriesPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [seriesData, setSeriesData] = useState<SeriesPageData | null>(null);
  const [faqs, setFaqs] = useState<SeriesFAQ[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        // Fetch series page data
        const { data: series, error: seriesError } = await supabase
          .from("series_pages")
          .select("*")
          .eq("series_slug", slug)
          .eq("is_active", true)
          .single();

        if (seriesError) throw seriesError;
        setSeriesData(series);

        // Fetch FAQs
        const { data: faqData, error: faqError } = await supabase
          .from("series_faqs")
          .select("question, answer")
          .eq("series_slug", slug)
          .order("display_order");

        if (!faqError && faqData) {
          setFaqs(faqData);
        }

        // Fetch products matching this series
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            *,
            product_category_mapping(
              product_categories(id, name, slug)
            )
          `)
          .eq("series", series.series_name)
          .eq("is_active", true)
          .order("power_range");

        if (!productsError && productsData) {
          setProducts(productsData as Product[]);
        }
      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
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

  if (!seriesData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Series Not Found</h1>
            <Link to="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: seriesData.series_name, url: `/series/${slug}` },
  ];

  const collectionSchema = generateCollectionPageSchema({
    name: seriesData.title,
    description: seriesData.meta_description,
    url: `/series/${slug}`,
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

  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const priceRange = products.reduce(
    (acc, p) => {
      if (p.price) {
        acc.min = Math.min(acc.min, p.price);
        acc.max = Math.max(acc.max, p.price);
      }
      return acc;
    },
    { min: Infinity, max: 0 }
  );

  const schemas = [collectionSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={seriesData.title}
        description={seriesData.meta_description}
        keywords={seriesData.meta_keywords?.join(", ")}
        canonical={`/series/${slug}`}
      />
      <StructuredData data={schemas} />

      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-foreground">Shop</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{seriesData.series_name}</span>
            </nav>

            <div className="max-w-4xl">
              <Badge className="mb-4">Schneider Electric</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {seriesData.hero_title}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {seriesData.hero_description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card p-4 rounded-lg border">
                  <Zap className="h-6 w-6 text-primary mb-2" />
                  <div className="text-2xl font-bold">{products.length}</div>
                  <div className="text-sm text-muted-foreground">Models</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <Settings className="h-6 w-6 text-primary mb-2" />
                  <div className="text-lg font-bold">
                    {seriesData.power_range_min} - {seriesData.power_range_max}
                  </div>
                  <div className="text-sm text-muted-foreground">Power Range</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <div className="text-sm font-bold">Authorized</div>
                  <div className="text-sm text-muted-foreground">Dealer</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <TrendingUp className="h-6 w-6 text-primary mb-2" />
                  <div className="text-lg font-bold">
                    {priceRange.min !== Infinity ? `₹${(priceRange.min / 1000).toFixed(0)}k+` : "Quote"}
                  </div>
                  <div className="text-sm text-muted-foreground">Starting From</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="#products">
                  <Button size="lg">
                    View All Models
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

        {/* Content Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: seriesData.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Available {seriesData.series_name} Models
              </h2>
              <p className="text-muted-foreground">
                Choose from {products.length} models ranging from {seriesData.power_range_min} to {seriesData.power_range_max}
              </p>
            </div>

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
                <p className="text-muted-foreground">No products available in this series.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        {faqs.length > 0 && (
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
        )}

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Selecting the Right {seriesData.series_name}?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our technical experts are here to help you choose the perfect VFD for your application
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  Contact Technical Support
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

export default SeriesPage;
