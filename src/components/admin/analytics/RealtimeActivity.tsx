import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer, X, Smartphone, Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action_taken: string;
  clicked_at?: string;
  dismissed_at?: string;
  device_type: string;
  notification_logs?: {
    title: string;
    notification_type: string;
  };
}

interface RealtimeActivityProps {
  activities: ActivityItem[];
}

export const RealtimeActivity = ({ activities }: RealtimeActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const timestamp = activity.clicked_at || activity.dismissed_at;
                const isClick = activity.action_taken === 'click';
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className={`p-2 rounded-lg ${isClick ? 'bg-primary/10' : 'bg-muted'}`}>
                      {isClick ? (
                        <MousePointer className="h-4 w-4 text-primary" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.notification_logs?.title || 'Notification'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.notification_logs?.notification_type || 'unknown'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {activity.device_type === 'mobile' ? (
                            <Smartphone className="h-3 w-3" />
                          ) : (
                            <Monitor className="h-3 w-3" />
                          )}
                          {activity.device_type}
                        </span>
                      </div>
                      {timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
