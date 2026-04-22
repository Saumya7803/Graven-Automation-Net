import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  notification_type: string;
  title: string;
  sent_date: string;
  total_sent: number;
  total_delivered: number;
  total_displayed: number;
  total_clicked: number;
  total_dismissed: number;
  open_rate: number;
  click_through_rate: number;
  avg_time_to_click_seconds: number;
}

export interface EngagementByHour {
  hour_of_day: number;
  total_sent: number;
  total_clicked: number;
  click_rate: number;
}

export interface OverviewStats {
  totalSent: number;
  avgOpenRate: number;
  avgCTR: number;
  engagementScore: number;
}

export async function getNotificationAnalytics(dateRange: { from: Date; to: Date }) {
  const { data, error } = await supabase
    .from('notification_analytics')
    .select('*')
    .gte('sent_date', dateRange.from.toISOString().split('T')[0])
    .lte('sent_date', dateRange.to.toISOString().split('T')[0])
    .order('sent_date', { ascending: false });

  return { data, error };
}

export async function getEngagementByTimeOfDay() {
  const { data, error } = await supabase.rpc('get_engagement_by_hour');
  return { data, error };
}

export async function getOverviewStats(days: number = 7): Promise<OverviewStats> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  const { data } = await getNotificationAnalytics({
    from: fromDate,
    to: new Date()
  });

  if (!data || data.length === 0) {
    return {
      totalSent: 0,
      avgOpenRate: 0,
      avgCTR: 0,
      engagementScore: 0
    };
  }

  const totalSent = data.reduce((sum, item) => sum + (item.total_sent || 0), 0);
  const avgOpenRate = data.reduce((sum, item) => sum + (item.open_rate || 0), 0) / data.length;
  const avgCTR = data.reduce((sum, item) => sum + (item.click_through_rate || 0), 0) / data.length;
  
  // Engagement score: weighted combination (60% open rate, 40% CTR)
  const engagementScore = Math.round((avgOpenRate * 0.6) + (avgCTR * 0.4));

  return {
    totalSent,
    avgOpenRate: Math.round(avgOpenRate * 10) / 10,
    avgCTR: Math.round(avgCTR * 10) / 10,
    engagementScore
  };
}

export async function getNotificationTypePerformance() {
  const { data, error } = await supabase
    .from('notification_analytics')
    .select('notification_type, open_rate, click_through_rate');

  if (error || !data) return { data: [], error };

  // Group by notification type and calculate averages
  const grouped = data.reduce((acc: any, item) => {
    const type = item.notification_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { type, rates: [], ctrs: [] };
    }
    if (item.open_rate) acc[type].rates.push(item.open_rate);
    if (item.click_through_rate) acc[type].ctrs.push(item.click_through_rate);
    return acc;
  }, {});

  const result = Object.values(grouped).map((group: any) => ({
    notification_type: group.type,
    avg_open_rate: group.rates.length > 0 
      ? Math.round((group.rates.reduce((a: number, b: number) => a + b, 0) / group.rates.length) * 10) / 10 
      : 0,
    avg_ctr: group.ctrs.length > 0 
      ? Math.round((group.ctrs.reduce((a: number, b: number) => a + b, 0) / group.ctrs.length) * 10) / 10 
      : 0
  }));

  return { data: result, error: null };
}

export async function getRecentActivity(limit: number = 10) {
  const { data, error } = await supabase
    .from('notification_interactions')
    .select(`
      id,
      action_taken,
      clicked_at,
      dismissed_at,
      device_type,
      notification_log_id,
      notification_logs (
        title,
        notification_type
      )
    `)
    .not('clicked_at', 'is', null)
    .order('clicked_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function trackNotificationInteraction(
  notificationId: string,
  action: 'click' | 'dismiss' | 'display'
) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.warn('No session available for tracking');
    return;
  }

  try {
    const response = await supabase.functions.invoke('track-notification-interaction', {
      body: {
        notificationId,
        action,
        timestamp: new Date().toISOString()
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to track notification interaction:', error);
  }
}
