import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ShoppingCart, ExternalLink, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import RequestQuotationDialog from "@/components/rfq/RequestQuotationDialog";

interface QuickViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const QuickViewDialog = ({
  open,
  onOpenChange,
  id,
  name,
  description,
  image,
  price,
  specifications,
  stockStatus = "in_stock",
  slug,
}: QuickViewDialogProps) => {
  const [isRfqDialogOpen, setIsRfqDialogOpen] = useState(false);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Image Section */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Zap className="w-24 h-24 text-primary/20" />
                </div>
              )}
              
              {/* Stock Badge */}
              <Badge className={`absolute top-4 right-4 ${stock.className} text-white border-0`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {stock.label}
              </Badge>
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-4">
              {/* Price */}
              {price && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <div className="text-3xl font-bold text-primary">
                    ₹{price.toLocaleString()}
                  </div>
                </div>
              )}

              <Separator />

              {/* Specifications */}
              {specifications && Object.keys(specifications).length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {specifications.power && (
                      <Badge variant="outline" className="text-sm">
                        <Zap className="w-3 h-3 mr-1" />
                        {specifications.power}
                      </Badge>
                    )}
                    {specifications.voltage && (
                      <Badge variant="outline" className="text-sm">
                        {specifications.voltage}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Description */}
              <div>
                <p className="text-sm font-semibold mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto pt-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    setIsRfqDialogOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Request Quotation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link to={`/product/${slug || id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RequestQuotationDialog
        open={isRfqDialogOpen}
        onOpenChange={setIsRfqDialogOpen}
        productId={id}
        productName={name}
      />
    </>
  );
};
