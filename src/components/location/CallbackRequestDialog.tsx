import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const callbackSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  customer_email: z.string().email("Invalid email address").max(255),
  customer_phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^(\+91|91)?[6-9]\d{9}$/, "Please enter a valid Indian phone number"),
  company_name: z.string().optional(),
  reason: z.string().optional(),
  message: z.string().max(1000).optional(),
});

type CallbackFormValues = z.infer<typeof callbackSchema>;

interface CallbackRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationPage?: string;
  source?: string;
}

export function CallbackRequestDialog({
  open,
  onOpenChange,
  locationPage,
  source = "location_page",
}: CallbackRequestDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CallbackFormValues>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      company_name: "",
      message: "",
    },
  });

  const onSubmit = async (data: CallbackFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: insertedCallback, error } = await supabase
        .from("callback_requests")
        .insert({
          user_id: user?.id || null,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          company_name: data.company_name || null,
          preferred_date: null,
          preferred_time_slot: null,
          reason: data.reason || null,
          message: data.message || null,
          location_page: locationPage || null,
          source,
          status: "pending",
          priority: "urgent",
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notifications
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-callback-notification',
          {
            body: { callbackId: insertedCallback.id }
          }
        );
        
        if (emailError) {
          console.error('Email notification error:', emailError);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      toast({
        title: "Callback Request Submitted",
        description: "Our sales team will call you within 2-5 minutes. Please keep your phone nearby.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting callback request:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit callback request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Callback</DialogTitle>
          <DialogDescription>
            Fill out this form and our sales team will call you back within 2-5 minutes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Callback (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="product_inquiry">Product Inquiry</SelectItem>
                      <SelectItem value="technical_support">Technical Support</SelectItem>
                      <SelectItem value="pricing">Pricing Information</SelectItem>
                      <SelectItem value="installation">Installation Assistance</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about your requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}