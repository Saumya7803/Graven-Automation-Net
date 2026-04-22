import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  getNotificationAnalytics,
  getOverviewStats,
  getEngagementByTimeOfDay,
  getNotificationTypePerformance,
  getRecentActivity
} from "@/lib/notificationAnalytics";
import { AnalyticsOverview } from "@/components/admin/analytics/AnalyticsOverview";
import { EngagementChart } from "@/components/admin/analytics/EngagementChart";
import { PerformanceTable } from "@/components/admin/analytics/PerformanceTable";
import { TimeOfDayChart } from "@/components/admin/analytics/TimeOfDayChart";
import { DeviceBreakdown } from "@/components/admin/analytics/DeviceBreakdown";
import { RealtimeActivity } from "@/components/admin/analytics/RealtimeActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationAnalytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  // Overview stats
  const { data: overviewStats, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-overview-stats', 7],
    queryFn: () => getOverviewStats(7)
  });

  // Analytics data
  const { data: analyticsResponse } = useQuery({
    queryKey: ['notification-analytics', dateRange],
    queryFn: () => getNotificationAnalytics(dateRange)
  });

  // Time of day engagement
  const { data: timeOfDayResponse } = useQuery({
    queryKey: ['engagement-by-hour'],
    queryFn: getEngagementByTimeOfDay
  });

  // Notification type performance
  const { data: typePerformanceResponse } = useQuery({
    queryKey: ['notification-type-performance'],
    queryFn: getNotificationTypePerformance
  });

  // Recent activity
  const { data: recentActivityResponse } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => getRecentActivity(20),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Calculate device breakdown
  const deviceStats = recentActivityResponse?.data?.reduce((acc: any, item: any) => {
    if (item.device_type === 'mobile') acc.mobile++;
    else acc.desktop++;
    return acc;
  }, { mobile: 0, desktop: 0 }) || { mobile: 0, desktop: 0 };

  const analyticsData = analyticsResponse?.data || [];
  const timeOfDayData = timeOfDayResponse?.data || [];
  const recentActivity = recentActivityResponse?.data || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/push-notifications')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notification Analytics</h1>
            <p className="text-muted-foreground">Track engagement and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex gap-2 p-3 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange({
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange({
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                >
                  Last 30 days
                </Button>
              </div>
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <AnalyticsOverview
        totalSent={overviewStats?.totalSent || 0}
        avgOpenRate={overviewStats?.avgOpenRate || 0}
        avgCTR={overviewStats?.avgCTR || 0}
        engagementScore={overviewStats?.engagementScore || 0}
        loading={statsLoading}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EngagementChart data={analyticsData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeOfDayChart data={timeOfDayData} />
            <DeviceBreakdown 
              mobileCount={deviceStats.mobile} 
              desktopCount={deviceStats.desktop} 
            />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTable data={analyticsData} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeOfDayChart data={timeOfDayData} />
            <DeviceBreakdown 
              mobileCount={deviceStats.mobile} 
              desktopCount={deviceStats.desktop} 
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Notification Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typePerformanceResponse?.data?.map((type: any) => (
                  <div key={type.notification_type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{type.notification_type.replace(/-/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">Notification Type</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{type.avg_open_rate}%</p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{type.avg_ctr}%</p>
                        <p className="text-xs text-muted-foreground">Click Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <RealtimeActivity activities={recentActivity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
