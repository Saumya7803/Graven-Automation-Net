import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AlertHistory {
  id: string;
  search_query: string;
  zero_results_count: number;
  priority_score: number;
  notification_sent_at: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  action_taken: string | null;
}

interface AlertHistoryTableProps {
  data: AlertHistory[];
  loading: boolean;
  onAcknowledge: (alertId: string) => void;
}

export const AlertHistoryTable = ({ data, loading, onAcknowledge }: AlertHistoryTableProps) => {
  const getPriorityVariant = (score: number): "default" | "destructive" | "secondary" => {
    if (score >= 20) return "destructive";
    if (score >= 10) return "default";
    return "secondary";
  };

  const getPriorityLabel = (score: number): string => {
    if (score >= 20) return "🔴 Critical";
    if (score >= 10) return "🟠 High";
    if (score >= 5) return "🟡 Medium";
    return "🟢 Low";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>Recent zero-result query alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading alert history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>
          Recent alerts for zero-result queries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts have been triggered yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-center">Attempts</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead>Alerted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      {alert.search_query}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">
                        {alert.zero_results_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getPriorityVariant(alert.priority_score)}>
                        {getPriorityLabel(alert.priority_score)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(alert.notification_sent_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {alert.acknowledged ? (
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                          {alert.action_taken && (
                            <p className="text-xs text-muted-foreground">
                              {alert.action_taken}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};