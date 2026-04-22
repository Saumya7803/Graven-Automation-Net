import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PerformanceData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  product_sku: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

export function useGooglePerformance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['google-performance', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_shopping_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true }) as any;

      if (error) throw error;

      // Aggregate by date
      const dailyData: Record<string, PerformanceData> = {};
      
      data?.forEach((row: any) => {
        if (!dailyData[row.date]) {
          dailyData[row.date] = {
            date: row.date,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            ctr: 0,
            conversionRate: 0,
          };
        }
        
        dailyData[row.date].impressions += row.impressions || 0;
        dailyData[row.date].clicks += row.clicks || 0;
        dailyData[row.date].conversions += row.conversions || 0;
        dailyData[row.date].revenue += Number(row.revenue) || 0;
      });

      // Calculate rates
      const performance: PerformanceData[] = Object.values(dailyData).map((day) => ({
        ...day,
        ctr: day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0,
        conversionRate: day.clicks > 0 ? (day.conversions / day.clicks) * 100 : 0,
      }));

      return performance;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useTopPerformers(metric: 'impressions' | 'clicks' | 'revenue' | 'conversions', limit = 10) {
  return useQuery({
    queryKey: ['google-top-performers', metric, limit],
    queryFn: async () => {
      const { data: performanceData, error } = await supabase
        .from('google_shopping_performance')
        .select(`
          product_id,
          impressions,
          clicks,
          conversions,
          revenue
        `) as any;

      if (error) throw error;

      // Aggregate by product
      const productMap: Record<string, any> = {};
      
      performanceData?.forEach((row: any) => {
        if (!productMap[row.product_id]) {
          productMap[row.product_id] = {
            product_id: row.product_id,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          };
        }
        
        productMap[row.product_id].impressions += row.impressions || 0;
        productMap[row.product_id].clicks += row.clicks || 0;
        productMap[row.product_id].conversions += row.conversions || 0;
        productMap[row.product_id].revenue += Number(row.revenue) || 0;
      });

      // Get product details
      const productIds = Object.keys(productMap);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Merge product details
      const enrichedData: ProductPerformance[] = Object.values(productMap).map((perf) => {
        const product = products?.find(p => p.id === perf.product_id);
        return {
          ...perf,
          product_name: product?.name || 'Unknown',
          product_sku: product?.sku || 'N/A',
          ctr: perf.impressions > 0 ? (perf.clicks / perf.impressions) * 100 : 0,
          conversionRate: perf.clicks > 0 ? (perf.conversions / perf.clicks) * 100 : 0,
        };
      });

      // Sort by metric
      enrichedData.sort((a, b) => b[metric] - a[metric]);

      return enrichedData.slice(0, limit);
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function usePerformanceSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['google-performance-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_shopping_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate) as any;

      if (error) throw error;

      const summary = {
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgCTR: 0,
        avgConversionRate: 0,
      };

      data?.forEach((row: any) => {
        summary.totalImpressions += row.impressions || 0;
        summary.totalClicks += row.clicks || 0;
        summary.totalConversions += row.conversions || 0;
        summary.totalRevenue += Number(row.revenue) || 0;
      });

      summary.avgCTR = summary.totalImpressions > 0 
        ? (summary.totalClicks / summary.totalImpressions) * 100 
        : 0;
      
      summary.avgConversionRate = summary.totalClicks > 0 
        ? (summary.totalConversions / summary.totalClicks) * 100 
        : 0;

      return summary;
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
