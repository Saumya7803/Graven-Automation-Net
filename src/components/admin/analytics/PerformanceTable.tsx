import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PerformanceTableProps {
  data: Array<{
    notification_type: string;
    title: string;
    sent_date: string;
    total_sent: number;
    total_delivered: number;
    total_displayed: number;
    total_clicked: number;
    open_rate: number;
    click_through_rate: number;
  }>;
}

export const PerformanceTable = ({ data }: PerformanceTableProps) => {
  const getPerformanceBadge = (rate: number, type: 'open' | 'click') => {
    const threshold = type === 'open' ? 30 : 10;
    const mediumThreshold = type === 'open' ? 15 : 5;
    
    if (rate >= threshold) return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    if (rate >= mediumThreshold) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Clicked</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No notification data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.notification_type}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(item.sent_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">{item.total_sent}</TableCell>
                    <TableCell className="text-right">{item.total_delivered}</TableCell>
                    <TableCell className="text-right">{item.total_displayed}</TableCell>
                    <TableCell className="text-right">{item.total_clicked}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.open_rate?.toFixed(1)}%
                        {getPerformanceBadge(item.open_rate || 0, 'open')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.click_through_rate?.toFixed(1)}%
                        {getPerformanceBadge(item.click_through_rate || 0, 'click')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
