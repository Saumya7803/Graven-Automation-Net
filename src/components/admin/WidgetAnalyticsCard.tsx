import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, MousePointer, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function WidgetAnalyticsCard() {
  const [metrics, setMetrics] = useState({
    tooltipShown: 0,
    whatsappClicked: 0,
    manualDismissed: 0,
    autoDismissed: 0,
    clickThroughRate: 0,
    dismissRate: 0,
  });
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchWidgetAnalytics();
  }, []);

  const fetchWidgetAnalytics = async () => {
    try {
      // Fetch all widget events for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data } = await supabase
        .from('widget_analytics')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!data) return;

      // Calculate metrics
      const tooltipShown = data.filter(e => e.event_type === 'tooltip_shown').length;
      const whatsappClicked = data.filter(e => e.event_type === 'whatsapp_clicked').length;
      const manualDismissed = data.filter(e => e.event_type === 'tooltip_dismissed_manual').length;
      const autoDismissed = data.filter(e => e.event_type === 'tooltip_dismissed_auto').length;

      const clickThroughRate = tooltipShown > 0 ? (whatsappClicked / tooltipShown) * 100 : 0;
      const dismissRate = tooltipShown > 0 ? ((manualDismissed + autoDismissed) / tooltipShown) * 100 : 0;

      setMetrics({
        tooltipShown,
        whatsappClicked,
        manualDismissed,
        autoDismissed,
        clickThroughRate,
        dismissRate,
      });

      // Group by day for chart
      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayData = data.filter(e => {
          const eventDate = new Date(e.created_at);
          return eventDate >= dayStart && eventDate <= dayEnd;
        });

        return {
          day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          clicks: dayData.filter(e => e.event_type === 'whatsapp_clicked').length,
          shown: dayData.filter(e => e.event_type === 'tooltip_shown').length,
        };
      });

      setDailyData(dailyStats);
    } catch (error) {
      console.error('Error fetching widget analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">WhatsApp Widget Analytics</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tooltips Shown</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tooltipShown}</div>
            <p className="text-xs text-muted-foreground">First-time visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.whatsappClicked}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.clickThroughRate.toFixed(1)}% click-through rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manual Dismissals</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.manualDismissed}</div>
            <p className="text-xs text-muted-foreground">Clicked X button</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auto Dismissals</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.autoDismissed}</div>
            <p className="text-xs text-muted-foreground">After 5 seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="shown" fill="#94a3b8" name="Tooltips Shown" />
              <Bar dataKey="clicks" fill="#25D366" name="WhatsApp Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
