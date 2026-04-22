import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  gateway_name: z.string().min(1, "Gateway name is required"),
  gateway_type: z.string().min(1, "Gateway type is required"),
  display_name: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_test_mode: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
  key_id: z.string().optional(),
  key_secret: z.string().optional(),
  webhook_secret: z.string().optional(),
  supported_currencies: z.string().default("INR"),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateway?: any;
}

export function PaymentGatewayDialog({
  open,
  onOpenChange,
  gateway,
}: PaymentGatewayDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gateway_name: "",
      gateway_type: "razorpay",
      display_name: "",
      description: "",
      is_active: true,
      is_test_mode: true,
      display_order: 0,
      key_id: "",
      key_secret: "",
      webhook_secret: "",
      supported_currencies: "INR",
    },
  });

  useEffect(() => {
    if (gateway) {
      form.reset({
        gateway_name: gateway.gateway_name,
        gateway_type: gateway.gateway_type,
        display_name: gateway.display_name,
        description: gateway.description || "",
        is_active: gateway.is_active,
        is_test_mode: gateway.is_test_mode,
        display_order: gateway.display_order,
        key_id: gateway.configuration?.key_id || "",
        key_secret: gateway.configuration?.key_secret || "",
        webhook_secret: gateway.configuration?.webhook_secret || "",
        supported_currencies: gateway.supported_currencies?.join(", ") || "INR",
      });
    } else {
      form.reset({
        gateway_name: "",
        gateway_type: "razorpay",
        display_name: "",
        description: "",
        is_active: true,
        is_test_mode: true,
        display_order: 0,
        key_id: "",
        key_secret: "",
        webhook_secret: "",
        supported_currencies: "INR",
      });
    }
  }, [gateway, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const configuration = {
        key_id: values.key_id,
        key_secret: values.key_secret,
        webhook_secret: values.webhook_secret,
      };

      const currencies = values.supported_currencies
        .split(",")
        .map((c) => c.trim().toUpperCase());

      const gatewayData = {
        gateway_name: values.gateway_name,
        gateway_type: values.gateway_type,
        display_name: values.display_name,
        description: values.description || null,
        is_active: values.is_active,
        is_test_mode: values.is_test_mode,
        display_order: values.display_order,
        configuration,
        supported_currencies: currencies,
      };

      if (gateway) {
        const { error } = await supabase
          .from("payment_gateways")
          .update(gatewayData)
          .eq("id", gateway.id);

        if (error) throw error;
        toast.success("Payment gateway updated successfully");
      } else {
        const { error } = await supabase
          .from("payment_gateways")
          .insert([gatewayData]);

        if (error) throw error;
        toast.success("Payment gateway added successfully");
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving gateway:", error);
      toast.error(error.message || "Failed to save payment gateway");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {gateway ? "Edit Payment Gateway" : "Add Payment Gateway"}
          </DialogTitle>
          <DialogDescription>
            Configure payment gateway settings and credentials
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gateway_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!gateway}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gateway type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe (Coming Soon)</SelectItem>
                      <SelectItem value="paypal">PayPal (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gateway_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Razorpay India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name shown to customers" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name customers will see at checkout
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription className="text-xs">
                        Enable this gateway
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_test_mode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Test Mode</FormLabel>
                      <FormDescription className="text-xs">
                        Use test credentials
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first in checkout
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Razorpay Configuration</h4>

              <FormField
                control={form.control}
                name="key_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key ID</FormLabel>
                    <FormControl>
                      <Input placeholder="rzp_test_..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key_secret"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Key Secret</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter secret key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhook_secret"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Webhook Secret</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Optional webhook secret" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supported_currencies"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Supported Currencies</FormLabel>
                    <FormControl>
                      <Input placeholder="INR, USD, EUR (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter currency codes separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {gateway ? "Update Gateway" : "Add Gateway"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
