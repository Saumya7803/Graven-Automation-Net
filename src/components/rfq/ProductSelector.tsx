import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  series: string;
  power_range: string;
  price: number;
}

interface SelectedProduct extends Product {
  quantity: number;
}

interface ProductSelectorProps {
  selectedProducts: SelectedProduct[];
  onProductsChange: (products: SelectedProduct[]) => void;
  defaultProductId?: string;
}

const ProductSelector = ({
  selectedProducts,
  onProductsChange,
  defaultProductId,
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle default product pre-selection
  useEffect(() => {
    if (defaultProductId && products.length > 0 && selectedProducts.length === 0) {
      const defaultProduct = products.find((p) => p.id === defaultProductId);
      if (defaultProduct) {
        onProductsChange([{ ...defaultProduct, quantity: 1 }]);
      }
    }
  }, [defaultProductId, products, selectedProducts.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, series, power_range, price")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    // Check if product is already selected
    if (selectedProducts.some((p) => p.id === product.id)) {
      return;
    }

    onProductsChange([...selectedProducts, { ...product, quantity: 1 }]);
    setOpen(false);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    onProductsChange(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter((p) => p.id !== productId));
  };

  return (
    <div className="space-y-4">
      <Label>Products Requested</Label>
      
      <div className="space-y-3">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.series} | {product.power_range} | SKU: {product.sku}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) =>
                  handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                }
                className="w-20 h-8"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveProduct(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {selectedProducts.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No products selected yet. Click "Add Product" below to select products.
          </p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search products..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading products..." : "No products found."}
              </CommandEmpty>
              <CommandGroup>
                {products.map((product) => {
                  const isSelected = selectedProducts.some(
                    (p) => p.id === product.id
                  );
                  return (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.sku} ${product.series}`}
                      onSelect={() => handleSelectProduct(product)}
                      disabled={isSelected}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.series} | {product.power_range} | {formatCurrency(product.price)}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductSelector;
