import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Smartphone, Monitor } from "lucide-react";

interface DeviceBreakdownProps {
  mobileCount: number;
  desktopCount: number;
}

export const DeviceBreakdown = ({ mobileCount, desktopCount }: DeviceBreakdownProps) => {
  const total = mobileCount + desktopCount;
  const data = [
    { name: 'Mobile', value: mobileCount, percentage: total > 0 ? ((mobileCount / total) * 100).toFixed(1) : 0 },
    { name: 'Desktop', value: desktopCount, percentage: total > 0 ? ((desktopCount / total) * 100).toFixed(1) : 0 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Mobile</p>
                <p className="text-2xl font-bold">{data[0].percentage}%</p>
                <p className="text-xs text-muted-foreground">{mobileCount.toLocaleString()} clicks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Monitor className="h-5 w-5" style={{ color: 'hsl(var(--chart-2))' }} />
              </div>
              <div>
                <p className="text-sm font-medium">Desktop</p>
                <p className="text-2xl font-bold">{data[1].percentage}%</p>
                <p className="text-xs text-muted-foreground">{desktopCount.toLocaleString()} clicks</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
