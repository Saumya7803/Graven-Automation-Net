import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsOverview {
  totalProducts: number;
  syncedProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  disapprovedProducts: number;
  errorProducts: number;
  notSyncedProducts: number;
  approvalRate: number;
  qualityScore: number;
  lastSyncAt: string | null;
}

export function useGoogleShoppingAnalytics() {
  return useQuery({
    queryKey: ['google-shopping-analytics'],
    queryFn: async (): Promise<AnalyticsOverview> => {
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get product statuses
      const { data: statusData } = await supabase
        .from('google_product_status')
        .select('approval_status');

      const syncedProducts = statusData?.length || 0;
      const approvedProducts = statusData?.filter(s => s.approval_status === 'approved').length || 0;
      const pendingProducts = statusData?.filter(s => s.approval_status === 'pending').length || 0;
      const disapprovedProducts = statusData?.filter(s => s.approval_status === 'disapproved').length || 0;
      const errorProducts = statusData?.filter(s => s.approval_status === 'error').length || 0;
      const notSyncedProducts = (totalProducts || 0) - syncedProducts;

      // Calculate approval rate
      const approvalRate = syncedProducts > 0 
        ? Math.round((approvedProducts / syncedProducts) * 100) 
        : 0;

      // Get data quality score (products with complete required fields)
      const { data: products } = await supabase
        .from('products')
        .select('gtin, brand, condition, google_product_category, image_url')
        .eq('is_active', true);

      const completeProducts = products?.filter(p => 
        p.gtin && p.brand && p.condition && p.google_product_category && p.image_url
      ).length || 0;

      const qualityScore = totalProducts ? Math.round((completeProducts / totalProducts) * 100) : 0;

      // Get last sync time
      const { data: lastSync } = await supabase
        .from('google_sync_log')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalProducts: totalProducts || 0,
        syncedProducts,
        approvedProducts,
        pendingProducts,
        disapprovedProducts,
        errorProducts,
        notSyncedProducts,
        approvalRate,
        qualityScore,
        lastSyncAt: lastSync?.created_at || null,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSyncHistory(days: number = 30) {
  return useQuery({
    queryKey: ['google-sync-history', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('google_sync_log')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useProductStatusList() {
  return useQuery({
    queryKey: ['google-product-status-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_product_status')
        .select(`
          *,
          products:product_id (
            id,
            sku,
            name,
            image_url
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useTopIssues() {
  return useQuery({
    queryKey: ['google-top-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_product_status')
        .select('item_level_issues')
        .not('item_level_issues', 'is', null);

      if (error) throw error;

      // Aggregate issues
      const issueMap = new Map<string, number>();
      
      data?.forEach(row => {
        const issues = row.item_level_issues;
        if (Array.isArray(issues)) {
          issues.forEach((issue: any) => {
            const key = issue.servability || issue.code || 'Unknown';
            issueMap.set(key, (issueMap.get(key) || 0) + 1);
          });
        }
      });

      // Convert to array and sort
      return Array.from(issueMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });
}
