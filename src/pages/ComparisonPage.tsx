import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeftRight } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

interface ComparisonPageData {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  meta_keywords: string[] | null;
  product_a_name: string;
  product_b_name: string;
  comparison_data: any;
  faqs: any;
}

const ComparisonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ComparisonPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("comparison_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching comparison page:", error);
      } else {
        setPage(data);
      }
      
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </>
    );
  }

  if (!page) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Comparison Not Found</h1>
          <p className="text-muted-foreground mb-8">The comparison you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: window.location.origin },
    { name: page.title, url: window.location.href },
  ]);

  const articleSchema = generateArticleSchema({
    title: page.title,
    description: page.meta_description,
    publishedDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    author: "VFD India Experts",
  });

  const faqSchema = page.faqs?.length ? generateFAQSchema(page.faqs) : null;

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.meta_description}
        keywords={page.meta_keywords?.join(", ")}
        canonical={`https://yourdomain.com/${slug}`}
      />
      <StructuredData data={[breadcrumbSchema, articleSchema, ...(faqSchema ? [faqSchema] : [])]} />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">Comprehensive Comparison</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{page.title}</h1>
              <p className="text-xl text-muted-foreground mb-8">{page.meta_description}</p>
              
              <div className="flex items-center justify-center gap-8 text-2xl font-semibold">
                <span className="text-primary">{page.product_a_name}</span>
                <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                <span className="text-secondary">{page.product_b_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Explanation Section (for VSD vs VFD style) */}
          {page.comparison_data.explanation && (
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Understanding the Difference</h2>
              <p className="text-lg mb-6">{page.comparison_data.explanation}</p>
              
              {page.comparison_data.terminology && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {Object.entries(page.comparison_data.terminology).map(([key, value]) => (
                    <div key={key} className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-semibold uppercase text-sm text-primary mb-2">{key}</div>
                      <div className="text-muted-foreground">{String(value)}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {page.comparison_data.regional && (
                <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm">
                    <span className="font-semibold">Regional Usage: </span>
                    {page.comparison_data.regional}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Feature Comparison Table */}
          {page.comparison_data.features && page.comparison_data.features.length > 0 && (
            <Card className="overflow-hidden mb-8">
              <div className="bg-muted p-6 border-b">
                <h2 className="text-2xl font-bold">Feature Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-left p-4 font-semibold text-primary">{page.product_a_name}</th>
                      <th className="text-left p-4 font-semibold text-secondary">{page.product_b_name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.comparison_data.features.map((feature: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4">{feature.vfd || feature[Object.keys(feature)[1]]}</td>
                        <td className="p-4">{feature.soft_starter || feature.vsd || feature[Object.keys(feature)[2]]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* When to Use Section */}
          {page.comparison_data.when_to_use && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 border-primary/20 bg-primary/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  When to Use {page.product_a_name}
                </h3>
                <ul className="space-y-3">
                  {(page.comparison_data.when_to_use.vfd || []).map((use: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              
              <Card className="p-6 border-secondary/20 bg-secondary/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-secondary" />
                  When to Use {page.product_b_name}
                </h3>
                <ul className="space-y-3">
                  {(page.comparison_data.when_to_use.soft_starter || page.comparison_data.when_to_use.vsd || []).map((use: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* FAQs */}
          {page.faqs && page.faqs.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {page.faqs.map((faq: any, idx: number) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}

          {/* CTA */}
          <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
            <p className="text-muted-foreground mb-6">
              Our experts can help you select the right solution for your application.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ComparisonPage;