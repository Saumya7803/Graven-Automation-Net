import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileText, ArrowRight, Download, List } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";
import KnowledgeHubSidebar from "@/components/knowledge-hub/KnowledgeHubSidebar";
import TableOfContents from "@/components/knowledge-hub/TableOfContents";
import ArticleNavigation from "@/components/knowledge-hub/ArticleNavigation";
import MobileKnowledgeNav from "@/components/knowledge-hub/MobileKnowledgeNav";
import ReadingProgress from "@/components/knowledge-hub/ReadingProgress";
import { SUPABASE_URL } from "@/integrations/supabase/config";

interface KnowledgePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  meta_keywords: string[] | null;
  content: string;
  category: string;
  faqs: any;
  downloadable_resources: any;
  related_products: string[] | null;
}

const VFDGuidePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<KnowledgePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPages, setRelatedPages] = useState<Array<{ slug: string; title: string; category: string }>>([]);
  const [allGuides, setAllGuides] = useState<Array<{ slug: string; title: string; category: string }>>([]);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("knowledge_hub_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching guide page:", error);
      } else if (data) {
        setPage(data);
        
        // Fetch related pages from same category
        const { data: related } = await supabase
          .from("knowledge_hub_pages")
          .select("slug, title, category")
          .eq("category", data.category)
          .eq("is_active", true)
          .neq("slug", slug)
          .limit(3);
        
        if (related) setRelatedPages(related);
      }

      // Fetch all guides for navigation
      const { data: allGuidesData } = await supabase
        .from("knowledge_hub_pages")
        .select("slug, title, category")
        .eq("is_active", true)
        .order("title");

      if (allGuidesData) setAllGuides(allGuidesData);
      
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-8" />
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
          <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
          <p className="text-muted-foreground mb-8">The guide you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/vfd-guide">Browse All Guides</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate navigation (previous/next)
  const currentIndex = allGuides.findIndex((g) => g.slug === slug);
  const previousGuide = currentIndex > 0 ? allGuides[currentIndex - 1] : undefined;
  const nextGuide = currentIndex < allGuides.length - 1 ? allGuides[currentIndex + 1] : undefined;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: window.location.origin },
    { name: "VFD Guide", url: `${window.location.origin}/vfd-guide` },
    { name: page.title, url: window.location.href },
  ]);

  const articleSchema = generateArticleSchema({
    title: page.title,
    description: page.meta_description,
    publishedDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    author: "VFD India Experts",
    image: `${SUPABASE_URL}/storage/v1/object/public/content-images/vfd-guide-header.jpg`,
  });

  const faqSchema = page.faqs?.length ? generateFAQSchema(page.faqs) : null;

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.meta_description}
        keywords={page.meta_keywords?.join(", ")}
        canonical={`/vfd-guide/${slug}`}
      />
      <StructuredData data={[breadcrumbSchema, articleSchema, ...(faqSchema ? [faqSchema] : [])]} />
      
      <ReadingProgress />
      <Header />

      <div className="flex min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Desktop Sidebar */}
        <div className="hidden xl:block">
          <KnowledgeHubSidebar currentSlug={slug} />
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-20 xl:pb-8">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <Link to="/vfd-guide" className="hover:text-foreground transition-colors">VFD Guide</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{page.title}</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            <div className="flex gap-8">
              {/* Article Content */}
              <article className="flex-1 max-w-4xl">
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span className="capitalize">{page.category}</span>
                    <span>•</span>
                    <span>Expert Guide</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
                  <p className="text-xl text-muted-foreground">{page.meta_description}</p>
                </div>

                {/* Mobile TOC Trigger */}
                <div className="xl:hidden mb-6">
                  <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <List className="h-4 w-4 mr-2" />
                        Table of Contents
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Table of Contents</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <TableOfContents content={page.content} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Main Content */}
                <Card className="p-8 mb-8">
                  <div 
                    className="prose prose-lg max-w-none article-content"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </Card>

                {/* Downloadable Resources */}
                {page.downloadable_resources && page.downloadable_resources.length > 0 && (
                  <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Download className="h-6 w-6 text-primary" />
                      Downloadable Resources
                    </h2>
                    <div className="grid gap-3">
                      {page.downloadable_resources.map((resource: any, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start h-auto py-3"
                          asChild
                        >
                          <a href={resource.url} download>
                            <FileText className="h-4 w-4 mr-2" />
                            <div className="text-left">
                              <div className="font-semibold">{resource.title}</div>
                              <div className="text-xs text-muted-foreground">{resource.type}</div>
                            </div>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* FAQs */}
                {page.faqs && page.faqs.length > 0 && (
                  <Card className="p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {page.faqs.map((faq: any, idx: number) => (
                        <AccordionItem key={idx} value={`faq-${idx}`}>
                          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Card>
                )}

                {/* Previous/Next Navigation */}
                <ArticleNavigation previousGuide={previousGuide} nextGuide={nextGuide} />

                {/* Related Guides */}
                {relatedPages.length > 0 && (
                  <Card className="p-6 mt-12">
                    <h2 className="text-2xl font-bold mb-4">Related Guides</h2>
                    <div className="grid gap-4">
                      {relatedPages.map((related) => (
                        <Link
                          key={related.slug}
                          to={`/vfd-guide/${related.slug}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all group"
                        >
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {related.title}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">{related.category}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}
              </article>

              {/* Desktop Table of Contents */}
              <TableOfContents content={page.content} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileKnowledgeNav currentSlug={slug} onTocClick={() => setTocOpen(true)} />
      
      <Footer />
    </>
  );
};

export default VFDGuidePage;
