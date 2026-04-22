import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, FileText, Package, ArrowRight, Loader2 } from "lucide-react";

interface ProductSnapshot {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  product_image: string;
  product_series: string;
}

const ProcurementRecovery = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Fetch reminder by recovery token
  const { data: reminder, isLoading, error } = useQuery({
    queryKey: ["procurement-recovery", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_list_reminders")
        .select("*")
        .eq("recovery_token", token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  // Track link click
  useEffect(() => {
    if (reminder?.id) {
      supabase.functions.invoke("track-procurement-recovery-interaction", {
        body: {
          reminderId: reminder.id,
          interactionType: "link_clicked",
        },
      });
    }
  }, [reminder?.id]);

  const handleAddAllToCart = async () => {
    if (!reminder?.list_snapshot) return;

    setLoading(true);
    try {
      const products = (Array.isArray(reminder.list_snapshot) 
        ? reminder.list_snapshot 
        : []) as unknown as ProductSnapshot[];
      
      for (const product of products) {
        await addToCart(product.product_id, 1);
      }

      // Track conversion
      await supabase.functions.invoke("track-procurement-recovery-interaction", {
        body: {
          reminderId: reminder.id,
          interactionType: "added_to_cart",
        },
      });

      toast.success(`Added ${products.length} products to cart`);
      navigate("/checkout");
    } catch (error) {
      toast.error("Failed to add products to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    // Track interaction
    await supabase.functions.invoke("track-procurement-recovery-interaction", {
      body: {
        reminderId: reminder?.id,
        interactionType: "quote_page_clicked",
      },
    });
    
    // Navigate to procurement list page where they can request quote
    navigate("/procurement-list");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !reminder) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">List Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This procurement list link may have expired or is invalid.
          </p>
          <Button onClick={() => navigate("/shop")}>Browse Products</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const products = (Array.isArray(reminder.list_snapshot) 
    ? reminder.list_snapshot 
    : []) as unknown as ProductSnapshot[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Your Saved Procurement List | Schneidervfd.com"
        description="View and complete your saved procurement list"
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Saved Products</h1>
            <p className="text-muted-foreground">
              You have {reminder.item_count} products saved in your procurement list
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products in Your List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {products?.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 py-4">
                    {product.product_image && (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{product.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.product_sku}
                        {product.product_series && ` • ${product.product_series}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {product.product_price > 0
                          ? `₹${product.product_price.toLocaleString("en-IN")}`
                          : "Request Quote"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Estimated Total</span>
                  <span className="font-bold">
                    ₹{reminder.list_value?.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  * Final pricing may vary based on quantity and current availability
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddAllToCart}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Add All to Cart
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleRequestQuote}
            >
              <FileText className="h-4 w-4 mr-2" />
              Request Quote for All
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help? Contact our sales team at{" "}
            <a href="mailto:sales@gravenautomation.com" className="text-primary hover:underline">
              sales@gravenautomation.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProcurementRecovery;
