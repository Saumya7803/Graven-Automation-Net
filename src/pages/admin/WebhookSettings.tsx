import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, TestTube, RefreshCw, Eye, Power, PowerOff } from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  secret_key: string;
  is_active: boolean;
  events: any;
  retry_attempts: number;
  timeout_seconds: number;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_configuration_id: string;
  event_type: string;
  resource_type: string;
  status: string;
  http_status_code: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  webhook_configurations: { name: string };
}

export default function WebhookSettings() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    webhook_url: "",
    events: ["rfq.created", "rfq.updated", "order.created", "order.updated"],
    retry_attempts: 3,
    timeout_seconds: 30,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    fetchWebhooks();
    fetchDeliveries();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("webhook_configurations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch webhooks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from("webhook_deliveries")
        .select("*, webhook_configurations(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error: any) {
      console.error("Failed to fetch deliveries:", error);
    }
  };

  const generateSecretKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const secretKey = editingWebhook?.secret_key || generateSecretKey();

      const webhookData = {
        ...formData,
        secret_key: secretKey,
        events: formData.events,
      };

      if (editingWebhook) {
        const { error } = await supabase
          .from("webhook_configurations")
          .update(webhookData)
          .eq("id", editingWebhook.id);

        if (error) throw error;
        toast.success("Webhook updated successfully");
      } else {
        const { error } = await supabase
          .from("webhook_configurations")
          .insert([webhookData]);

        if (error) throw error;
        toast.success("Webhook created successfully");
      }

      setIsDialogOpen(false);
      setEditingWebhook(null);
      setFormData({
        name: "",
        webhook_url: "",
        events: ["rfq.created", "rfq.updated", "order.created", "order.updated"],
        retry_attempts: 3,
        timeout_seconds: 30,
      });
      fetchWebhooks();
    } catch (error: any) {
      toast.error("Failed to save webhook: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const { error } = await supabase
        .from("webhook_configurations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Webhook deleted successfully");
      fetchWebhooks();
    } catch (error: any) {
      toast.error("Failed to delete webhook: " + error.message);
    }
  };

  const toggleActive = async (webhook: WebhookConfig) => {
    try {
      const { error } = await supabase
        .from("webhook_configurations")
        .update({ is_active: !webhook.is_active })
        .eq("id", webhook.id);

      if (error) throw error;
      toast.success(`Webhook ${!webhook.is_active ? 'enabled' : 'disabled'}`);
      fetchWebhooks();
    } catch (error: any) {
      toast.error("Failed to toggle webhook: " + error.message);
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    toast.info("Sending test webhook...");
    try {
      const { error } = await supabase.functions.invoke("webhook-notify", {
        body: {
          event_type: "test.webhook",
          resource_type: "test",
          resource_id: "00000000-0000-0000-0000-000000000000",
        },
      });

      if (error) throw error;
      toast.success("Test webhook sent! Check delivery log below.");
      setTimeout(fetchDeliveries, 2000);
    } catch (error: any) {
      toast.error("Failed to send test webhook: " + error.message);
    }
  };

  const retryDelivery = async (delivery: WebhookDelivery) => {
    toast.info("Retrying webhook delivery...");
    try {
      const { error } = await supabase.functions.invoke("webhook-notify", {
        body: {
          event_type: delivery.event_type,
          resource_type: delivery.resource_type,
          resource_id: delivery.resource_type,
        },
      });

      if (error) throw error;
      toast.success("Retry initiated");
      setTimeout(fetchDeliveries, 2000);
    } catch (error: any) {
      toast.error("Failed to retry: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CRM Integration</h1>
            <p className="text-muted-foreground">Manage webhooks for real-time RFQ and Order notifications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingWebhook(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingWebhook ? "Edit" : "Add"} Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook endpoint to receive real-time notifications
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Salesforce, HubSpot"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://your-crm.com/webhook"
                    required
                  />
                </div>
                <div>
                  <Label>Events to Send</Label>
                  <div className="space-y-2 mt-2">
                    {["rfq.created", "rfq.updated", "order.created", "order.updated"].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Checkbox
                          id={event}
                          checked={formData.events.includes(event)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, events: [...formData.events, event] });
                            } else {
                              setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
                            }
                          }}
                        />
                        <Label htmlFor={event} className="font-normal">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retry_attempts">Retry Attempts</Label>
                    <Input
                      id="retry_attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.retry_attempts}
                      onChange={(e) => setFormData({ ...formData, retry_attempts: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                    <Input
                      id="timeout_seconds"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Webhook</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Webhooks</CardTitle>
            <CardDescription>Configured webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No webhooks configured yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{webhook.webhook_url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(webhook)}
                          >
                            {webhook.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testWebhook(webhook)}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Log</CardTitle>
            <CardDescription>Recent webhook deliveries (last 50)</CardDescription>
          </CardHeader>
          <CardContent>
            {deliveries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No deliveries yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP Code</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.webhook_configurations.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{delivery.event_type}</Badge>
                      </TableCell>
                      <TableCell>{delivery.resource_type}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell>{delivery.http_status_code || '-'}</TableCell>
                      <TableCell>{delivery.retry_count}</TableCell>
                      <TableCell>{new Date(delivery.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {delivery.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryDelivery(delivery)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
