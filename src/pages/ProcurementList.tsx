import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ClipboardList, Trash2, ShoppingCart, FileText, 
  ArrowLeft, Loader2, Package 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProcurementListContext } from "@/contexts/ProcurementListContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import product1 from "@/assets/product-vfd-1.jpg";
import RequestQuotationDialog from "@/components/rfq/RequestQuotationDialog";

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  sku: string;
  short_description: string;
  is_quote_only?: boolean;
}

const ProcurementList = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items, count, removeFromList, clearList, loading: listLoading } = useProcurementListContext();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (items.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [items]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, series, power_range, price, sku, short_description, is_quote_only")
        .in("id", items)
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(products.map((p) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, productId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.is_quote_only || !product.price) {
      toast.error("This product requires a quotation");
      return;
    }
    addToCart(product.id, 1);
  };

  const handleAddSelectedToCart = () => {
    const addableProducts = products.filter(
      (p) => selectedItems.includes(p.id) && !p.is_quote_only && p.price
    );
    
    if (addableProducts.length === 0) {
      toast.error("No selected products can be added to cart");
      return;
    }

    addableProducts.forEach((p) => addToCart(p.id, 1));
    toast.success(`Added ${addableProducts.length} items to cart`);
    setSelectedItems([]);
  };

  const handleRemoveSelected = async () => {
    for (const productId of selectedItems) {
      await removeFromList(productId);
    }
    setSelectedItems([]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead title="Procurement List | Schneidervfd.com" />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="Procurement List | Schneidervfd.com"
        description="View and manage your procurement list. Add products to cart or request quotations for bulk orders."
      />
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/shop">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Procurement List</h1>
            {count > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {count} {count === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>

          {products.length === 0 ? (
            /* Empty State */
            <Card className="text-center py-16">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Your Procurement List is Empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start adding products to your procurement list for easy access and bulk quotations.
                </p>
                <Button asChild>
                  <Link to="/shop">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bulk Actions */}
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedItems.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedItems.length > 0
                          ? `${selectedItems.length} selected`
                          : "Select all"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItems.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddSelectedToCart}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add Selected to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuotationDialogOpen(true)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Request Quote
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveSelected}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Selected
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearList}
                        className="text-destructive hover:text-destructive"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product List */}
              <div className="space-y-4">
                {products.map((product) => {
                  const isQuoteOnly = product.is_quote_only || !product.price;
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedItems.includes(product.id)}
                              onCheckedChange={(checked) =>
                                handleSelectItem(product.id, !!checked)
                              }
                            />
                          </div>

                          {/* Image */}
                          <Link to={`/product/${product.id}`} className="shrink-0">
                            <OptimizedImage
                              src={product1}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-1">
                              <Badge variant="outline">{product.series}</Badge>
                              {isQuoteOnly && (
                                <Badge className="bg-orange-500">Quote Required</Badge>
                              )}
                            </div>
                            <Link
                              to={`/product/${product.id}`}
                              className="font-semibold hover:text-primary line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku} | Power: {product.power_range}
                            </p>
                            <div className="mt-2">
                              {isQuoteOnly ? (
                                <span className="text-muted-foreground">Price on Request</span>
                              ) : (
                                <span className="text-xl font-bold text-primary">
                                  ₹{product.price?.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 shrink-0">
                            {isQuoteOnly ? (
                              <Button
                                size="sm"
                                onClick={() => setQuotationDialogOpen(true)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Request Quote
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromList(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <RequestQuotationDialog
        open={quotationDialogOpen}
        onOpenChange={setQuotationDialogOpen}
      />
    </div>
  );
};

export default ProcurementList;
