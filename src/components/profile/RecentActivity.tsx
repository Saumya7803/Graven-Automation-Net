import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ShoppingCart 
} from "lucide-react";

interface Activity {
  id: string;
  type: "order" | "quotation";
  action: string;
  status: string;
  timestamp: string;
  reference: string;
  amount?: number;
}

interface RecentActivityProps {
  userId: string;
}

export const RecentActivity = ({ userId }: RecentActivityProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      // Fetch recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent quotations
      const { data: quotations } = await supabase
        .from("quotation_requests")
        .select("id, status, final_amount, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities: Activity[] = [];

      orders?.forEach((order) => {
        allActivities.push({
          id: order.id,
          type: "order",
          action: getOrderAction(order.status),
          status: order.status,
          timestamp: order.updated_at || order.created_at,
          reference: order.order_number,
          amount: order.total_amount,
        });
      });

      quotations?.forEach((quote) => {
        allActivities.push({
          id: quote.id,
          type: "quotation",
          action: getQuotationAction(quote.status),
          status: quote.status,
          timestamp: quote.updated_at || quote.created_at,
          reference: quote.id.slice(0, 8).toUpperCase(),
          amount: quote.final_amount > 0 ? quote.final_amount : undefined,
        });
      });

      // Sort by timestamp and take top 10
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderAction = (status: string): string => {
    const actions: Record<string, string> = {
      pending: "Order placed",
      confirmed: "Order confirmed",
      processing: "Order processing",
      shipped: "Order shipped",
      delivered: "Order delivered",
      cancelled: "Order cancelled",
    };
    return actions[status] || "Order updated";
  };

  const getQuotationAction = (status: string): string => {
    const actions: Record<string, string> = {
      pending: "Quotation requested",
      reviewing: "Quote under review",
      quoted: "Quote received",
      revised: "Quote revised",
      finalized: "Quote finalized",
      converted_to_order: "Converted to order",
      closed: "Quote closed",
    };
    return actions[status] || "Quote updated";
  };

  const getActivityIcon = (type: string, status: string) => {
    if (type === "order") {
      if (status === "delivered") return <CheckCircle className="h-5 w-5 text-green-600" />;
      if (status === "shipped") return <Package className="h-5 w-5 text-blue-600" />;
      if (status === "pending") return <Clock className="h-5 w-5 text-yellow-600" />;
      return <ShoppingCart className="h-5 w-5 text-muted-foreground" />;
    }
    if (status === "quoted" || status === "revised") return <TrendingUp className="h-5 w-5 text-green-600" />;
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type === "order" ? "Order" : "Quote"} #{activity.reference}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(activity.amount)}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
