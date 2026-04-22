import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  readTime: string;
  category: string;
  link: string;
  isExternal?: boolean;
}

const ResourcesSection = () => {
  const articles: Article[] = [
    {
      id: "1",
      title: "ATV630 VFD Setup & Configuration Guide",
      description: "Complete step-by-step guide to setting up and configuring the ATV630 series variable frequency drive",
      featuredImage: "/src/assets/product-vfd-1.jpg",
      readTime: "8 min read",
      category: "Product Demo",
      link: "/blog",
      isExternal: false,
    },
    {
      id: "2",
      title: "How to Choose the Right VFD for Your Application",
      description: "Expert guidance on selecting the perfect VFD based on motor power, application requirements, and environmental factors",
      featuredImage: "/src/assets/product-vfd-2.jpg",
      readTime: "6 min read",
      category: "Tutorial",
      link: "/blog",
      isExternal: false,
    },
    {
      id: "3",
      title: "Manufacturing Success: 40% Energy Savings Case Study",
      description: "See how ABC Manufacturing achieved significant energy savings and improved process control with our VFD solutions",
      featuredImage: "/src/assets/product-vfd-3.jpg",
      readTime: "4 min read",
      category: "Case Study",
      link: "/blog",
      isExternal: false,
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Technical Resources & Guides</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Product guides, installation tutorials, and customer success stories
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={article.link}
              className="block"
            >
              <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span>Read Article</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {article.readTime}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
