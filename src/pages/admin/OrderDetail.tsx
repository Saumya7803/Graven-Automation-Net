import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import OrderDocumentUpload from "@/components/admin/OrderDocumentUpload";
import { useRealtimeOrder } from "@/hooks/useRealtimeOrder";
import LiveConnectionIndicator from "@/components/orders/LiveConnectionIndicator";
import OrderStatusAnimation from "@/components/orders/OrderStatusAnimation";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [previousStatus, setPreviousStatus] = useState<string>();
  const { isConnected, lastUpdate } = useRealtimeOrder(id);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    
    const fetchAndSubscribe = async () => {
      await fetchOrder();

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`admin-order-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('Order updated in admin view:', payload);
            setPreviousStatus(order?.status);
            fetchOrder();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchAndSubscribe();
  }, [id, user, isAdmin, authLoading, navigate]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers!inner(
            id,
            full_name,
            email,
            company_name,
            phone
          ),
          order_items(*),
          order_status_history(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
      setTrackingNumber(data.tracking_number ?? "");
      setCarrier(data.carrier ?? "");
      setEstimatedDelivery(data.estimated_delivery_date ? format(new Date(data.estimated_delivery_date), "yyyy-MM-dd'T'HH:mm") : "");
      console.log("Loaded tracking data:", { tracking_number: data.tracking_number, carrier: data.carrier, estimated_delivery_date: data.estimated_delivery_date });
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus as any };
      
      // Auto-set timestamps
      if (newStatus === 'shipped' && !order.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (newStatus === 'delivered' && !order.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Send email notification to customer
      try {
        const { error: emailError } = await supabase.functions.invoke('notify-order-status', {
          body: { orderId: id, status: newStatus }
        });
        
        if (emailError) {
          console.error("Email notification failed:", emailError);
          toast.success("Order status updated but email notification failed");
        } else {
          toast.success("Order status updated and customer notified");
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        toast.success("Order status updated but email notification failed");
      }
      fetchOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateTrackingInfo = async () => {
    setUpdating(true);
    try {
      const updatePayload = {
        tracking_number: trackingNumber.trim() || null,
        carrier: carrier || null,
        estimated_delivery_date: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      };
      console.log("Updating tracking info with:", updatePayload);

      const { data, error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select();

      if (error) throw error;
      console.log("Update response:", data);

      toast.success("Tracking information updated successfully");
      fetchOrder();
    } catch (error) {
      console.error("Error updating tracking info:", error);
      toast.error("Failed to update tracking information");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      processing: "bg-purple-500",
      shipped: "bg-indigo-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!order) return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
          <LiveConnectionIndicator 
            isConnected={isConnected} 
            lastUpdate={lastUpdate} 
          />
        </div>

        <div className="grid gap-6">
          {/* Order Header with Animation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl">Order {order.order_number}</CardTitle>
                  <p className="text-muted-foreground">
                    Placed on {format(new Date(order.created_at), "PPP")}
                  </p>
                </div>
              </div>
              
              <OrderStatusAnimation 
                status={order.status} 
                previousStatus={previousStatus}
              />
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{order.customers.full_name}</p>
                <p className="text-sm text-muted-foreground">{order.customers.email}</p>
                {order.customers.phone && (
                  <p className="text-sm text-muted-foreground">{order.customers.phone}</p>
                )}
                {order.customers.company_name && (
                  <p className="text-sm text-muted-foreground">{order.customers.company_name}</p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit_price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.shipping_address.street}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{" "}
                    {order.shipping_address.zip}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.billing_address.street}</p>
                  <p>
                    {order.billing_address.city}, {order.billing_address.state}{" "}
                    {order.billing_address.zip}
                  </p>
                  <p>{order.billing_address.country}</p>
                </CardContent>
              </Card>
            </div>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary & Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{order.payment_status}</Badge>
                </div>
                <Select
                  value={order.status}
                  onValueChange={updateOrderStatus}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Select value={carrier || undefined} onValueChange={(val) => setCarrier(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="bluedart">Blue Dart</SelectItem>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Delivery</Label>
                  <Input
                    type="datetime-local"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={updateTrackingInfo} 
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? "Updating..." : "Update Tracking Info"}
                </Button>
              </CardContent>
            </Card>

            {/* Order Documents - Only show for shipped/delivered orders */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderDocumentUpload
                    orderId={order.id}
                    taxInvoiceUrl={order.tax_invoice_url}
                    ewayBillUrl={order.eway_bill_url}
                    onUploadSuccess={fetchOrder}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_status_history
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((history: any) => (
                      <div key={history.id}>
                        <Badge className={getStatusColor(history.status)} variant="outline">
                          {history.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(history.created_at), "PPp")}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
