import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { FileText, Eye, ArrowRight, Info } from "lucide-react";
import { Replacement, REPLACEMENT_TYPE_LABELS } from "@/hooks/useProductReplacements";
import product1 from "@/assets/product-vfd-1.jpg";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReplacementProductsProps {
  replacements: Replacement[];
}

const REPLACEMENT_TYPE_COLORS: Record<string, string> = {
  'oem_recommended': 'bg-green-100 text-green-700 border-green-200',
  'same_brand_series': 'bg-blue-100 text-blue-700 border-blue-200',
  'functional_equivalent': 'bg-purple-100 text-purple-700 border-purple-200',
  'compatible_alternative': 'bg-orange-100 text-orange-700 border-orange-200'
};

export const ReplacementProducts = ({ replacements }: ReplacementProductsProps) => {
  if (replacements.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {replacements.map((replacement) => (
          <Card key={replacement.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              {/* Replacement Type Badge */}
              <Badge 
                className={`absolute top-3 left-3 z-10 ${REPLACEMENT_TYPE_COLORS[replacement.replacement_type] || 'bg-gray-100 text-gray-700'}`}
              >
                {REPLACEMENT_TYPE_LABELS[replacement.replacement_type] || replacement.replacement_type}
              </Badge>

              {/* Product Image */}
              <div className="aspect-[4/3] bg-muted">
                <OptimizedImage
                  src={replacement.product.image_url || product1}
                  alt={replacement.product.name}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Product Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {replacement.product.brand && (
                    <Badge variant="outline" className="text-xs">
                      {replacement.product.brand}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    {replacement.product.sku}
                  </span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2">
                  {replacement.product.name}
                </h4>
                {replacement.product.power_range && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Power: {replacement.product.power_range}
                  </p>
                )}
              </div>

              {/* Compatibility Notes */}
              {replacement.compatibility_notes && (
                <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <p>{replacement.compatibility_notes}</p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-muted-foreground line-clamp-2">
                    {replacement.compatibility_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/product/${replacement.product.id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View Details
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/product/${replacement.product.id}`}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Get Quote
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Link */}
      {replacements.length > 3 && (
        <div className="text-center pt-2">
          <Button variant="ghost" className="text-primary">
            View all alternatives
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
