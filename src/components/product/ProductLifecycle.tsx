import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductReplacements } from "@/hooks/useProductReplacements";
import { ReplacementProducts } from "./ReplacementProducts";

type LifecycleStatus = 'active' | 'discontinued' | 'obsolete';

interface ProductLifecycleProps {
  productId?: string;
  isActive: boolean;
  lifecycleStatus?: LifecycleStatus | null;
  series?: string;
  category?: string | null;
}

const LIFECYCLE_CONFIG = {
  discontinued: {
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50/50',
    iconColor: 'text-yellow-600',
    Icon: AlertCircle,
    title: 'This model has been discontinued by the manufacturer',
    message: 'We support sourcing and identifying suitable alternatives. Contact our team for availability or explore replacement options below.'
  },
  obsolete: {
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50/50',
    iconColor: 'text-red-600',
    Icon: AlertTriangle,
    title: 'This product has reached End-of-Life (EOL)',
    message: 'OEM support is no longer available for this model. We can help you find compatible replacements from current product lines.'
  }
};

export const ProductLifecycle = ({ 
  productId,
  isActive, 
  lifecycleStatus,
  series, 
  category 
}: ProductLifecycleProps) => {
  // Determine effective status
  const effectiveStatus: LifecycleStatus = lifecycleStatus || (isActive ? 'active' : 'discontinued');
  
  // Fetch replacements if product is not active
  const { replacements, loading: replacementsLoading, hasReplacements } = useProductReplacements(
    effectiveStatus !== 'active' ? productId : undefined
  );

  // Only show if discontinued or obsolete
  if (effectiveStatus === 'active') return null;

  const config = LIFECYCLE_CONFIG[effectiveStatus];
  const { Icon, borderColor, bgColor, iconColor, title, message } = config;

  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className={`h-5 w-5 ${iconColor}`} />
          Product Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lifecycle Status Message */}
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>

        {/* Replacement Products Section */}
        {replacementsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading alternatives...</span>
          </div>
        ) : hasReplacements ? (
          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-4">Replacement & Alternative Options</h4>
            <ReplacementProducts replacements={replacements} />
          </div>
        ) : series ? (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Looking for alternatives?
            </p>
            <Button variant="outline" asChild>
              <Link to={`/shop?series=${encodeURIComponent(series)}`}>
                View {series} Series Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
