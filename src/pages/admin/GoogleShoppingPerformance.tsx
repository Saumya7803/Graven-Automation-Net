import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { GooglePerformanceKPIs } from "@/components/admin/GooglePerformanceKPIs";
import { GooglePerformanceChart } from "@/components/admin/GooglePerformanceChart";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import { useGooglePerformance, useTopPerformers, usePerformanceSummary } from "@/hooks/useGooglePerformance";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoogleShoppingPerformance() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("last30days");

  const getDateRange = () => {
    const today = new Date();
    let startDate: string;
    let endDate = today.toISOString().split('T')[0];

    if (dateRange === "last7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
    } else if (dateRange === "last30days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
    } else if (dateRange === "last90days") {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
    } else {
      startDate = endDate;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();
  
  const { data: performanceData, isLoading: isLoadingPerformance } = useGooglePerformance(startDate, endDate);
  const { data: summary, isLoading: isLoadingSummary } = usePerformanceSummary(startDate, endDate);
  const { data: topPerformers, isLoading: isLoadingTop } = useTopPerformers('revenue', 10);

  const handleExportCSV = () => {
    if (!performanceData) return;

    const csvContent = [
      ['Date', 'Impressions', 'Clicks', 'CTR %', 'Conversions', 'Conversion Rate %', 'Revenue'],
      ...performanceData.map(row => [
        row.date,
        row.impressions,
        row.clicks,
        row.ctr.toFixed(2),
        row.conversions,
        row.conversionRate.toFixed(2),
        row.revenue,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-shopping-performance-${startDate}-to-${endDate}.csv`;
    a.click();
  };

  const isLoading = isLoadingPerformance || isLoadingSummary || isLoadingTop;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/google-shopping")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Google Shopping Performance</h1>
              <p className="text-muted-foreground">Track impressions, clicks, and conversions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {summary && (
          <div className="mb-8">
            <GooglePerformanceKPIs
              totalImpressions={summary.totalImpressions}
              totalClicks={summary.totalClicks}
              totalConversions={summary.totalConversions}
              totalRevenue={summary.totalRevenue}
              avgCTR={summary.avgCTR}
              avgConversionRate={summary.avgConversionRate}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {performanceData && (
            <>
              <GooglePerformanceChart
                data={performanceData}
                title="Performance Trends"
                type="line"
                metrics={['impressions', 'clicks', 'conversions']}
              />
              
              <GooglePerformanceChart
                data={performanceData}
                title="Click-Through Rate Over Time"
                type="line"
                metrics={['ctr']}
              />
            </>
          )}
        </div>

        {/* Conversion Funnel and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {summary && (
            <ConversionFunnel
              impressions={summary.totalImpressions}
              clicks={summary.totalClicks}
              conversions={summary.totalConversions}
            />
          )}
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers?.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">{product.product_sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{product.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{product.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{product.ctr.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{product.conversions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{product.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!topPerformers || topPerformers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No performance data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
