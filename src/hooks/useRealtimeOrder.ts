import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OrderUpdate {
  id: string;
  status: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export const useRealtimeOrder = (orderId: string | undefined) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          const newData = payload.new as OrderUpdate;
          
          setLastUpdate(new Date());
          
          // Show toast notification
          toast({
            title: "Order Updated",
            description: `Status changed to: ${newData.status}`,
          });

          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log('Sound play failed'));

          // Trigger browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('Order Status Update', {
              body: `Your order is now ${newData.status}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { isConnected, lastUpdate };
};
