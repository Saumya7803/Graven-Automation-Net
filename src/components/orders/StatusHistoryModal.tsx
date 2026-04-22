import { format } from "date-fns";
import { History, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface StatusHistory {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  changed_by?: string;
}

interface StatusHistoryModalProps {
  history: StatusHistory[];
}

export default function StatusHistoryModal({ history }: StatusHistoryModalProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      confirmed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    return colors[status] || colors.pending;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          View Full History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Status History</DialogTitle>
          <DialogDescription>
            Complete timeline of all status changes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="relative flex gap-4 pb-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Timeline Line */}
                {index < history.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                )}

                {/* Timeline Dot */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), "PPp")}
                    </span>
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">
                      {entry.notes}
                    </p>
                  )}

                  {entry.changed_by && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Changed by admin</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
