import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, CheckCircle2, XCircle, Loader2, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScheduledNotificationDetailDialog } from "./ScheduledNotificationDetailDialog";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  target_type: string;
  target_value: string | null;
  scheduled_at: string;
  status: string;
  total_sent: number;
  total_failed: number;
  created_at: string;
}

export function ScheduledNotificationsTable() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<ScheduledNotification | null>(null);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduled_push_notifications")
        .select("*")
        .order("scheduled_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error loading scheduled notifications:", error);
      toast.error("Failed to load scheduled notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("scheduled-notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_push_notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_push_notifications")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Notification cancelled");
    } catch (error: any) {
      console.error("Error cancelling notification:", error);
      toast.error("Failed to cancel notification");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: "default" as const, icon: Clock, label: "Scheduled" },
      sending: { variant: "secondary" as const, icon: Loader2, label: "Sending" },
      sent: { variant: "default" as const, icon: CheckCircle2, label: "Sent" },
      failed: { variant: "destructive" as const, icon: XCircle, label: "Failed" },
      cancelled: { variant: "outline" as const, icon: Ban, label: "Cancelled" },
    };

    const config = variants[status as keyof typeof variants] || variants.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Results</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No scheduled notifications
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell className="capitalize">
                    {notification.target_type === "tier" && notification.target_value
                      ? `${notification.target_value} tier`
                      : notification.target_type}
                  </TableCell>
                  <TableCell>
                    {format(new Date(notification.scheduled_at), "PPp")}
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    {notification.status === "sent" && (
                      <span className="text-sm text-muted-foreground">
                        {notification.total_sent} sent
                        {notification.total_failed > 0 && `, ${notification.total_failed} failed`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      View
                    </Button>
                    {notification.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(notification.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedNotification && (
        <ScheduledNotificationDetailDialog
          notification={selectedNotification}
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
        />
      )}
    </>
  );
}
