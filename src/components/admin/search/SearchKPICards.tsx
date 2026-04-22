import { Search, FileQuestion, BarChart3, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/profile/KPICard";

interface SearchKPICardsProps {
  totalSearches: number;
  uniqueQueries: number;
  zeroResultRate: number;
  avgResultCount: number;
  loading?: boolean;
}

export const SearchKPICards = ({
  totalSearches,
  uniqueQueries,
  zeroResultRate,
  avgResultCount,
  loading,
}: SearchKPICardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Searches"
        value={totalSearches.toLocaleString()}
        icon={Search}
        subtitle="All time"
        loading={loading}
        variant="info"
      />
      <KPICard
        title="Unique Queries"
        value={uniqueQueries.toLocaleString()}
        icon={TrendingUp}
        subtitle="Different search terms"
        loading={loading}
        variant="default"
      />
      <KPICard
        title="Zero Result Rate"
        value={`${zeroResultRate.toFixed(1)}%`}
        icon={FileQuestion}
        subtitle="Searches with no results"
        loading={loading}
        variant={zeroResultRate > 10 ? "warning" : "success"}
      />
      <KPICard
        title="Avg Results"
        value={avgResultCount.toFixed(1)}
        icon={BarChart3}
        subtitle="Per search"
        loading={loading}
        variant="default"
      />
    </div>
  );
};
