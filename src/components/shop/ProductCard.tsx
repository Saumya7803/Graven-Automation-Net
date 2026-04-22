import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { FileText, Eye } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import product1 from "@/assets/product-vfd-1.jpg";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { generateProductAlt } from "@/lib/imageAltTags";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    series: string;
    power_range: string;
    price: number | null;
    sku: string;
    short_description: string;
    brand?: string;
    stock_quantity?: number;
    is_quote_only?: boolean;
    is_active?: boolean;
    lifecycle_status?: string | null;
    has_replacements?: boolean;
    image_url?: string | null;
    product_category_mapping?: Array<{
      product_categories: { id: string; name: string; slug: string };
    }>;
  };
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onAddToCart?: () => void; // Optional for backwards compatibility
}

export const ProductCard = ({ product, isSelected, onSelectChange }: ProductCardProps) => {
  // Get categories from junction table
  const categories = product.product_category_mapping?.map(
    (m) => m.product_categories.name
  ) || [];
  const categoryText = categories.length > 0 ? categories[0] : undefined;

  // Determine lifecycle status (string type from DB)
  const lifecycleStatus = product.lifecycle_status || (product.is_active === false ? 'discontinued' : 'active');
  const isDiscontinuedOrObsolete = lifecycleStatus !== 'active';

  // Determine availability badge
  const getAvailabilityBadge = () => {
    if (product.stock_quantity && product.stock_quantity > 0) {
      return { label: "In Stock", className: "bg-green-600" };
    }
    return { label: "On Request", className: "bg-orange-500" };
  };

  // Determine lifecycle badge
  const getLifecycleBadge = () => {
    if (lifecycleStatus === 'discontinued') {
      return { label: "Discontinued", className: "bg-yellow-500 text-yellow-950" };
    }
    if (lifecycleStatus === 'obsolete') {
      return { label: "End-of-Life", className: "bg-red-500" };
    }
    return null;
  };

  const availability = getAvailabilityBadge();
  const lifecycle = getLifecycleBadge();

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-border overflow-hidden relative",
      isDiscontinuedOrObsolete && "border-yellow-200"
    )}>
      {/* Compare Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectChange}
                className="bg-background border-2"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to comparison</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Product Image */}
      <div className="relative overflow-hidden bg-card">
        <OptimizedImage
          src={product.image_url || product1}
          alt={generateProductAlt({
            name: product.name,
            series: product.series,
            power_range: product.power_range,
            sku: product.sku,
            category: categoryText
          })}
          width={600}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges Container */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {lifecycle && (
            <Badge className={lifecycle.className}>
              {lifecycle.label}
            </Badge>
          )}
          {!isDiscontinuedOrObsolete && (
            <Badge className={cn(availability.className)}>
              {availability.label}
            </Badge>
          )}
        </div>

        {/* Replacement Available Indicator */}
        {isDiscontinuedOrObsolete && product.has_replacements && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-background/90 text-xs">
              Replacement Available
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Brand & Series Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {product.brand && (
            <Badge variant="default" className="text-xs bg-primary/90">
              {product.brand}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {product.series}
          </Badge>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* SKU */}
        <p className="text-xs text-muted-foreground font-mono mb-2">
          {product.sku}
        </p>

        {/* Category */}
        {categories.length > 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            {categories[0]}{categories.length > 1 && ` +${categories.length - 1} more`}
          </p>
        )}

        {/* Power Range */}
        {product.power_range && (
          <p className="text-xs text-muted-foreground">
            Power: {product.power_range}
          </p>
        )}

        {/* Price */}
        {product.price && !product.is_quote_only ? (
          <p className="text-lg font-bold text-primary mt-2">
            {formatCurrency(product.price)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2 italic">
            Price on Request
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {/* Primary CTA - Request Quote */}
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/product/${product.id}`}>
            <FileText className="mr-2 h-4 w-4" />
            {product.price && !product.is_quote_only ? "Buy Now" : "Request Price"}
          </Link>
        </Button>
        
        {/* Secondary CTA - View Details */}
        <Button asChild variant="outline" className="w-full">
          <Link to={`/product/${product.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
