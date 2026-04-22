import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusHistoryTimelineProps {
  history: Array<{
    id: string;
    status: string;
    notes?: string;
    created_at: string;
  }>;
}

export default function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
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

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Status History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((entry, index) => (
            <div key={entry.id} className="relative">
              {index < sortedHistory.length - 1 && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
              )}
              <div className="flex gap-3">
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full ${getStatusColor(entry.status)}`} />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(entry.status)} variant="outline">
                      {entry.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), "PPp")}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
