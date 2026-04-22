import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlertConfig {
  id: string;
  threshold_count: number;
  time_window_hours: number;
  is_enabled: boolean;
  notification_methods: string[];
  recipient_emails: string[];
  check_frequency_minutes: number;
  cooldown_hours: number;
}

interface AlertConfigFormProps {
  config: AlertConfig | null;
  onUpdate: () => void;
}

export const AlertConfigForm = ({ config, onUpdate }: AlertConfigFormProps) => {
  const [isEnabled, setIsEnabled] = useState(config?.is_enabled ?? true);
  const [threshold, setThreshold] = useState(config?.threshold_count ?? 5);
  const [timeWindow, setTimeWindow] = useState(config?.time_window_hours ?? 24);
  const [cooldown, setCooldown] = useState(config?.cooldown_hours ?? 24);
  const [checkFrequency, setCheckFrequency] = useState(config?.check_frequency_minutes ?? 60);
  const [pushEnabled, setPushEnabled] = useState(config?.notification_methods?.includes('push') ?? true);
  const [emailEnabled, setEmailEnabled] = useState(config?.notification_methods?.includes('email') ?? true);
  const [recipientEmails, setRecipientEmails] = useState<string[]>(config?.recipient_emails ?? []);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (recipientEmails.includes(newEmail)) {
      toast.error('Email already added');
      return;
    }
    setRecipientEmails([...recipientEmails, newEmail]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setRecipientEmails(recipientEmails.filter(e => e !== email));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const notificationMethods = [];
      if (pushEnabled) notificationMethods.push('push');
      if (emailEnabled) notificationMethods.push('email');

      const updateData = {
        is_enabled: isEnabled,
        threshold_count: threshold,
        time_window_hours: timeWindow,
        cooldown_hours: cooldown,
        check_frequency_minutes: checkFrequency,
        notification_methods: notificationMethods,
        recipient_emails: recipientEmails,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('search_alert_config')
        .update(updateData)
        .eq('id', config?.id);

      if (error) throw error;

      toast.success('Alert settings saved successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Error saving alert config:', error);
      toast.error('Failed to save alert settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Alert Configuration</CardTitle>
        <CardDescription>
          Configure automatic alerts for zero-result search queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Zero-Result Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Automatically notify admins when queries exceed threshold
            </p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>

        {isEnabled && (
          <>
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Failed search attempts to trigger alert
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeWindow">Time Window (hours)</Label>
                  <Input
                    id="timeWindow"
                    type="number"
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Period to count failed searches
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkFrequency">Check Frequency (minutes)</Label>
                  <Input
                    id="checkFrequency"
                    type="number"
                    value={checkFrequency}
                    onChange={(e) => setCheckFrequency(parseInt(e.target.value))}
                    min={30}
                  />
                  <p className="text-xs text-muted-foreground">
                    How often to check for alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown">Alert Cooldown (hours)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    value={cooldown}
                    onChange={(e) => setCooldown(parseInt(e.target.value))}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Don't re-alert same query within this period
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Notification Methods</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send to all admin devices
                  </p>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send to configured recipients
                  </p>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
            </div>

            {emailEnabled && (
              <div className="space-y-4 pt-4 border-t">
                <Label>Email Recipients</Label>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Button type="button" onClick={handleAddEmail} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipientEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="pl-3 pr-1">
                      {email}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1"
                        onClick={() => handleRemoveEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Alert Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};