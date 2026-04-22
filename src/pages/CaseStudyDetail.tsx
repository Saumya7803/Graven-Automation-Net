import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import { BreadcrumbSchema } from "@/components/SEO/BreadcrumbSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [caseStudy, setCaseStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudy = async () => {
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!error && data) {
        setCaseStudy(data);
      }
      setLoading(false);
    };

    if (slug) {
      fetchCaseStudy();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Case Study Not Found</h1>
            <p className="text-muted-foreground">The case study you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Case Studies", url: "/case-studies" },
    { name: caseStudy.title, url: `/case-studies/${slug}` },
  ];

  return (
    <>
      <SEOHead
        title={`${caseStudy.title} | Customer Success Story`}
        description={caseStudy.meta_description || caseStudy.challenge}
        keywords={caseStudy.meta_keywords?.join(", ") || ""}
        canonical={`/case-studies/${slug}`}
        ogImage={caseStudy.featured_image}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="flex-1">
          {caseStudy.featured_image && (
            <div className="h-96 overflow-hidden bg-muted">
              <img
                src={caseStudy.featured_image}
                alt={caseStudy.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <BreadcrumbSchema items={breadcrumbItems} showBreadcrumb={true} />
              
              {caseStudy.industry && (
                <Badge variant="secondary" className="mb-4">
                  {caseStudy.industry}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {caseStudy.title}
              </h1>
              
              {caseStudy.client_name && (
                <p className="text-xl text-muted-foreground mb-12">
                  Client: {caseStudy.client_name}
                </p>
              )}

              <div className="space-y-12">
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">The Challenge</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {caseStudy.challenge}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">Our Solution</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {caseStudy.solution}
                    </p>
                  </CardContent>
                </Card>

                {caseStudy.results && Object.keys(caseStudy.results).length > 0 && (
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-6 text-foreground">Results Achieved</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(caseStudy.results).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-start gap-3">
                            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-semibold text-foreground">{key}</p>
                              <p className="text-muted-foreground">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {caseStudy.testimonial && (
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-8">
                      <blockquote className="text-lg italic text-muted-foreground">
                        "{caseStudy.testimonial}"
                      </blockquote>
                      {caseStudy.client_name && (
                        <p className="mt-4 font-semibold text-foreground">
                          — {caseStudy.client_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
