import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { BreadcrumbSchema } from "@/components/SEO/BreadcrumbSchema";
import { CaseStudyCard } from "@/components/case-studies/CaseStudyCard";
import { supabase } from "@/integrations/supabase/client";
import { generateOrganizationSchema } from "@/lib/seo";
import { Loader2 } from "lucide-react";

export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCaseStudies(data);
      }
      setLoading(false);
    };

    fetchCaseStudies();
  }, []);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Case Studies", url: "/case-studies" },
  ];

  return (
    <>
      <SEOHead
        title="Customer Success Stories | VFD Case Studies"
        description="Discover how businesses across industries have improved efficiency and reduced energy costs with our VFD solutions. Real results from real customers."
        keywords="vfd case studies, customer success stories, industrial automation results, energy savings case studies"
        canonical="/case-studies"
      />
      <StructuredData data={generateOrganizationSchema()} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="flex-1">
          <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Customer Success Stories
                </h1>
                <p className="text-lg text-muted-foreground">
                  See how businesses across India are transforming their operations with our VFD solutions
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : caseStudies.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No case studies available yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {caseStudies.map((study) => (
                    <CaseStudyCard key={study.id} caseStudy={study} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
