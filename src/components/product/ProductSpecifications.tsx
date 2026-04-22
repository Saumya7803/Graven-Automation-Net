import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

interface Specification {
  spec_key: string;
  spec_value: string;
}

interface ProductSpecificationsProps {
  specifications: Specification[];
}

export const ProductSpecifications = ({ specifications }: ProductSpecificationsProps) => {
  if (!specifications || specifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ClipboardList className="h-5 w-5 text-primary" />
            Technical Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Technical specifications not available. Contact us for detailed product information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardList className="h-5 w-5 text-primary" />
          Technical Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          {specifications.map((spec, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
            >
              <span className="font-medium text-foreground">{spec.spec_key}</span>
              <span className="text-muted-foreground text-right">{spec.spec_value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
