import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface FeaturesAndBenefitsProps {
  features?: string[];
  category?: string | null;
}

// Default benefits based on industrial automation products
const defaultBenefits = [
  "Reduces energy consumption",
  "Improves equipment lifespan",
  "Minimizes downtime",
  "Easy integration into existing systems",
  "Genuine manufacturer warranty"
];

export const FeaturesAndBenefits = ({ features, category }: FeaturesAndBenefitsProps) => {
  const hasFeatures = features && Array.isArray(features) && features.length > 0;
  
  if (!hasFeatures) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {defaultBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
