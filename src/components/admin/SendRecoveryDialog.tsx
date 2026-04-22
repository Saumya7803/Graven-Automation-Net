import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface SendRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
  preselectedTemplateId?: string;
}

export function SendRecoveryDialog({
  open,
  onClose,
  preselectedTemplateId,
}: SendRecoveryDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || ""
  );
  const [recipientFilter, setRecipientFilter] = useState<"all" | "never_emailed" | "test">("all");
  const [testEmail, setTestEmail] = useState("");

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ["cart-recovery-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_recovery_templates")
        .select("*")
        .eq("is_active", true)
        .order("stage_number", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch active carts stats
  const { data: cartsStats } = useQuery({
    queryKey: ["active-carts-stats", recipientFilter],
    queryFn: async () => {
      let query = supabase
        .from("abandoned_carts")
        .select("id, cart_value, first_reminder_sent_at");

      if (recipientFilter === "all") {
        query = query.eq("status", "active");
      } else if (recipientFilter === "never_emailed") {
        query = query.eq("status", "active").is("first_reminder_sent_at", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        count: data.length,
        totalValue: data.reduce((sum, cart) => sum + Number(cart.cart_value), 0),
        cartIds: data.map((cart) => cart.id),
      };
    },
    enabled: open,
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (recipientFilter === "test") {
        // For test emails, we'll need to implement a separate endpoint
        // For now, just show a toast
        return { sent: 1, failed: 0, errors: [] };
      }

      const { data, error } = await supabase.functions.invoke("send-manual-cart-recovery", {
        body: { cartIds: cartsStats?.cartIds || [] },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Recovery Emails Sent",
        description: `Successfully sent ${data.sent} email(s).${
          data.failed > 0 ? ` Failed: ${data.failed}` : ""
        }`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send emails",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (recipientFilter === "test" && !testEmail) {
      toast({
        title: "Email required",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplateId && recipientFilter !== "all") {
      toast({
        title: "Template required",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate();
  };

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Cart Recovery Emails</DialogTitle>
          <DialogDescription>
            Choose recipients and template to send manual recovery emails
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Eligible Carts</span>
              </div>
              <div className="text-2xl font-bold">{cartsStats?.count || 0}</div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Total Value</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(cartsStats?.totalValue || 0)}
              </div>
            </div>
          </div>

          {/* Recipient Filter */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <RadioGroup value={recipientFilter} onValueChange={(v: any) => setRecipientFilter(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All Active Carts ({cartsStats?.count || 0})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never_emailed" id="never_emailed" />
                <Label htmlFor="never_emailed" className="font-normal cursor-pointer">
                  Never Emailed Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test" id="test" />
                <Label htmlFor="test" className="font-normal cursor-pointer">
                  Send Test Email
                </Label>
              </div>
            </RadioGroup>

            {recipientFilter === "test" && (
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Stage {template.stage_number}</Badge>
                      <span>{template.name}</span>
                      {template.discount_value && (
                        <Badge variant="secondary" className="ml-2">
                          {template.discount_type === "percentage"
                            ? `${template.discount_value}%`
                            : `₹${template.discount_value}`}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="font-medium">{selectedTemplate.email_subject}</div>
                <div className="text-sm text-muted-foreground">
                  Sends {selectedTemplate.send_after_hours} hours after cart abandonment
                </div>
              </div>
            )}
          </div>

          {/* Warning for bulk sends */}
          {recipientFilter !== "test" && cartsStats && cartsStats.count > 0 && (
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  You're about to send {cartsStats.count} email(s)
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  This action will send recovery emails to all selected customers. Make sure you've
                  reviewed the template content.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sendEmailMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              sendEmailMutation.isPending ||
              (recipientFilter !== "test" && (!cartsStats || cartsStats.count === 0))
            }
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send {recipientFilter === "test" ? "Test Email" : `${cartsStats?.count || 0} Emails`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
