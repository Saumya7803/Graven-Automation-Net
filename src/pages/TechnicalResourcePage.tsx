import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema, generateHowToSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, BookOpen, FileText, ZoomIn, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface TechnicalResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  file_url: string;
  file_size_kb: number;
  thumbnail_url: string;
  download_count: number;
  related_page_slug: string;
  is_active: boolean;
  created_at: string;
}

const TechnicalResourcePage = () => {
  const { slug } = useParams();
  const [resource, setResource] = useState<TechnicalResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchResource();
    }
  }, [slug]);

  const fetchResource = async () => {
    try {
      const { data, error } = await supabase
        .from("technical_resources")
        .select("*")
        .eq("related_page_slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error("Resource not found");
        setLoading(false);
        return;
      }

      setResource(data);

      // Increment download count
      await supabase
        .from("technical_resources")
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq("id", data.id);

    } catch (error) {
      console.error("Error fetching resource:", error);
      toast.error("Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'diagram':
        return '📐';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
            <Button asChild>
              <Link to="/knowledge-hub">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Hub
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={resource.title}
        description={resource.description}
        canonical={`/technical/${slug}`}
      />
      <StructuredData 
        data={[
          generateArticleSchema({
            title: resource.title,
            description: resource.description,
            author: "Schneider Electric VFD Experts",
            publishedDate: resource.created_at,
            modifiedDate: resource.created_at,
            image: "/company-logo.png"
          }),
          generateHowToSchema({
            name: resource.title,
            description: resource.description,
            totalTime: "PT30M",
            steps: [{
              name: "Step 1",
              text: resource.description,
              image: "/company-logo.png"
            }]
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Technical Resources', url: '/knowledge-hub' },
            { name: resource.title, url: `/technical/${slug}` }
          ])
        ]} 
      />
      <Header />
      <main className="flex-1">
        <article className="py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/knowledge-hub">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </Button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-lg">
                  {getCategoryIcon(resource.resource_type)} {resource.resource_type}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>
              <p className="text-xl text-muted-foreground">{resource.description}</p>
            </div>

            {/* Downloadable Resources */}
            {resource.file_url && (
              <Card className="mb-8 bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Download className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Download Resources</h2>
                  </div>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    asChild
                  >
                    <a href={resource.file_url} download target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      {resource.title} ({resource.resource_type}) - {Math.round(resource.file_size_kb / 1024)}MB
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              {resource.description.split('\n\n').map((paragraph, index) => (
                <div key={index} className="mb-6">
                  {paragraph.startsWith('##') ? (
                    <h2 className="text-2xl font-bold mb-3">{paragraph.replace('##', '').trim()}</h2>
                  ) : paragraph.startsWith('#') ? (
                    <h3 className="text-xl font-semibold mb-3">{paragraph.replace('#', '').trim()}</h3>
                  ) : paragraph.startsWith('- ') ? (
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-foreground">{paragraph.replace('- ', '')}</p>
                    </div>
                  ) : (
                    <p className="text-foreground leading-relaxed">{paragraph}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Related Page */}
            {resource.related_page_slug && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Related Page</h3>
                  <Button
                    variant="outline"
                    asChild
                    className="justify-start w-full"
                  >
                    <Link to={`/${resource.related_page_slug}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Related Content
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicalResourcePage;
