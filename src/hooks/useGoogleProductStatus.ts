import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GoogleProductStatus {
  id: string;
  product_id: string;
  merchant_product_id: string | null;
  approval_status: string;
  item_level_issues: any;
  last_synced_at: string | null;
  sync_error: string | null;
}

export function useGoogleProductStatus(productId?: string) {
  const [status, setStatus] = useState<GoogleProductStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('google_product_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'google_product_status',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          console.log('Google product status updated:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newStatus = payload.new as GoogleProductStatus;
            setStatus(newStatus);

            // Show toast for approval status changes
            if (payload.eventType === 'UPDATE' && payload.old) {
              const oldStatus = (payload.old as GoogleProductStatus).approval_status;
              const newApprovalStatus = newStatus.approval_status;

              if (oldStatus !== newApprovalStatus) {
                if (newApprovalStatus === 'approved') {
                  toast({
                    title: "Product Approved",
                    description: "Your product has been approved on Google Shopping",
                  });
                } else if (newApprovalStatus === 'disapproved') {
                  toast({
                    title: "Product Disapproved",
                    description: "Your product was disapproved. Check the issues for details.",
                    variant: "destructive",
                  });
                }
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  const fetchStatus = async () => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from('google_product_status')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setStatus(data);
    } catch (error) {
      console.error('Error fetching Google product status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, refetch: fetchStatus };
}
