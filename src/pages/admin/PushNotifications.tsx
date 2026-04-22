import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users, CheckCircle, XCircle, Loader2, Clock as ClockIcon, Calendar as CalendarIcon, BarChart3, TrendingUp, MousePointer } from "lucide-react";
import { KPICard } from "@/components/profile/KPICard";
import { cn } from "@/lib/utils";
import { ScheduledNotificationsTable } from "@/components/admin/ScheduledNotificationsTable";
import { getOverviewStats } from "@/lib/notificationAnalytics";

type TargetType = "all" | "tier" | "specific";

const PushNotifications = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    totalSent: 0,
    totalFailed: 0,
    last24h: 0,
  });
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    actionUrl: "",
    targetType: "all" as TargetType,
    targetValue: "",
  });
  
  const [sendMode, setSendMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");

  // Load analytics overview
  const { data: analyticsOverview } = useQuery({
    queryKey: ['notification-overview-stats', 7],
    queryFn: () => getOverviewStats(7),
    enabled: isAdmin
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      // Get active subscribers count
      const { count: subscribersCount } = await supabase
        .from("push_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get notification logs stats
      const { data: logs } = await supabase
        .from("notification_logs")
        .select("*")
        .order("id", { ascending: false })
        .limit(1000);

      const totalSent = logs?.filter((l) => l.status === "sent").length || 0;
      const totalFailed = logs?.filter((l) => l.status === "failed").length || 0;
      
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const last24h = logs?.filter(
        (l) => l.status === "sent" && l.id
      ).length || 0;

      setStats({
        totalSubscribers: subscribersCount || 0,
        totalSent,
        totalFailed,
        last24h,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and body are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.title.length > 50) {
      toast({
        title: "Validation Error",
        description: "Title must be 50 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (formData.body.length > 150) {
      toast({
        title: "Validation Error",
        description: "Body must be 150 characters or less",
        variant: "destructive",
      });
      return;
    }

    // Validate scheduling
    if (sendMode === "scheduled") {
      if (!scheduledDate) {
        toast({
          title: "Validation Error",
          description: "Please select a date for scheduling",
          variant: "destructive",
        });
        return;
      }

      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (scheduledDateTime <= fiveMinutesFromNow) {
        toast({
          title: "Validation Error",
          description: "Scheduled time must be at least 5 minutes in the future",
          variant: "destructive",
        });
        return;
      }
    }

    setSending(true);

    try {
      let scheduledAt: string | undefined;

      if (sendMode === "scheduled" && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        scheduledAt = scheduledDateTime.toISOString();
      }

      const notification = {
        title: formData.title,
        body: formData.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: formData.actionUrl ? { url: formData.actionUrl } : undefined,
      };

      const { data, error } = await supabase.functions.invoke(
        "send-bulk-push-notification",
        {
          body: {
            notification,
            targetType: formData.targetType,
            targetValue: formData.targetValue || undefined,
            notificationType: "admin-announcement",
            scheduledAt,
          },
        }
      );

      if (error) throw error;

      if (data.scheduled) {
        toast({
          title: "Notification Scheduled!",
          description: `Will be sent on ${format(new Date(scheduledAt!), "PPp")}`,
        });
      } else {
        toast({
          title: "Notifications Sent!",
          description: `Successfully sent to ${data.summary?.sent || 0} users. Failed: ${data.summary?.failed || 0}`,
        });
      }

      // Reset form
      setFormData({
        title: "",
        body: "",
        actionUrl: "",
        targetType: "all",
        targetValue: "",
      });
      setSendMode("immediate");
      setScheduledDate(undefined);
      setScheduledTime("12:00");

      // Reload stats
      loadStats();
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const titleCharsLeft = 50 - formData.title.length;
  const bodyCharsLeft = 150 - formData.body.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Push Notifications</h1>
          <p className="text-muted-foreground">
            Send targeted push notifications to your users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFailed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24h}</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Performance</CardTitle>
                <CardDescription>Engagement metrics for the last 7 days</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/analytics/notifications')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Full Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsOverview?.totalSent === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications sent yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send your first notification to start tracking engagement metrics
                </p>
                <Button variant="outline" onClick={() => document.getElementById('notification-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Your First Notification
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Sent"
                  value={analyticsOverview?.totalSent?.toLocaleString() || '0'}
                  icon={Bell}
                  subtitle="Last 7 days"
                  loading={!analyticsOverview}
                  variant="default"
                />
                <KPICard
                  title="Avg. Open Rate"
                  value={`${analyticsOverview?.avgOpenRate || 0}%`}
                  icon={TrendingUp}
                  subtitle={
                    analyticsOverview?.avgOpenRate && analyticsOverview.avgOpenRate > 30
                      ? "Excellent engagement"
                      : analyticsOverview?.avgOpenRate && analyticsOverview.avgOpenRate > 15
                      ? "Good engagement"
                      : "Room for improvement"
                  }
                  loading={!analyticsOverview}
                  variant={
                    analyticsOverview?.avgOpenRate && analyticsOverview.avgOpenRate > 30
                      ? "success"
                      : analyticsOverview?.avgOpenRate && analyticsOverview.avgOpenRate > 15
                      ? "warning"
                      : "info"
                  }
                />
                <KPICard
                  title="Avg. Click Rate"
                  value={`${analyticsOverview?.avgCTR || 0}%`}
                  icon={MousePointer}
                  subtitle={
                    analyticsOverview?.avgCTR && analyticsOverview.avgCTR > 10
                      ? "Excellent performance"
                      : analyticsOverview?.avgCTR && analyticsOverview.avgCTR > 5
                      ? "Good performance"
                      : "Can be improved"
                  }
                  loading={!analyticsOverview}
                  variant={
                    analyticsOverview?.avgCTR && analyticsOverview.avgCTR > 10
                      ? "success"
                      : analyticsOverview?.avgCTR && analyticsOverview.avgCTR > 5
                      ? "warning"
                      : "info"
                  }
                />
                <KPICard
                  title="Engagement Score"
                  value={`${analyticsOverview?.engagementScore || 0}/100`}
                  icon={BarChart3}
                  subtitle={`From ${analyticsOverview?.totalSent || 0} notifications`}
                  loading={!analyticsOverview}
                  variant={
                    analyticsOverview?.engagementScore && analyticsOverview.engagementScore > 40
                      ? "success"
                      : analyticsOverview?.engagementScore && analyticsOverview.engagementScore > 20
                      ? "info"
                      : "default"
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Notification Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card id="notification-form">
              <CardHeader>
                <CardTitle>Send New Notification</CardTitle>
                <CardDescription>
                  Compose and send push notifications to your users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Send Mode Selection */}
                <div className="space-y-3">
                  <Label>Delivery Mode</Label>
                  <RadioGroup value={sendMode} onValueChange={(value: any) => setSendMode(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate" className="font-normal cursor-pointer">
                        Send Now
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <Label htmlFor="scheduled" className="font-normal cursor-pointer">
                        Schedule for Later
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {sendMode === "scheduled" && (
                  <div className="space-y-3">
                    <Label>Scheduled Date & Time</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal flex-1",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetType">Target Audience</Label>
                  <Select
                    value={formData.targetType}
                    onValueChange={(value: TargetType) =>
                      setFormData({ ...formData, targetType: value, targetValue: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="tier">By Tier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.targetType === "tier" && (
                  <div className="space-y-2">
                    <Label htmlFor="tier">Select Tier</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP Customers</SelectItem>
                        <SelectItem value="regular">Regular Customers</SelectItem>
                        <SelectItem value="new">New Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="title">Title *</Label>
                    <span className={`text-sm ${titleCharsLeft < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {titleCharsLeft} chars left
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., New Product Launch!"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={60}
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="body">Message *</Label>
                    <span className={`text-sm ${bodyCharsLeft < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {bodyCharsLeft} chars left
                    </span>
                  </div>
                  <Textarea
                    id="body"
                    placeholder="e.g., Check out our latest VFD series with advanced features..."
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={4}
                    maxLength={160}
                  />
                </div>

                {/* Action URL */}
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                  <Input
                    id="actionUrl"
                    type="url"
                    placeholder="https://yoursite.com/products/new"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Users will be redirected to this URL when they click the notification
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={sending || !formData.title.trim() || !formData.body.trim()}
                  className="w-full"
                  size="lg"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {sendMode === "scheduled" ? "Scheduling..." : "Sending..."}
                    </>
                  ) : sendMode === "scheduled" ? (
                    <>
                      <ClockIcon className="mr-2 h-4 w-4" />
                      Schedule Notification
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Notifications Table */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Scheduled Notifications</CardTitle>
                <CardDescription>View and manage scheduled push notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduledNotificationsTable />
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How it will appear on devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {formData.title || "Notification Title"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                        {formData.body || "Your notification message will appear here..."}
                      </p>
                      {formData.actionUrl && (
                        <p className="text-xs text-primary mt-2 truncate">
                          🔗 {formData.actionUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Actual appearance may vary by browser and device
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PushNotifications;
