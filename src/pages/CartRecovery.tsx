import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Clock, Gift } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function CartRecovery() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const { data: abandonedCart, isLoading } = useQuery({
    queryKey: ["cart-recovery", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");

      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("recovery_token", token)
        .eq("status", "active")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Cart not found or expired");

      return data;
    },
    enabled: !!token,
  });

  // Track interactions
  useEffect(() => {
    if (abandonedCart?.id) {
      supabase.functions.invoke('track-cart-recovery-interaction', {
        body: {
          abandonedCartId: abandonedCart.id,
          interactionType: 'link_clicked',
          metadata: { timestamp: new Date().toISOString() }
        }
      });

      supabase.functions.invoke('track-cart-recovery-interaction', {
        body: {
          abandonedCartId: abandonedCart.id,
          interactionType: 'page_viewed',
          metadata: { device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop' }
        }
      });
    }
  }, [abandonedCart?.id]);

  const handleRecoverCart = async () => {
    if (!abandonedCart) return;

    setLoading(true);
    try {
      const cartData = abandonedCart.cart_snapshot as any;
      const items = cartData.items;

      // Track recovery attempt
      await supabase.functions.invoke('track-cart-recovery-interaction', {
        body: {
          abandonedCartId: abandonedCart.id,
          interactionType: 'cart_recovered',
          metadata: {
            itemCount: items.length,
            cartValue: abandonedCart.cart_value,
            discountCode: abandonedCart.discount_code,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Add all items back to cart
      for (const item of items) {
        await addToCart(item.product_id, item.quantity);
      }

      // Mark cart as recovered
      await supabase
        .from("abandoned_carts")
        .update({
          status: "recovered",
          recovered_at: new Date().toISOString(),
        })
        .eq("id", abandonedCart.id);

      toast.success("Cart recovered! Your items have been added back.");
      navigate("/checkout");
    } catch (error) {
      console.error("Error recovering cart:", error);
      toast.error("Failed to recover cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!abandonedCart) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cart Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This cart recovery link is invalid or has expired.
            </p>
            <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartData = abandonedCart.cart_snapshot as any;
  const items = cartData.items;
  const cartValue = Number(abandonedCart.cart_value);
  const hasDiscount = abandonedCart.discount_code;

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Back Message */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-muted-foreground">
                  Your cart is waiting for you. Complete your purchase now and get your items
                  delivered soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Code */}
        {hasDiscount && (
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Gift className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Special Offer for You!</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use this exclusive discount code at checkout:
                  </p>
                  <Badge className="text-lg px-4 py-1">{abandonedCart.discount_code}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product.sku} | Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                  {index < items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(cartValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency Message */}
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-900 dark:text-orange-200">
                <span className="font-semibold">Limited time offer!</span> Complete your purchase
                within the next 24 hours to claim your {hasDiscount ? "discount" : "items"}.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleRecoverCart}
            disabled={loading}
          >
            {loading ? "Recovering Cart..." : "Complete Purchase Now"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
