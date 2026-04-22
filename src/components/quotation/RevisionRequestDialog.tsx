import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RevisionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  quotationNumber: string;
  quotation: {
    user_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    final_amount: number;
  } | null;
  itemCount: number;
  onSuccess: () => void;
}

export const RevisionRequestDialog = ({
  open,
  onOpenChange,
  quotationId,
  quotationNumber,
  quotation,
  itemCount,
  onSuccess,
}: RevisionRequestDialogProps) => {
  const [revisionMessage, setRevisionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!revisionMessage.trim()) {
      toast.error("Please enter your revision request");
      return;
    }

    if (!quotation) {
      toast.error("Quotation data not available");
      return;
    }

    setLoading(true);
    try {
      // Update quotation status to revision_requested
      const { error: updateError } = await supabase
        .from("quotation_requests")
        .update({ 
          status: "revision_requested",
          admin_notes: revisionMessage 
        })
        .eq("id", quotationId);

      if (updateError) throw updateError;

      // Send notification to admin
      const { error: emailError } = await supabase.functions.invoke(
        "send-revision-notification",
        {
          body: {
            adminEmail: "sales@gravenautomation.com",
            customerName: quotation.customer_name,
            customerEmail: quotation.customer_email,
            customerId: quotation.user_id,
            quotationNumber: quotationNumber,
            quotationId: quotationId,
            revisionMessage: revisionMessage,
            currentQuote: {
              totalAmount: quotation.total_amount,
              finalAmount: quotation.final_amount,
              itemCount: itemCount,
            },
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the entire operation if email fails
      }

      toast.success("Revision request sent! We'll review and get back to you.");
      setRevisionMessage("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting revision request:", error);
      toast.error("Failed to submit revision request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Quote Revision</DialogTitle>
          <DialogDescription>
            Tell us what you'd like us to revise in your quotation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like us to revise?</label>
            <Textarea
              placeholder="e.g., Better pricing on bulk order, Include installation service, Extended warranty option..."
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
