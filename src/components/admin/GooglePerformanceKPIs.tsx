import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye, MousePointer, ShoppingCart, DollarSign, Percent, Target } from "lucide-react";

interface KPICardsProps {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCTR: number;
  avgConversionRate: number;
  previousPeriodData?: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
  };
}

export function GooglePerformanceKPIs({
  totalImpressions,
  totalClicks,
  totalConversions,
  totalRevenue,
  avgCTR,
  avgConversionRate,
  previousPeriodData,
}: KPICardsProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = calculateChange(current, previous);
    if (change === null) return null;

    const isPositive = change > 0;
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const revenuePerClick = totalClicks > 0 ? totalRevenue / totalClicks : 0;
  const avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Impressions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Impressions</p>
              <h3 className="text-3xl font-bold mt-2">{totalImpressions.toLocaleString()}</h3>
              {renderTrend(totalImpressions, previousPeriodData?.impressions)}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Clicks */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clicks</p>
              <h3 className="text-3xl font-bold mt-2">{totalClicks.toLocaleString()}</h3>
              {renderTrend(totalClicks, previousPeriodData?.clicks)}
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTR */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
              <h3 className="text-3xl font-bold mt-2">{avgCTR.toFixed(2)}%</h3>
              {renderTrend(avgCTR, previousPeriodData?.ctr)}
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversions</p>
              <h3 className="text-3xl font-bold mt-2 text-green-600">{totalConversions.toLocaleString()}</h3>
              {renderTrend(totalConversions, previousPeriodData?.conversions)}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</h3>
              {renderTrend(totalRevenue, previousPeriodData?.revenue)}
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <h3 className="text-3xl font-bold mt-2">{avgConversionRate.toFixed(2)}%</h3>
              {renderTrend(avgConversionRate, previousPeriodData?.conversionRate)}
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Percent className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Per Click */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue Per Click</p>
              <h3 className="text-3xl font-bold mt-2">₹{revenuePerClick.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <h3 className="text-3xl font-bold mt-2">₹{avgOrderValue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
