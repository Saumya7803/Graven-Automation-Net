import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecoveryTemplateDialogProps {
  template: any;
  open: boolean;
  onClose: () => void;
}

export function RecoveryTemplateDialog({
  template,
  open,
  onClose,
}: RecoveryTemplateDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const templateType = watch("template_type", "email");
  const discountType = watch("discount_type");

  useEffect(() => {
    if (template) {
      reset(template);
    } else {
      reset({
        name: "",
        template_type: "email",
        stage_number: 1,
        send_after_hours: 24,
        email_subject: "",
        email_html: "",
        push_title: "",
        push_body: "",
        discount_type: null,
        discount_value: 0,
        is_active: true,
      });
    }
  }, [template, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (template) {
        const { error } = await supabase
          .from("cart_recovery_templates")
          .update(data)
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_recovery_templates")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-recovery-templates"] });
      toast({ title: template ? "Template updated" : "Template created" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to save template", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create Template"}
          </DialogTitle>
          <DialogDescription>
            Configure your cart recovery email or push notification template
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="e.g., First Reminder - 10% Discount"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="template_type">Type</Label>
                <Select
                  value={templateType}
                  onValueChange={(value) => setValue("template_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stage_number">Stage Number</Label>
                <Input
                  id="stage_number"
                  type="number"
                  {...register("stage_number", { required: true, min: 1, max: 4 })}
                />
              </div>

              <div>
                <Label htmlFor="send_after_hours">Send After (hours)</Label>
                <Input
                  id="send_after_hours"
                  type="number"
                  {...register("send_after_hours", { required: true, min: 1 })}
                />
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Discount Settings (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  value={discountType || "none"}
                  onValueChange={(value) =>
                    setValue("discount_type", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountType && discountType !== "none" && (
                <>
                  <div>
                    <Label htmlFor="discount_value">
                      {discountType === "percentage" ? "Percentage (%)" : "Amount (₹)"}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      {...register("discount_value", { min: 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount_code_prefix">Code Prefix</Label>
                    <Input
                      id="discount_code_prefix"
                      {...register("discount_code_prefix")}
                      placeholder="e.g., CART10"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" disabled={templateType === "push"}>
                Email Content
              </TabsTrigger>
              <TabsTrigger value="push" disabled={templateType === "email"}>
                Push Notification
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email_subject">Email Subject</Label>
                <Input
                  id="email_subject"
                  {...register("email_subject")}
                  placeholder="You left items in your cart!"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available variables: {"{"}customer_name{"}"}, {"{"}cart_total{"}"}
                </p>
              </div>

              <div>
                <Label htmlFor="email_html">Email HTML</Label>
                <Textarea
                  id="email_html"
                  {...register("email_html")}
                  placeholder="<h1>Complete your purchase!</h1>"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use HTML tags. Available variables: {"{"}customer_name{"}"}, {"{"}cart_total
                  {"}"}, {"{"}discount_code{"}"}, {"{"}cart_link{"}"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="push" className="space-y-4">
              <div>
                <Label htmlFor="push_title">Notification Title</Label>
                <Input
                  id="push_title"
                  {...register("push_title")}
                  placeholder="Complete your purchase"
                />
              </div>

              <div>
                <Label htmlFor="push_body">Notification Body</Label>
                <Textarea
                  id="push_body"
                  {...register("push_body")}
                  placeholder="You have items waiting in your cart..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="push_action_url">Action URL</Label>
                <Input
                  id="push_action_url"
                  {...register("push_action_url")}
                  placeholder="/cart-recovery/{recovery_token}"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
              {saveMutation.isPending ? "Saving..." : template ? "Update Template" : "Create Template"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
