import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeOfDayChartProps {
  data: Array<{
    hour_of_day: number;
    total_sent: number;
    total_clicked: number;
    click_rate: number;
  }>;
}

export const TimeOfDayChart = ({ data }: TimeOfDayChartProps) => {
  const chartData = data.map(item => ({
    hour: `${item.hour_of_day}:00`,
    'Click Rate': item.click_rate || 0,
    Sent: item.total_sent
  }));

  // Find best time
  const bestTime = data.reduce((best, current) => 
    (current.click_rate || 0) > (best.click_rate || 0) ? current : best
  , data[0] || { hour_of_day: 0, click_rate: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Time to Send</CardTitle>
        <CardDescription>
          Peak engagement at {bestTime.hour_of_day}:00 with {bestTime.click_rate?.toFixed(1)}% click rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="hour" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Click Rate %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="Click Rate" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
