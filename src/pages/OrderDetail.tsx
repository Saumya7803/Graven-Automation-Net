import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import OrderTrackingTimeline from "@/components/orders/OrderTrackingTimeline";
import TrackingInfoCard from "@/components/orders/TrackingInfoCard";
import StatusHistoryTimeline from "@/components/orders/StatusHistoryTimeline";
import { useRealtimeOrder } from "@/hooks/useRealtimeOrder";
import LiveConnectionIndicator from "@/components/orders/LiveConnectionIndicator";
import OrderStatusAnimation from "@/components/orders/OrderStatusAnimation";
import StatusHistoryModal from "@/components/orders/StatusHistoryModal";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  notes: string;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tax_invoice_url?: string | null;
  eway_bill_url?: string | null;
  order_items: Array<{
    id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  order_status_history: Array<{
    id: string;
    status: string;
    notes: string;
    created_at: string;
  }>;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string>();
  const { isConnected, lastUpdate } = useRealtimeOrder(id);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const fetchAndSubscribe = async () => {
      await fetchOrder();

      // Subscribe to realtime order updates
      const channel = supabase
        .channel(`order-detail-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('Order updated:', payload);
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
  }, [id, user, navigate, authLoading]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          order_status_history(*)
        `)
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/orders");
    } finally {
      setLoading(false);
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

  if (!order) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Order not found</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/orders')}
          >
            ← Back to Orders
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
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <StatusHistoryModal history={order.order_status_history} />
                </div>
              </div>
              
              <OrderStatusAnimation 
                status={order.status} 
                previousStatus={previousStatus}
              />
            </CardHeader>
          </Card>

          {/* Order Tracking Timeline */}
          <OrderTrackingTimeline
            currentStatus={order.status}
            statusHistory={order.order_status_history}
            estimatedDelivery={order.estimated_delivery_date}
          />

          {/* Tracking Info Card (if shipped) */}
          {order.status === 'shipped' && order.tracking_number && order.carrier && (
            <TrackingInfoCard
              trackingNumber={order.tracking_number}
              carrier={order.carrier}
              estimatedDelivery={order.estimated_delivery_date}
            />
          )}

          <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
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

          {/* Summary & History */}
          <div className="space-y-6">
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

            <StatusHistoryTimeline history={order.order_status_history} />

            {/* Order Documents - Only show for shipped/delivered orders */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.tax_invoice_url ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Tax Invoice</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={order.tax_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="tax-invoice.pdf"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        Tax Invoice not yet available
                      </p>
                    </div>
                  )}

                  {order.eway_bill_url ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">E-way Bill</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={order.eway_bill_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="eway-bill.pdf"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        E-way Bill not yet available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
