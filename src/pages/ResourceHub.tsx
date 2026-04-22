import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, FileText, Video, Download, 
  Search, ArrowRight, TrendingUp, Clock 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  meta_description: string;
  view_count: number;
  created_at: string;
}

const ResourceHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [guides, setGuides] = useState<Resource[]>([]);
  const [blogs, setBlogs] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      // Fetch knowledge hub pages
      const { data: guidesData } = await supabase
        .from("knowledge_hub_pages")
        .select("id, title, slug, category, meta_description, view_count, created_at")
        .eq("is_active", true)
        .order("view_count", { ascending: false })
        .limit(20);

      // Fetch blog posts
      const { data: blogsData } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, created_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(10);

      setGuides(guidesData?.map(g => ({ ...g, type: 'guide' })) || []);
      setBlogs(blogsData?.map(b => ({ 
        ...b, 
        type: 'blog',
        category: 'Blog',
        meta_description: b.excerpt || '',
        view_count: 0
      })) || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.meta_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.meta_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularResources = [...guides, ...blogs]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 6);

  const recentResources = [...guides, ...blogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="VFD Resource Hub | Guides, Blogs & Technical Documentation"
        description="Complete resource center for Variable Frequency Drives. Access comprehensive guides, technical articles, video tutorials, and downloadable resources for VFD selection, installation, and maintenance."
        keywords="VFD resources, VFD guides, VFD tutorials, VFD documentation, motor control guides, Schneider VFD resources, industrial automation resources"
        canonical="/resources"
      />
      <StructuredData 
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Resources', url: '/resources' }
          ])
        ]} 
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 border-b">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              VFD Resource Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your complete knowledge center for Variable Frequency Drives. 
              Access expert guides, technical articles, and resources to optimize your VFD implementation.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search guides, articles, tutorials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Categories */}
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link to="/vfd-guide">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>VFD Guides</CardTitle>
                    <CardDescription>
                      Comprehensive guides on VFD selection, installation & maintenance
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/blog">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Technical Articles</CardTitle>
                    <CardDescription>
                      In-depth technical articles and industry insights
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Video className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Step-by-step video guides and demonstrations
                  </CardDescription>
                  <Badge variant="secondary" className="w-fit">Coming Soon</Badge>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Download className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Downloads</CardTitle>
                  <CardDescription>
                    Datasheets, catalogs, and technical specifications
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">Popular Resources</h2>
                    </div>
                    <div className="space-y-4">
                      {popularResources.map((resource) => (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">
                                  {resource.category}
                                </Badge>
                                <CardTitle className="text-lg">
                                  <Link 
                                    to={resource.type === 'guide' ? `/vfd-guide/${resource.slug}` : `/blog/${resource.slug}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {resource.title}
                                  </Link>
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                  {resource.meta_description}
                                </CardDescription>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">Latest Resources</h2>
                    </div>
                    <div className="space-y-4">
                      {recentResources.map((resource) => (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">
                                  {resource.category}
                                </Badge>
                                <CardTitle className="text-lg">
                                  <Link 
                                    to={resource.type === 'guide' ? `/vfd-guide/${resource.slug}` : `/blog/${resource.slug}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {resource.title}
                                  </Link>
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                  {resource.meta_description}
                                </CardDescription>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guides" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map((guide) => (
                    <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge variant="outline" className="w-fit mb-2">
                          {guide.category}
                        </Badge>
                        <CardTitle className="line-clamp-2">
                          <Link to={`/vfd-guide/${guide.slug}`} className="hover:text-primary transition-colors">
                            {guide.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {guide.meta_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/vfd-guide/${guide.slug}`}>
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="blog" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog) => (
                    <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          <Link to={`/blog/${blog.slug}`} className="hover:text-primary transition-colors">
                            {blog.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {blog.meta_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/blog/${blog.slug}`}>
                            Read Article <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="popular" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge variant="outline" className="w-fit mb-2">
                          {resource.category}
                        </Badge>
                        <CardTitle className="line-clamp-2">
                          <Link 
                            to={resource.type === 'guide' ? `/vfd-guide/${resource.slug}` : `/blog/${resource.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {resource.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {resource.meta_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={resource.type === 'guide' ? `/vfd-guide/${resource.slug}` : `/blog/${resource.slug}`}>
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ResourceHub;
