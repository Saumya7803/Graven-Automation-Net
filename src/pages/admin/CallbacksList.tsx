import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Search, Calendar, Clock, Filter, Eye, Bell, Check, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, formatDistanceToNow } from "date-fns";
import { CallbackDetailDialog } from "@/components/admin/CallbackDetailDialog";
import { NotificationPermissionBanner } from "@/components/admin/NotificationPermissionBanner";
import { toast } from "@/hooks/use-toast";
import { notificationManager } from "@/utils/notifications";

type CallbackRequest = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  status: string;
  priority: string;
  source: string | null;
  location_page: string | null;
  created_at: string;
  scheduled_date_time: string | null;
  reminder_sent_at: string | null;
  follow_up_date: string | null;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
  no_answer: "bg-red-500",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-400",
  normal: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

export default function CallbacksList() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [filteredCallbacks, setFilteredCallbacks] = useState<CallbackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedCallback, setSelectedCallback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    todayScheduled: 0,
    completedThisWeek: 0,
    followUpsDueToday: 0,
    overdueFollowUps: 0,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin");
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCallbacks();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterCallbacks();
  }, [callbacks, searchTerm, statusFilter, priorityFilter]);

  // Set up Realtime listener for new callbacks
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('callback_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'callback_requests'
        },
        async (payload) => {
          const newCallback = payload.new as CallbackRequest;
          
          // Only notify for urgent/pending callbacks
          if (newCallback.status === 'pending' && newCallback.priority === 'urgent') {
            // Show browser notification
            notificationManager.showCallbackNotification(newCallback);
            
            // Play alert sound
            await notificationManager.playAlertSound();
            
            // Show in-app toast
            toast({
              title: "🚨 New Urgent Callback!",
              description: `${newCallback.customer_name} - ${newCallback.customer_phone}`,
              duration: 10000,
            });
          }
          
          // Refresh the list
          fetchCallbacks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Listen for notification clicks to open callback detail
  useEffect(() => {
    const handleOpenCallback = (event: CustomEvent) => {
      const { callbackId } = event.detail;
      setSelectedCallback(callbackId);
    };

    window.addEventListener('open-callback-detail' as any, handleOpenCallback);
    return () => {
      window.removeEventListener('open-callback-detail' as any, handleOpenCallback);
    };
  }, []);

  const fetchCallbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("callback_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCallbacks(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error("Error fetching callbacks:", error);
      toast({
        title: "Error",
        description: "Failed to load callback requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: CallbackRequest[]) => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date();

    setStats({
      pending: data.filter((cb) => cb.status === "pending").length,
      todayScheduled: data.filter((cb) => 
        cb.preferred_date && cb.preferred_date === today
      ).length,
      completedThisWeek: data.filter(
        (cb) => cb.status === "completed" && cb.created_at >= weekAgo
      ).length,
      followUpsDueToday: data.filter((cb) => 
        cb.follow_up_date === today
      ).length,
      overdueFollowUps: data.filter((cb) => 
        cb.follow_up_date && new Date(cb.follow_up_date) < now && cb.status !== "completed"
      ).length,
    });
  };

  const filterCallbacks = () => {
    let filtered = callbacks;

    if (searchTerm) {
      filtered = filtered.filter(
        (cb) =>
          cb.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cb.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cb.customer_phone.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((cb) => cb.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((cb) => cb.priority === priorityFilter);
    }

    setFilteredCallbacks(filtered);
  };

  const handleDelete = async (callbackId: string, customerName: string) => {
    try {
      setDeletingId(callbackId);
      
      const { error } = await supabase
        .from("callback_requests")
        .delete()
        .eq("id", callbackId);

      if (error) throw error;

      toast({
        title: "Callback Deleted",
        description: `Callback request from ${customerName} has been deleted successfully.`,
      });

      // Refresh the list
      fetchCallbacks();
    } catch (error: any) {
      console.error("Error deleting callback:", error);
      toast({
        title: "Error",
        description: "Failed to delete callback request: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <NotificationPermissionBanner />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Callback Requests</h1>
          <p className="text-muted-foreground">Manage and schedule customer callbacks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const { error } = await supabase.functions.invoke('send-callback-reminders', {
                  body: { manual: true }
                });
                
                if (error) throw error;
                
                toast({
                  title: "Success",
                  description: "Reminder check triggered. Eligible callbacks will receive reminders.",
                });
                fetchCallbacks();
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: "Failed to trigger reminders: " + error.message,
                  variant: "destructive",
                });
              }
            }}
          >
            <Bell className="mr-2 h-4 w-4" />
            Send Reminders Now
          </Button>
          <Button onClick={() => navigate("/admin")}>Back to Dashboard</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Callbacks</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Urgent (Need Immediate Call)</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {callbacks.filter(cb => 
                cb.status === "pending" && 
                cb.priority === "urgent" &&
                (Date.now() - new Date(cb.created_at).getTime()) < 15 * 60 * 1000
              ).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Follow-Ups Due Today</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.followUpsDueToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue Follow-Ups</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.overdueFollowUps}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed This Week</CardDescription>
            <CardTitle className="text-3xl">{stats.completedThisWeek}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Callbacks Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredCallbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No callback requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Follow-Up</TableHead>
                  <TableHead>Time Since Request</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallbacks.map((callback) => (
                  <TableRow key={callback.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{callback.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{callback.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${callback.customer_phone}`} className="flex items-center hover:underline">
                        <Phone className="h-4 w-4 mr-1" />
                        {callback.customer_phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      {callback.preferred_date && callback.preferred_time_slot ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(callback.preferred_date), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{callback.preferred_time_slot}</span>
                          </div>
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          🔥 Immediate (2-5 min)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[callback.status]}>
                        {callback.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[callback.priority]}>
                        {callback.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {callback.reminder_sent_at ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Check className="mr-1 h-3 w-3" />
                          Sent {format(new Date(callback.reminder_sent_at), 'MMM d, h:mm a')}
                        </Badge>
                      ) : callback.scheduled_date_time ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 border-gray-400">
                          Not Scheduled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {callback.source?.replace("_", " ") || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {callback.follow_up_date ? (
                        <div>
                          {(() => {
                            const followUpDate = new Date(callback.follow_up_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            followUpDate.setHours(0, 0, 0, 0);
                            
                            const isOverdue = followUpDate < today && callback.status !== "completed";
                            const isDueToday = followUpDate.getTime() === today.getTime();
                            const isDueSoon = followUpDate > today && followUpDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
                            
                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className={`h-4 w-4 ${
                                    isOverdue ? 'text-red-600' : 
                                    isDueToday ? 'text-orange-600' : 
                                    isDueSoon ? 'text-blue-600' : 
                                    'text-muted-foreground'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    isOverdue ? 'text-red-600' : 
                                    isDueToday ? 'text-orange-600' : 
                                    isDueSoon ? 'text-blue-600' : 
                                    'text-muted-foreground'
                                  }`}>
                                    {format(new Date(callback.follow_up_date), "MMM dd, yyyy")}
                                  </span>
                                </div>
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs w-fit">Overdue</Badge>
                                )}
                                {isDueToday && (
                                  <Badge className="bg-orange-500 text-xs w-fit">Due Today</Badge>
                                )}
                                {isDueSoon && (
                                  <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs w-fit">
                                    Due Soon
                                  </Badge>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const minutesSince = Math.floor((Date.now() - new Date(callback.created_at).getTime()) / 60000);
                        const isUrgent = callback.status === "pending" && callback.priority === "urgent" && minutesSince < 15;
                        const isOverdue = callback.status === "pending" && minutesSince > 5;
                        
                        return (
                          <div className="flex items-center gap-2">
                            {isUrgent && minutesSince < 5 && (
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </span>
                            )}
                            <span className={`text-sm font-medium ${
                              isUrgent && minutesSince < 5 ? 'text-red-600' :
                              isOverdue ? 'text-orange-600' :
                              'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(callback.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCallback(callback.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingId === callback.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Callback Request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the callback request from{" "}
                                <span className="font-semibold">{callback.customer_name}</span>?
                                <br />
                                <br />
                                This action cannot be undone. All information including customer details,
                                preferred time, and any notes will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(callback.id, callback.customer_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deletingId === callback.id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedCallback && (
        <CallbackDetailDialog
          callbackId={selectedCallback}
          open={!!selectedCallback}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCallback(null);
              fetchCallbacks(); // Refresh list
            }
          }}
        />
      )}
    </div>
  );
}
