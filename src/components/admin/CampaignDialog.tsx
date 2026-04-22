import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EMAIL_TEMPLATES, replacePlaceholders } from "@/lib/campaignUtils";
import { calculateCustomerTier } from "@/lib/utils";
import { Send, Save, Eye } from "lucide-react";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
  onSuccess: () => void;
}

export function CampaignDialog({ open, onOpenChange, campaignId, onSuccess }: CampaignDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    target_tiers: [] as string[],
    email_type: "custom",
    template_html: "",
    status: "draft",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    if (campaignId && open) {
      fetchCampaign();
    } else if (open) {
      resetForm();
    }
  }, [campaignId, open]);

  useEffect(() => {
    if (formData.target_tiers.length > 0) {
      estimateRecipients();
    }
  }, [formData.target_tiers]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        subject: data.subject,
        target_tiers: data.target_tiers,
        email_type: data.email_type,
        template_html: data.template_html,
        status: data.status,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch campaign",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      target_tiers: [],
      email_type: "custom",
      template_html: "",
      status: "draft",
    });
    setSelectedTemplate("");
    setRecipientCount(0);
  };

  const estimateRecipients = async () => {
    setEstimating(true);
    try {
      const { data: customers } = await supabase
        .from("customers")
        .select("user_id, created_at");

      if (!customers) return;

      // If "all" tier is selected, count all customers
      if (formData.target_tiers.includes("all")) {
        setRecipientCount(customers.length);
        setEstimating(false);
        return;
      }

      const { data: orders } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      if (!orders) return;

      const ordersByUser = new Map();
      orders.forEach(order => {
        if (!ordersByUser.has(order.user_id)) {
          ordersByUser.set(order.user_id, []);
        }
        ordersByUser.get(order.user_id).push(order);
      });

      const matchingCustomers = customers.filter(customer => {
        const userOrders = ordersByUser.get(customer.user_id) || [];
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
        
        const tier = calculateCustomerTier(totalSpent, totalOrders, customer.created_at);
        return formData.target_tiers.includes(tier);
      });

      setRecipientCount(matchingCustomers.length);
    } catch (error) {
      console.error("Error estimating recipients:", error);
    } finally {
      setEstimating(false);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
    if (template) {
      setFormData({
        ...formData,
        email_type: templateKey,
        subject: template.defaultSubject,
        template_html: template.template,
      });
    }
  };

  const handleTierToggle = (tier: string) => {
    if (tier === "all") {
      // If "all" is selected, clear other tiers or toggle off
      setFormData({
        ...formData,
        target_tiers: formData.target_tiers.includes("all") ? [] : ["all"],
      });
    } else {
      // If any specific tier is selected, remove "all" first
      const updatedTiers = formData.target_tiers
        .filter(t => t !== "all")
        .filter(t => t !== tier);
      
      if (!formData.target_tiers.includes(tier)) {
        updatedTiers.push(tier);
      }
      
      setFormData({
        ...formData,
        target_tiers: updatedTiers,
      });
    }
  };

  const handleSave = async (sendNow: boolean = false) => {
    if (!formData.name || !formData.subject || formData.target_tiers.length === 0 || !formData.template_html) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const campaignData = {
        ...formData,
        status: sendNow ? "scheduled" : "draft",
      };

      let savedCampaignId = campaignId;

      if (campaignId) {
        const { error } = await supabase
          .from("email_campaigns")
          .update(campaignData)
          .eq("id", campaignId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("email_campaigns")
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        savedCampaignId = data.id;
      }

      if (sendNow && savedCampaignId) {
        await sendCampaign(savedCampaignId);
      } else {
        toast({
          title: "Success",
          description: `Campaign ${campaignId ? "updated" : "created"} successfully`,
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${campaignId ? "update" : "create"} campaign`,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-emails", {
        body: { campaignId: id },
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent!",
        description: `Successfully sent to ${data.sent} recipients`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send campaign",
      });
    }
  };

  const getPreviewHtml = () => {
    return replacePlaceholders(formData.template_html, {
      customer_name: "John Doe",
      tier: "regular",
      tier_badge: "⭐",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaignId ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP Summer Sale 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Exclusive 20% OFF for VIP Customers"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{formData.subject.length}/100 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Target Customer Tiers *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={formData.target_tiers.includes("all")}
                    onCheckedChange={() => handleTierToggle("all")}
                  />
                  <label htmlFor="all" className="text-sm font-semibold">🌐 All Customers</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vip"
                    checked={formData.target_tiers.includes("vip")}
                    onCheckedChange={() => handleTierToggle("vip")}
                  />
                  <label htmlFor="vip" className="text-sm">👑 VIP</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="regular"
                    checked={formData.target_tiers.includes("regular")}
                    onCheckedChange={() => handleTierToggle("regular")}
                  />
                  <label htmlFor="regular" className="text-sm">⭐ Regular</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new"
                    checked={formData.target_tiers.includes("new")}
                    onCheckedChange={() => handleTierToggle("new")}
                  />
                  <label htmlFor="new" className="text-sm">🆕 New</label>
                </div>
              </div>
              {formData.target_tiers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {estimating ? "Estimating..." : `Estimated recipients: ${recipientCount} customers`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template_html">Email HTML Template *</Label>
              <Textarea
                id="template_html"
                value={formData.template_html}
                onChange={(e) => setFormData({ ...formData, template_html: e.target.value })}
                placeholder="Enter your HTML template here..."
                rows={20}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {"{"}{"{"} customer_name {"}"} {"}"}, {"{"}{"{"} tier {"}"} {"}"}, {"{"}{"{"} tier_badge {"}"} {"}"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div
                  className="border rounded-lg p-4 bg-background"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
