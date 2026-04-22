import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ShoppingCart, Zap, AlertCircle, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import RequestQuotationDialog from "@/components/rfq/RequestQuotationDialog";
import { QuickViewDialog } from "./QuickViewDialog";
import { useProcurementListContext } from "@/contexts/ProcurementListContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  price?: number;
  specifications?: {
    power?: string;
    voltage?: string;
    [key: string]: any;
  };
  stockStatus?: "in_stock" | "limited" | "out_of_stock";
  slug?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price,
  specifications,
  stockStatus = "in_stock",
  slug,
}: ProductCardProps) => {
  const [isRfqDialogOpen, setIsRfqDialogOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { user } = useAuth();
  const { isInList, toggleItem, loading: procurementLoading } = useProcurementListContext();
  const inProcurementList = isInList(id);
  
  const getStockBadge = () => {
    const statusConfig = {
      in_stock: { label: "In Stock", variant: "default" as const, className: "bg-green-500" },
      limited: { label: "Limited Stock", variant: "secondary" as const, className: "bg-orange-500" },
      out_of_stock: { label: "Out of Stock", variant: "destructive" as const, className: "bg-red-500" },
    };
    return statusConfig[stockStatus];
  };

  const stock = getStockBadge();

  return (
    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="w-16 h-16 text-primary/20" />
          </div>
        )}
        
        {/* Stock Badge */}
        <Badge className={`absolute top-3 right-3 ${stock.className} text-white border-0`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          {stock.label}
        </Badge>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="shadow-lg"
            onClick={() => setIsQuickViewOpen(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Specifications */}
        {specifications && (
          <div className="flex flex-wrap gap-2">
            {specifications.power && (
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {specifications.power}
              </Badge>
            )}
            {specifications.voltage && (
              <Badge variant="outline" className="text-xs">
                {specifications.voltage}
              </Badge>
            )}
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="text-2xl font-bold text-primary">
            ₹{price.toLocaleString()}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-3 border-t">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/product/${slug || id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => setIsRfqDialogOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quote
          </Button>
        </div>
        {user && (
          <button 
            onClick={() => toggleItem(id)}
            disabled={procurementLoading}
            className={cn(
              "text-xs transition-colors underline flex items-center justify-center gap-1 w-full",
              inProcurementList 
                ? "text-primary font-medium" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <ClipboardList className="h-3 w-3" />
            {inProcurementList ? "In Procurement List" : "Add to Procurement List"}
          </button>
        )}
      </CardFooter>

      <RequestQuotationDialog
        open={isRfqDialogOpen}
        onOpenChange={setIsRfqDialogOpen}
        productId={id}
        productName={name}
      />

      <QuickViewDialog
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        id={id}
        name={name}
        description={description}
        image={image}
        price={price}
        specifications={specifications}
        stockStatus={stockStatus}
        slug={slug}
      />
    </Card>
  );
};
