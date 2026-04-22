import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Mail, ExternalLink, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ActiveCartsCardProps {
  onSendEmails: () => void;
}

export function ActiveCartsCard({ onSendEmails }: ActiveCartsCardProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["active-carts-for-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("id, cart_value, first_reminder_sent_at")
        .eq("status", "active");

      if (error) throw error;

      const totalActive = data.length;
      const neverEmailed = data.filter((c) => !c.first_reminder_sent_at).length;
      const totalValue = data.reduce((sum, cart) => sum + Number(cart.cart_value), 0);

      return {
        totalActive,
        neverEmailed,
        totalValue,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Loading cart data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ready to Send Recovery Emails
            </CardTitle>
            <CardDescription className="mt-2">
              Send manual recovery emails to active abandoned carts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/abandoned-carts">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Carts
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Active Carts</div>
            <div className="text-2xl font-bold">{stats?.totalActive || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Never Emailed</div>
            <div className="text-2xl font-bold">{stats?.neverEmailed || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue || 0)}</div>
          </div>
        </div>

        {stats && stats.totalActive > 0 ? (
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onSendEmails} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Send Recovery Emails
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/abandoned-carts">View Details</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>No active abandoned carts at the moment</span>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-xs text-blue-900 dark:text-blue-100">
            <span className="font-medium">💡 Pro Tip:</span> You can also send emails to specific
            customers by selecting them on the{" "}
            <Link
              to="/admin/abandoned-carts"
              className="underline hover:text-blue-700 dark:hover:text-blue-300"
            >
              Abandoned Carts page
            </Link>
            .
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
