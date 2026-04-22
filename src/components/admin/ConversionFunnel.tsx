import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

interface ConversionFunnelProps {
  impressions: number;
  clicks: number;
  conversions: number;
}

export function ConversionFunnel({ impressions, clicks, conversions }: ConversionFunnelProps) {
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

  const stages = [
    {
      name: "Impressions",
      value: impressions,
      width: 100,
      color: "bg-blue-500",
    },
    {
      name: "Clicks",
      value: clicks,
      width: impressions > 0 ? (clicks / impressions) * 100 : 0,
      color: "bg-purple-500",
      rate: ctr,
    },
    {
      name: "Conversions",
      value: conversions,
      width: impressions > 0 ? (conversions / impressions) * 100 : 0,
      color: "bg-green-500",
      rate: conversionRate,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {stage.value.toLocaleString()}
                </span>
                {stage.rate !== undefined && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {stage.rate.toFixed(2)}% conversion
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-center text-white font-semibold`}
                  style={{ width: `${Math.max(stage.width, 5)}%` }}
                >
                  {stage.width > 15 && `${stage.width.toFixed(1)}%`}
                </div>
              </div>
            </div>
            
            {index < stages.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Overall CTR</p>
              <p className="text-2xl font-bold">{ctr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Click to Conversion</p>
              <p className="text-2xl font-bold">{conversionRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
