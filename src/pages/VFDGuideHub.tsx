import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, FileText, Wrench, Zap } from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateBreadcrumbSchema } from "@/lib/seo";

interface GuideCategory {
  category: string;
  icon: any;
  description: string;
}

const categories: GuideCategory[] = [
  { category: "basics", icon: BookOpen, description: "Fundamental VFD concepts and terminology" },
  { category: "technical", icon: Wrench, description: "Technical details and specifications" },
  { category: "applications", icon: Zap, description: "Industry-specific applications and use cases" },
];

const VFDGuideHub = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      const { data, error } = await supabase
        .from("knowledge_hub_pages")
        .select("*")
        .eq("is_active", true)
        .order("view_count", { ascending: false });

      if (error) {
        console.error("Error fetching guides:", error);
      } else {
        setGuides(data || []);
      }
      setLoading(false);
    };

    fetchGuides();
  }, []);

  const filteredGuides = guides.filter((guide) =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.meta_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: window.location.origin },
    { name: "VFD Guide", url: window.location.href },
  ]);

  return (
    <>
      <SEOHead
        title="VFD Guide - Complete Variable Frequency Drive Knowledge Center"
        description="Comprehensive VFD guide covering everything from basics to advanced topics. Learn about VFD working principle, types, applications, parameters, and more."
        keywords="vfd guide, vfd tutorial, vfd learning, variable frequency drive guide, vfd basics, vfd technical guide"
        canonical="/vfd-guide"
      />
      <StructuredData data={breadcrumbSchema} />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">
                <BookOpen className="h-4 w-4 mr-1" />
                Knowledge Center
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Complete VFD Guide
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Everything you need to know about Variable Frequency Drives - from basics to advanced topics
              </p>
              
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold capitalize">{cat.category}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </Card>
            ))}
          </div>

          {/* Guides Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {searchTerm ? `Search Results (${filteredGuides.length})` : "All Guides"}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/vfd-guide/${guide.slug}`}
                  className="group"
                >
                  <Card className="p-6 h-full hover:shadow-lg hover:border-primary/50 transition-all">
                    <Badge variant="secondary" className="mb-3 capitalize">
                      {guide.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {guide.meta_description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Expert Guide</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VFDGuideHub;