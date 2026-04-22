import { Card, CardContent } from "@/components/ui/card";
import { Bell, TrendingUp, MousePointer, Award } from "lucide-react";
import { KPICard } from "@/components/profile/KPICard";

interface AnalyticsOverviewProps {
  totalSent: number;
  avgOpenRate: number;
  avgCTR: number;
  engagementScore: number;
  loading?: boolean;
}

export const AnalyticsOverview = ({
  totalSent,
  avgOpenRate,
  avgCTR,
  engagementScore,
  loading
}: AnalyticsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Sent"
        value={totalSent.toLocaleString()}
        icon={Bell}
        loading={loading}
        variant="default"
      />
      <KPICard
        title="Avg. Open Rate"
        value={`${avgOpenRate}%`}
        icon={TrendingUp}
        subtitle="Last 7 days"
        loading={loading}
        variant={avgOpenRate > 30 ? "success" : avgOpenRate > 15 ? "warning" : "default"}
      />
      <KPICard
        title="Avg. Click Rate"
        value={`${avgCTR}%`}
        icon={MousePointer}
        subtitle="Last 7 days"
        loading={loading}
        variant={avgCTR > 10 ? "success" : avgCTR > 5 ? "warning" : "default"}
      />
      <KPICard
        title="Engagement Score"
        value={`${engagementScore}/100`}
        icon={Award}
        subtitle="Combined metric"
        loading={loading}
        variant={engagementScore > 40 ? "success" : engagementScore > 20 ? "info" : "default"}
      />
    </div>
  );
};
