import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Mail, Phone, Building2, MapPin, Package, Clock, Code, Send, Globe, TrendingUp, Activity, Target, User, Calendar, Monitor, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AbandonedCartDetailDialogProps {
  cart: any;
  open: boolean;
  onClose: () => void;
}

export function AbandonedCartDetailDialog({ cart, open, onClose }: AbandonedCartDetailDialogProps) {
  if (!cart) return null;

  // Fetch interaction history
  const { data: interactions } = useQuery({
    queryKey: ["cart-interactions", cart.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_recovery_interactions")
        .select("*")
        .eq("abandoned_cart_id", cart.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open && !!cart.id
  });

  // Fetch current sequence
  const { data: sequence } = useQuery({
    queryKey: ["cart-sequence", cart.current_sequence],
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_recovery_sequences")
        .select("*")
        .eq("sequence_name", cart.current_sequence || 'standard')
        .single();
      return data;
    },
    enabled: open && !!cart.current_sequence
  });

  const cartItems = cart.cart_snapshot?.items || [];
  const customer = cart.customer;

  const engagementLevel = 
    (cart.engagement_score || 0) > 100 ? 'high' :
    (cart.engagement_score || 0) > 50 ? 'medium' : 'low';

  const engagementColor = 
    engagementLevel === 'high' ? 'text-green-500' :
    engagementLevel === 'medium' ? 'text-yellow-500' : 'text-red-500';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Abandoned Cart Details</span>
            <div className="flex gap-2">
              <Badge variant={
                cart.status === 'recovered' ? 'default' :
                cart.status === 'expired' ? 'destructive' : 'secondary'
              }>
                {cart.status}
              </Badge>
              <Badge variant="outline">
                {cart.current_sequence?.replace('_', ' ').toUpperCase() || 'STANDARD'}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Behavioral Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${engagementColor}`}>
                  {cart.engagement_score || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementLevel.toUpperCase()} engagement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Sequence Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Stage {(cart.sequence_stage || 0) + 1}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {(sequence?.stages && Array.isArray(sequence.stages)) ? sequence.stages.length : 4} stages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Interaction Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(interactions && Array.isArray(interactions)) ? interactions.length : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cart.visit_count || 0} visits, {cart.recovery_link_click_count || 0} clicks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interaction Timeline */}
          {interactions && Array.isArray(interactions) && interactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Interaction Timeline
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      interaction.interaction_type === 'cart_recovered' ? 'bg-green-500' :
                      interaction.interaction_type === 'email_opened' ? 'bg-blue-500' :
                      interaction.interaction_type === 'link_clicked' ? 'bg-purple-500' :
                      interaction.interaction_type === 'page_viewed' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {interaction.interaction_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(interaction.metadata, null, 2).slice(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Customer Information</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">
                  {customer?.full_name && customer.full_name !== customer?.email 
                    ? customer.full_name 
                    : 'Name not available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{customer?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="text-sm font-medium">{customer?.phone || 'N/A'}</span>
              </div>
              {customer?.company_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Company:</span>
                  <span className="text-sm font-medium">{customer.company_name}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cart Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Cart Items</h3>
            </div>
            <div className="space-y-2">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || item.product_name || 'Product'}</p>
                      {item.product?.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency((item.product?.price || 0) * item.quantity)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    <span>Unit Price: {formatCurrency(item.product?.price || 0)}</span>
                  </div>
                </div>
              ))}
              <div className="bg-primary/10 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Total Value</span>
                <span className="font-bold text-lg">{formatCurrency(Number(cart.cart_value))}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Technical Details</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {cart.device_type && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Device:</span>
                  <span className="text-sm font-medium">{cart.device_type}</span>
                </div>
              )}
              {cart.browser && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Browser:</span>
                  <span className="text-sm font-medium">{cart.browser}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Abandoned:</span>
                <span className="text-sm font-medium">
                  {new Date(cart.abandoned_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expires:</span>
                <span className="text-sm font-medium">
                  {new Date(cart.expires_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Discount Info */}
          {cart.discount_code && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Discount Offered</h3>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <Badge variant="secondary" className="font-mono">
                      {cart.discount_code}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
