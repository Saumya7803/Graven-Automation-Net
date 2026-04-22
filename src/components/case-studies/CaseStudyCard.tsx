import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name?: string;
  client_logo_url?: string;
  industry?: string;
  challenge: string;
  featured_image?: string;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export const CaseStudyCard = ({ caseStudy }: CaseStudyCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {caseStudy.featured_image && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={caseStudy.featured_image}
            alt={caseStudy.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-6 flex-1">
        {caseStudy.industry && (
          <Badge variant="secondary" className="mb-3">
            {caseStudy.industry}
          </Badge>
        )}
        
        <h3 className="text-xl font-semibold mb-3 text-foreground line-clamp-2">
          {caseStudy.title}
        </h3>
        
        {caseStudy.client_name && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{caseStudy.client_name}</span>
          </div>
        )}
        
        <p className="text-muted-foreground line-clamp-3">
          {caseStudy.challenge}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button asChild variant="ghost" className="group">
          <Link to={`/case-studies/${caseStudy.slug}`}>
            Read Case Study
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
