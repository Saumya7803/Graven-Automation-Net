import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo";

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="VFD Technical Guides & Resources | Schneider Electric Drive Selection Tips"
        description="Expert guides on Variable Frequency Drives, motor control, VFD selection, installation tips, troubleshooting, and Schneider Electric Altivar drive applications."
        keywords="VFD guides, motor control tips, drive selection, VFD troubleshooting, Altivar guides, industrial automation blog, VFD applications"
        canonical="/blog"
      />
      <StructuredData data={generateOrganizationSchema()} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="p-6">
                <Badge className="mb-2">Blog</Badge>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.published_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts available</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
