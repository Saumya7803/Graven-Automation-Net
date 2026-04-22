import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  target_type: string;
  target_value: string | null;
  scheduled_at: string;
  status: string;
  total_targeted?: number;
  total_sent?: number;
  total_failed?: number;
  action_url?: string;
  error_message?: string;
  created_at: string;
}

interface ScheduledNotificationDetailDialogProps {
  notification: ScheduledNotification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduledNotificationDetailDialog({
  notification,
  open,
  onOpenChange,
}: ScheduledNotificationDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scheduled Notification Details</DialogTitle>
          <DialogDescription>
            Created on {format(new Date(notification.created_at), "PPp")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <Badge className="capitalize">{notification.status}</Badge>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Notification Content</h3>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div>
                <span className="text-sm font-medium">Title:</span>
                <p className="text-sm text-muted-foreground">{notification.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Body:</span>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
              </div>
              {notification.action_url && (
                <div>
                  <span className="text-sm font-medium">Action URL:</span>
                  <p className="text-sm text-muted-foreground break-all">
                    {notification.action_url}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Targeting</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Type:</span>{" "}
                <span className="capitalize">{notification.target_type}</span>
              </p>
              {notification.target_value && (
                <p className="text-sm">
                  <span className="font-medium">Value:</span>{" "}
                  <span className="capitalize">{notification.target_value}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Schedule</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(notification.scheduled_at), "PPPp")}
            </p>
          </div>

          {(notification.status === "sent" || notification.status === "failed") && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Results</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Targeted</p>
                    <p className="text-2xl font-bold">{notification.total_targeted || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold text-green-600">
                      {notification.total_sent || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {notification.total_failed || 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {notification.error_message && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2 text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground">{notification.error_message}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
