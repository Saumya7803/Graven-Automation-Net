import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SearchKPICards } from "@/components/admin/search/SearchKPICards";
import { SearchVolumeChart } from "@/components/admin/search/SearchVolumeChart";
import { TrendingSearchesTable } from "@/components/admin/search/TrendingSearchesTable";
import { ZeroResultQueriesTable } from "@/components/admin/search/ZeroResultQueriesTable";
import { RecentSearchesTable } from "@/components/admin/search/RecentSearchesTable";
import { AlertBanner } from "@/components/admin/search/AlertBanner";
import { AlertHistoryTable } from "@/components/admin/search/AlertHistoryTable";
import { AcknowledgeAlertDialog } from "@/components/admin/search/AcknowledgeAlertDialog";

export default function SearchAnalytics() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // KPI State
  const [totalSearches, setTotalSearches] = useState(0);
  const [uniqueQueries, setUniqueQueries] = useState(0);
  const [zeroResultRate, setZeroResultRate] = useState(0);
  const [avgResultCount, setAvgResultCount] = useState(0);

  // Chart State
  const [volumeData, setVolumeData] = useState<Array<{ date: string; searches: number; unique: number }>>([]);

  // Table State
  const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
  const [zeroResultQueries, setZeroResultQueries] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [showAlertHistory, setShowAlertHistory] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<{ id: string; query: string } | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchAnalytics();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch KPI metrics
      const { data: kpiData } = await supabase
        .from('search_analytics')
        .select('search_count, results_count, zero_results_count');

      if (kpiData) {
        const total = kpiData.reduce((sum, row) => sum + (row.search_count || 0), 0);
        const unique = kpiData.length;
        const totalZeroResults = kpiData.reduce((sum, row) => sum + (row.zero_results_count || 0), 0);
        const zeroRate = total > 0 ? (totalZeroResults / total) * 100 : 0;
        const avgResults = kpiData.length > 0
          ? kpiData.reduce((sum, row) => sum + (row.results_count || 0), 0) / kpiData.length
          : 0;

        setTotalSearches(total);
        setUniqueQueries(unique);
        setZeroResultRate(zeroRate);
        setAvgResultCount(avgResults);
      }

      // Fetch trending searches
      const { data: trending } = await supabase
        .from('search_analytics')
        .select('search_query, search_count, last_searched_at')
        .order('search_count', { ascending: false })
        .limit(20);

      if (trending) setTrendingSearches(trending);

      // Fetch zero-result queries
      const { data: zeroResults } = await supabase
        .from('search_analytics')
        .select('search_query, zero_results_count, last_searched_at')
        .gt('zero_results_count', 0)
        .order('zero_results_count', { ascending: false })
        .limit(20);

      if (zeroResults) setZeroResultQueries(zeroResults);

      // Fetch recent searches
      const { data: recent } = await supabase
        .from('search_analytics')
        .select('search_query, search_count, last_searched_at, results_count')
        .order('last_searched_at', { ascending: false })
        .limit(50);

      if (recent) setRecentSearches(recent);

      // Fetch volume data (last 30 days)
      const { data: volume } = await supabase
        .from('search_analytics')
        .select('last_searched_at, search_count')
        .gte('last_searched_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('last_searched_at', { ascending: true });

      if (volume) {
        // Group by date
        const grouped = volume.reduce((acc: any, row) => {
          const date = new Date(row.last_searched_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { searches: 0, unique: 0 };
          }
          acc[date].searches += row.search_count;
          acc[date].unique += 1;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([date, data]: [string, any]) => ({
          date,
          searches: data.searches,
          unique: data.unique,
        }));

        setVolumeData(chartData);
      }

      // Fetch alert history
      const { data: alertData } = await supabase
        .from("search_alert_history")
        .select("*")
        .order("notification_sent_at", { ascending: false })
        .limit(50);

      setAlertHistory(alertData || []);
      
      // Filter active (unacknowledged) alerts
      const active = (alertData || []).filter((alert: any) => !alert.acknowledged);
      setActiveAlerts(active);
    } catch (error) {
      console.error('Error fetching search analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string, searchQuery: string) => {
    setSelectedAlert({ id: alertId, query: searchQuery });
  };

  const handleAlertAcknowledged = () => {
    fetchAnalytics();
    setSelectedAlert(null);
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Search Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Monitor search trends and optimize your product catalog
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <AlertBanner 
            alertCount={activeAlerts.length}
            onViewDetails={() => setShowAlertHistory(true)}
          />

          {/* KPI Cards */}
          <SearchKPICards
            totalSearches={totalSearches}
            uniqueQueries={uniqueQueries}
            zeroResultRate={zeroResultRate}
            avgResultCount={avgResultCount}
            loading={loading}
          />

          {/* Volume Chart */}
          <SearchVolumeChart data={volumeData} loading={loading} />

          {/* Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            <TrendingSearchesTable data={trendingSearches} loading={loading} />
            <ZeroResultQueriesTable data={zeroResultQueries} loading={loading} />
          </div>

          {/* Recent Searches */}
          <RecentSearchesTable data={recentSearches} loading={loading} />

          {/* Alert History */}
          {showAlertHistory && (
            <AlertHistoryTable 
              data={alertHistory} 
              loading={loading}
              onAcknowledge={(id) => {
                const alert = alertHistory.find(a => a.id === id);
                if (alert) handleAcknowledgeAlert(id, alert.search_query);
              }}
            />
          )}
        </div>
      </main>
      <Footer />

      <AcknowledgeAlertDialog
        alertId={selectedAlert?.id || null}
        searchQuery={selectedAlert?.query || ""}
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onSuccess={handleAlertAcknowledged}
      />
    </div>
  );
}
