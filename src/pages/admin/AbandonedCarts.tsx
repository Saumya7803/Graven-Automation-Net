import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, TrendingDown, TrendingUp, DollarSign, Eye, Mail, Copy, Download, Send, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AbandonedCartDetailDialog } from "@/components/admin/AbandonedCartDetailDialog";
import { toast } from "@/hooks/use-toast";

export default function AbandonedCarts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedCart, setSelectedCart] = useState<any>(null);
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([]);

  const { data: abandonedCarts, isLoading } = useQuery({
    queryKey: ["abandoned-carts", statusFilter, stageFilter],
    queryFn: async () => {
      let query = supabase
        .from("abandoned_carts")
        .select("*")
        .order("abandoned_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (stageFilter !== "all") {
        query = query.eq("abandonment_stage", stageFilter);
      }

      const { data: carts, error } = await query;
      if (error) throw error;

      // Fetch customer data separately
      const cartsWithCustomers = await Promise.all(
        carts.map(async (cart) => {
          const { data: customer } = await supabase
            .from("customers")
            .select("full_name, email, company_name, phone")
            .eq("user_id", cart.user_id)
            .single();

          return { ...cart, customer };
        })
      );

      return cartsWithCustomers;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["abandoned-carts-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("status, cart_value");

      if (error) throw error;

      const totalAbandoned = data.length;
      const active = data.filter((c) => c.status === "active").length;
      const recovered = data.filter((c) => c.status === "recovered").length;
      const totalValue = data
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + Number(c.cart_value), 0);
      const recoveredValue = data
        .filter((c) => c.status === "recovered")
        .reduce((sum, c) => sum + Number(c.cart_value), 0);

      return {
        totalAbandoned,
        active,
        recovered,
        totalValue,
        recoveredValue,
        recoveryRate: totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0,
      };
    },
  });

  const filteredCarts = abandonedCarts?.filter((cart) => {
    if (!searchQuery || !cart.customer) return true;
    const customer = cart.customer;
    return (
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company_name &&
        customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      recovered: "secondary",
      expired: "outline",
      converted: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getStageBadge = (stage: string) => {
    const labels: Record<string, string> = {
      cart: "Cart",
      checkout_started: "Checkout Started",
      checkout_info_entered: "Info Entered",
      payment_failed: "Payment Failed",
    };
    return <Badge variant="outline">{labels[stage] || stage}</Badge>;
  };

  const sendEmailMutation = useMutation({
    mutationFn: async (cartIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('send-manual-cart-recovery', {
        body: { cartIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Recovery Emails Sent",
        description: `Sent ${data.sent} email(s). ${data.failed > 0 ? `Failed: ${data.failed}` : ''}`,
      });
      setSelectedCartIds([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send emails",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = (cartId: string) => {
    sendEmailMutation.mutate([cartId]);
  };

  const handleBulkSendEmail = () => {
    if (selectedCartIds.length === 0) {
      toast({ title: "No carts selected", variant: "destructive" });
      return;
    }
    sendEmailMutation.mutate(selectedCartIds);
  };

  const handleExportCSV = () => {
    if (!filteredCarts || filteredCarts.length === 0) return;
    
    const cartsToExport = selectedCartIds.length > 0
      ? filteredCarts.filter(c => selectedCartIds.includes(c.id))
      : filteredCarts;

    const csv = [
      ['Customer Name', 'Email', 'Company', 'Cart Value', 'Stage', 'Status', 'Abandoned At', 'Reminders Sent', 'Discount Code'].join(','),
      ...cartsToExport.map(cart => [
        cart.customer?.full_name || '',
        cart.customer?.email || '',
        cart.customer?.company_name || '',
        cart.cart_value,
        cart.abandonment_stage,
        cart.status,
        new Date(cart.abandoned_at).toISOString(),
        [cart.first_reminder_sent_at, cart.second_reminder_sent_at, cart.third_reminder_sent_at, cart.final_reminder_sent_at].filter(Boolean).length,
        cart.discount_code || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abandoned-carts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: "CSV exported successfully" });
  };

  const toggleSelectAll = () => {
    if (!filteredCarts) return;
    if (selectedCartIds.length === filteredCarts.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(filteredCarts.map(c => c.id));
    }
  };

  const toggleSelectCart = (cartId: string) => {
    setSelectedCartIds(prev =>
      prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId]
    );
  };

  const copyRecoveryLink = (token: string) => {
    const link = `${window.location.origin}/cart-recovery/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Recovery link copied to clipboard" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Abandoned Carts</h1>
          <p className="text-muted-foreground">Track and recover abandoned shopping carts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abandoned</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAbandoned || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active || 0} active carts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recoveryRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recovered || 0} recovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Potential revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovered Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.recoveredValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Revenue saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="cart">Cart</SelectItem>
                <SelectItem value="checkout_started">Checkout Started</SelectItem>
                <SelectItem value="checkout_info_entered">Info Entered</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedCartIds.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedCartIds.length} cart(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkSendEmail}
                  disabled={sendEmailMutation.isPending}
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Batch Email
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCartIds([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading abandoned carts...</p>
            </div>
          ) : filteredCarts && filteredCarts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredCarts.length > 0 && selectedCartIds.length === filteredCarts.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cart Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Abandoned</TableHead>
                    <TableHead>Reminders Sent</TableHead>
                    <TableHead>Discount Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarts.map((cart) => {
                    const customer = cart.customer;
                    const remindersSent = [
                      cart.first_reminder_sent_at,
                      cart.second_reminder_sent_at,
                      cart.third_reminder_sent_at,
                      cart.final_reminder_sent_at,
                    ].filter(Boolean).length;

                    return (
                      <TableRow key={cart.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCartIds.includes(cart.id)}
                            onCheckedChange={() => toggleSelectCart(cart.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{customer?.email || 'N/A'}</p>
                            {customer?.company_name && (
                              <p className="text-xs text-muted-foreground">
                                {customer.company_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(cart.cart_value))}
                        </TableCell>
                        <TableCell>{getStageBadge(cart.abandonment_stage)}</TableCell>
                        <TableCell>{getStatusBadge(cart.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(cart.abandoned_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{remindersSent}/4</Badge>
                        </TableCell>
                        <TableCell>
                          {cart.discount_code ? (
                            <Badge variant="secondary">{cart.discount_code}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCart(cart)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(cart.id)}
                              disabled={sendEmailMutation.isPending || cart.status !== 'active'}
                              title="Send Recovery Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyRecoveryLink(cart.recovery_token)}
                              title="Copy Recovery Link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No abandoned carts found</p>
              <p className="text-sm text-muted-foreground">
                Matching carts will appear here when customers leave items in their cart
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AbandonedCartDetailDialog
        cart={selectedCart}
        open={!!selectedCart}
        onClose={() => setSelectedCart(null)}
      />
        </div>
      </main>
      <Footer />
    </div>
  );
}
