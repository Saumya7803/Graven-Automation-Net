import { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { pushNotificationManager } from '@/utils/pushNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
    checkPushSubscription();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) setPreferences(data);
    setLoading(false);
  };

  const checkPushSubscription = async () => {
    const subscription = await pushNotificationManager.getCurrentSubscription();
    setIsSubscribed(!!subscription);
  };

  const handleToggle = async (field: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .update({ [field]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      });
    } else {
      setPreferences({ ...preferences, [field]: value });
      toast({
        title: 'Updated',
        description: 'Notification preferences saved'
      });
    }
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await pushNotificationManager.unsubscribeFromPush();
      setIsSubscribed(false);
      toast({ title: 'Unsubscribed', description: 'Push notifications disabled' });
    } else {
      const granted = await pushNotificationManager.requestPermission();
      if (granted) {
        await pushNotificationManager.subscribeToPush();
        setIsSubscribed(true);
        toast({ title: 'Subscribed', description: 'Push notifications enabled' });
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive updates and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 mt-0.5" />
            <div>
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when the app is closed
              </p>
            </div>
          </div>
          <Switch checked={isSubscribed} onCheckedChange={handlePushToggle} />
        </div>

        <Separator />

        {/* Order Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <h3 className="font-medium">Order Updates</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            {[
              { key: 'order_placed', label: 'Order Placed' },
              { key: 'order_confirmed', label: 'Order Confirmed' },
              { key: 'order_shipped', label: 'Order Shipped' },
              { key: 'order_delivered', label: 'Order Delivered' },
              { key: 'order_cancelled', label: 'Order Cancelled' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={preferences?.[key] ?? true}
                  onCheckedChange={(val) => handleToggle(key, val)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quotation Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h3 className="font-medium">Quotation Updates</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            {[
              { key: 'quotation_received', label: 'Quotation Received' },
              { key: 'quotation_approved', label: 'Quotation Approved' },
              { key: 'quotation_revised', label: 'Quotation Revised' },
              { key: 'quotation_finalized', label: 'Quotation Finalized' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={preferences?.[key] ?? true}
                  onCheckedChange={(val) => handleToggle(key, val)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Marketing Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <h3 className="font-medium">Marketing & Updates</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            {[
              { key: 'promotional_offers', label: 'Promotional Offers' },
              { key: 'newsletter', label: 'Newsletter' },
              { key: 'product_updates', label: 'Product Updates' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={preferences?.[key] ?? false}
                  onCheckedChange={(val) => handleToggle(key, val)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
