import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Guide {
  id: string;
  title: string;
  slug: string;
  category: string;
}

interface KnowledgeHubSidebarProps {
  currentSlug?: string;
}

const KnowledgeHubSidebar = ({ currentSlug }: KnowledgeHubSidebarProps) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    basics: true,
    technical: true,
    applications: true,
  });
  const location = useLocation();

  useEffect(() => {
    const fetchGuides = async () => {
      const { data } = await supabase
        .from("knowledge_hub_pages")
        .select("id, title, slug, category")
        .eq("is_active", true)
        .order("title");

      if (data) {
        setGuides(data);
      }
    };

    fetchGuides();
  }, []);

  const guidesByCategory = guides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, Guide[]>);

  const categoryLabels = {
    basics: "Basics",
    technical: "Technical",
    applications: "Applications",
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-4">
          {/* Back to Hub Button */}
          <Link to="/vfd-guide">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
          </Link>

          {/* Category Navigation */}
          <nav className="space-y-2">
            {Object.entries(guidesByCategory).map(([category, categoryGuides]) => (
              <Collapsible
                key={category}
                open={openCategories[category]}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="font-semibold text-sm capitalize">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openCategories[category] && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1">
                  {categoryGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      to={`/vfd-guide/${guide.slug}`}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-muted/50",
                        guide.slug === currentSlug
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{guide.title}</span>
                      </div>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default KnowledgeHubSidebar;
