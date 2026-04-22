import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions?: number;
    ctr?: number;
  }>;
  title: string;
  type?: 'line' | 'bar';
  metrics?: Array<'impressions' | 'clicks' | 'conversions' | 'ctr'>;
}

export function GooglePerformanceChart({ 
  data, 
  title, 
  type = 'line',
  metrics = ['impressions', 'clicks']
}: PerformanceChartProps) {
  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--chart-1))",
    },
    clicks: {
      label: "Clicks",
      color: "hsl(var(--chart-2))",
    },
    conversions: {
      label: "Conversions",
      color: "hsl(var(--chart-3))",
    },
    ctr: {
      label: "CTR %",
      color: "hsl(var(--chart-4))",
    },
  };

  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              
              {metrics.includes('impressions') && (
                type === 'line' ? (
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="var(--color-impressions)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-impressions)' }}
                  />
                ) : (
                  <Bar 
                    dataKey="impressions" 
                    fill="var(--color-impressions)" 
                  />
                )
              )}
              
              {metrics.includes('clicks') && (
                type === 'line' ? (
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="var(--color-clicks)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-clicks)' }}
                  />
                ) : (
                  <Bar 
                    dataKey="clicks" 
                    fill="var(--color-clicks)" 
                  />
                )
              )}
              
              {metrics.includes('conversions') && (
                type === 'line' ? (
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="var(--color-conversions)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-conversions)' }}
                  />
                ) : (
                  <Bar 
                    dataKey="conversions" 
                    fill="var(--color-conversions)" 
                  />
                )
              )}
              
              {metrics.includes('ctr') && (
                type === 'line' ? (
                  <Line 
                    type="monotone" 
                    dataKey="ctr" 
                    stroke="var(--color-ctr)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-ctr)' }}
                  />
                ) : (
                  <Bar 
                    dataKey="ctr" 
                    fill="var(--color-ctr)" 
                  />
                )
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
