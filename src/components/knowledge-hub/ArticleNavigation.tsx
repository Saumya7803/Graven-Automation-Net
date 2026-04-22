import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NavigationGuide {
  title: string;
  slug: string;
}

interface ArticleNavigationProps {
  previousGuide?: NavigationGuide;
  nextGuide?: NavigationGuide;
}

const ArticleNavigation = ({ previousGuide, nextGuide }: ArticleNavigationProps) => {
  if (!previousGuide && !nextGuide) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-12 pt-8 border-t">
      {/* Previous Guide */}
      <div>
        {previousGuide ? (
          <Link to={`/vfd-guide/${previousGuide.slug}`}>
            <Card className="p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="flex items-start gap-3">
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Previous</div>
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {previousGuide.title}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ) : (
          <div className="h-full" />
        )}
      </div>

      {/* Next Guide */}
      <div>
        {nextGuide ? (
          <Link to={`/vfd-guide/${nextGuide.slug}`}>
            <Card className="p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="flex items-start gap-3 justify-end text-right">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Next</div>
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {nextGuide.title}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </Card>
          </Link>
        ) : (
          <div className="h-full" />
        )}
      </div>
    </div>
  );
};

export default ArticleNavigation;
