import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { HeroSection } from "@/components/location/HeroSection";
import { StatsSection } from "@/components/location/StatsSection";
import { ProductCard } from "@/components/location/ProductCard";
import { IndustriesGrid } from "@/components/location/IndustriesGrid";
import { TestimonialsCarousel } from "@/components/location/TestimonialsCarousel";
import { ProcessTimeline } from "@/components/location/ProcessTimeline";
import { FAQAccordion } from "@/components/location/FAQAccordion";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import { CTASection } from "@/components/location/CTASection";
import { BackToTop } from "@/components/location/BackToTop";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck } from "lucide-react";

interface LocationPageData {
  id: string;
  location_type: string;
  country: string;
  state: string | null;
  city: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_content: string;
  local_industries: any;
  service_areas: any;
  delivery_info: string | null;
  local_stats: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  short_description: string;
  series: string;
  power_range: string;
  image_url?: string;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string | null;
  company_name: string;
  testimonial_text: string;
  rating: number | null;
  location: string | null;
  project_type: string | null;
  is_active: boolean;
  is_featured: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [locationData, setLocationData] = useState<LocationPageData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!slug) return;

      setLoading(true);
      
      // Fetch location page data
      const { data: locationData, error: locationError } = await supabase
        .from("seo_location_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (locationError) {
        console.error("Error fetching location data:", locationError);
        setLoading(false);
        return;
      }

      setLocationData(locationData);

      // Fetch featured products with images
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          id, 
          name, 
          sku, 
          price, 
          short_description, 
          series, 
          power_range,
          product_images(image_url, is_primary)
        `)
        .eq("is_active", true)
        .limit(6);

      if (productsData) {
        // Transform to extract primary image
        const transformedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          short_description: product.short_description,
          series: product.series,
          power_range: product.power_range,
          image_url: product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                    product.product_images?.[0]?.image_url || 
                    null
        }));
        setProducts(transformedProducts);
      }

      // Fetch testimonials from database
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (testimonialsData) {
        setTestimonials(testimonialsData);
      }

      setLoading(false);
    };

    fetchLocationData();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!locationData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Location Not Found</h1>
            <p className="text-muted-foreground">
              The location you're looking for doesn't exist.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // FAQ data
  const faqs: FAQ[] = [
    {
      question: `Where can I buy Schneider VFD in ${locationData.city}?`,
      answer: `We are Schneider Electric VFD suppliers in ${locationData.city}. Contact us at +91-7905350134 for immediate assistance and best prices.`,
    },
    {
      question: `Do you offer same-day delivery in ${locationData.city}?`,
      answer: `Yes, we offer same-day delivery for in-stock Schneider VFDs across ${locationData.city}. Contact us to check availability for your required model.`,
    },
    {
      question: `What Schneider VFD series are available in ${locationData.city}?`,
      answer: "We stock the complete Altivar range including ATV310, ATV320, ATV340, ATV71, ATV930 and more. All power ratings from 0.37kW to 630kW available.",
    },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `VFD Supplier in ${locationData.city}`,
    description: locationData.meta_description,
    address: {
      "@type": "PostalAddress",
      addressLocality: locationData.city,
      addressRegion: locationData.state,
      addressCountry: "IN",
    },
    areaServed: locationData.service_areas?.map((area: string) => ({
      "@type": "City",
      name: area,
    })) || [],
  };

  return (
    <>
      <SEOHead
        title={locationData.meta_title}
        description={locationData.meta_description}
        canonical={`https://yourdomain.com/locations/${locationData.slug}`}
      />
      <StructuredData data={localBusinessSchema} />
      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection
          city={locationData.city}
          state={locationData.state || ""}
          title={locationData.h1_title}
          description={locationData.meta_description}
        />

        {/* Stats Section */}
        <StatsSection
          yearsExperience={15}
          happyCustomers={1800}
          productsInStock={500}
          citiesCovered={50}
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Industries Served */}
        {locationData.local_industries && locationData.local_industries.length > 0 && (
          <IndustriesGrid industries={locationData.local_industries} />
        )}

        {/* Featured Products */}
        {products.length > 0 && (
          <section className="py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Featured VFD Products
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore our range of Variable Frequency Drives from leading brands
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.short_description}
                    image={product.image_url}
                    price={product.price}
                    specifications={{
                      power: product.power_range,
                    }}
                    stockStatus="in_stock"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process Timeline */}
        <ProcessTimeline />

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <TestimonialsCarousel 
            testimonials={testimonials.map(t => ({
              id: t.id,
              name: t.customer_name,
              company: t.company_name,
              role: t.customer_title || '',
              rating: t.rating || 5,
              content: t.testimonial_text
            }))} 
          />
        )}

        {/* Service Areas */}
        {locationData.service_areas && locationData.service_areas.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="w-6 h-6 text-primary" />
                    Service Areas in {locationData.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {locationData.service_areas.map((area: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-2 px-4 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Delivery Information */}
        {locationData.delivery_info && (
          <section className="py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4">
              <Card className="max-w-4xl mx-auto border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Truck className="w-6 h-6 text-primary" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {locationData.delivery_info}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* FAQs */}
        <FAQAccordion faqs={faqs} />

        {/* CTA Section */}
        <CTASection />

        {/* Back to Top Button */}
        <BackToTop />
      </main>

      <Footer />
    </>
  );
}
