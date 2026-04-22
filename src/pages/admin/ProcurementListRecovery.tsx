import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ListChecks, 
  TrendingUp, 
  IndianRupee, 
  Mail, 
  Eye,
  RefreshCw,
  Search,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface ProductSnapshot {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  product_image: string;
}

interface ProcurementReminder {
  id: string;
  user_id: string;
  list_snapshot: Json;
  list_value: number;
  item_count: number;
  status: string;
  first_reminder_sent_at: string | null;
  second_reminder_sent_at: string | null;
  third_reminder_sent_at: string | null;
  recovery_token: string;
  created_at: string;
  last_activity_at: string | null;
  converted_at: string | null;
  converted_to: string | null;
  customer?: { full_name: string; email: string } | null;
}

const ProcurementListRecovery = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<ProcurementReminder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch reminders with customer data
  const { data: reminders, isLoading } = useQuery({
    queryKey: ["procurement-reminders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("procurement_list_reminders")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch customer names
      const userIds = [...new Set(data?.map((r) => r.user_id) || [])];
      const { data: customers } = await supabase
        .from("customers")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const customerMap = new Map(customers?.map((c) => [c.user_id, c]) || []);

      return data?.map((r) => ({
        ...r,
        customer: customerMap.get(r.user_id),
      })) as ProcurementReminder[];
    },
  });

  // Calculate stats
  const stats = {
    total: reminders?.length || 0,
    active: reminders?.filter((r) => r.status === "active").length || 0,
    converted: reminders?.filter((r) => r.status === "converted").length || 0,
    totalValue: reminders?.reduce((sum, r) => sum + (r.list_value || 0), 0) || 0,
    convertedValue: reminders
      ?.filter((r) => r.status === "converted")
      .reduce((sum, r) => sum + (r.list_value || 0), 0) || 0,
    recoveryRate: reminders?.length
      ? Math.round(
          (reminders.filter((r) => r.status === "converted").length / reminders.length) * 100
        )
      : 0,
  };

  // Detect stale lists mutation
  const detectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-stale-procurement-lists", {
        body: { forceDetection: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Detection complete: ${data.created} new reminders created`);
      queryClient.invalidateQueries({ queryKey: ["procurement-reminders"] });
    },
    onError: (error: any) => {
      toast.error(`Detection failed: ${error.message}`);
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { data, error } = await supabase.functions.invoke("send-manual-procurement-recovery", {
        body: { reminderId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Recovery email sent");
      queryClient.invalidateQueries({ queryKey: ["procurement-reminders"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to send: ${error.message}`);
    },
  });

  const copyRecoveryLink = (token: string) => {
    const link = `${window.location.origin}/procurement-recovery/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Recovery link copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "converted":
        return <Badge className="bg-green-500">Converted</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "dismissed":
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRemindersSent = (reminder: ProcurementReminder) => {
    let count = 0;
    if (reminder.first_reminder_sent_at) count++;
    if (reminder.second_reminder_sent_at) count++;
    if (reminder.third_reminder_sent_at) count++;
    return count;
  };

  const filteredReminders = reminders?.filter((r) => {
    if (!searchQuery) return true;
    const customer = r.customer;
    return (
      customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getListSnapshot = (reminder: ProcurementReminder): ProductSnapshot[] => {
    if (Array.isArray(reminder.list_snapshot)) {
      return reminder.list_snapshot as unknown as ProductSnapshot[];
    }
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Procurement List Recovery</h1>
            <p className="text-muted-foreground">Re-engage users with stale procurement lists</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => detectMutation.mutate()} disabled={detectMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${detectMutation.isPending ? "animate-spin" : ""}`} />
              Detect Stale Lists
            </Button>
            <Button asChild>
              <Link to="/admin/procurement-recovery-templates">Manage Templates</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stale Lists</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recoveryRate}%</div>
              <p className="text-xs text-muted-foreground">{stats.converted} converted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground">Potential revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovered Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{stats.convertedValue.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground">From conversions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredReminders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No procurement list reminders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReminders?.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reminder.customer?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{reminder.customer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{reminder.item_count}</TableCell>
                      <TableCell>₹{reminder.list_value?.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell>{getRemindersSent(reminder)} / 3</TableCell>
                      <TableCell>
                        {reminder.last_activity_at
                          ? format(new Date(reminder.last_activity_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReminder(reminder);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReminderMutation.mutate(reminder.id)}
                            disabled={reminder.status !== "active" || sendReminderMutation.isPending}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyRecoveryLink(reminder.recovery_token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Procurement List Details</DialogTitle>
            </DialogHeader>
            {selectedReminder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedReminder.customer?.full_name}</p>
                    <p className="text-sm">{selectedReminder.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedReminder.status)}
                    {selectedReminder.converted_at && (
                      <p className="text-sm text-green-600 mt-1">
                        Converted to {selectedReminder.converted_to} on{" "}
                        {format(new Date(selectedReminder.converted_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Products ({selectedReminder.item_count})</p>
                  <div className="border rounded-lg divide-y">
                    {getListSnapshot(selectedReminder).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                        </div>
                        <p className="font-medium">₹{item.product_price?.toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold">₹{selectedReminder.list_value?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyRecoveryLink(selectedReminder.recovery_token)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      onClick={() => sendReminderMutation.mutate(selectedReminder.id)}
                      disabled={selectedReminder.status !== "active"}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default ProcurementListRecovery;
