import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ProductOverviewProps {
  description: string;
  shortDescription?: string;
}

export const ProductOverview = ({ description, shortDescription }: ProductOverviewProps) => {
  const displayText = description || shortDescription;
  
  if (!displayText) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Product Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {displayText}
        </p>
      </CardContent>
    </Card>
  );
};
