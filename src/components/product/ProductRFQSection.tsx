import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ProductRFQSectionProps {
  productId: string;
  productName: string;
  productSku: string;
}

export const ProductRFQSection = ({ productId, productName, productSku }: ProductRFQSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    quantity: "1",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit an enquiry");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create quotation request with proper schema fields
      const { error: quotationError } = await supabase
        .from("quotation_requests")
        .insert({
          user_id: user.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          company_name: formData.company,
          product_id: productId,
          product_name: `${productSku} - ${productName}`,
          quantity: parseInt(formData.quantity) || 1,
          message: `Product Enquiry: ${productSku} - ${productName}\nQuantity: ${formData.quantity}\nNotes: ${formData.notes || 'No additional notes'}`,
          status: "pending"
        });

      if (quotationError) throw quotationError;

      setIsSubmitted(true);
      toast.success("Enquiry submitted successfully! Our team will contact you within 24 hours.");
    } catch (error: any) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Enquiry Submitted!</h3>
          <p className="text-muted-foreground">
            Thank you for your interest in {productSku}. Our sales team will contact you within 24 hours with pricing and availability.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Request Price or Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in your details and our team will respond within 24 hours with a customized quote.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfq-name">Name *</Label>
            <Input
              id="rfq-name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rfq-company">Company *</Label>
            <Input
              id="rfq-company"
              placeholder="Company name"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rfq-email">Email *</Label>
            <Input
              id="rfq-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rfq-phone">Phone *</Label>
            <Input
              id="rfq-phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rfq-quantity">Required Quantity *</Label>
            <Input
              id="rfq-quantity"
              type="number"
              min="1"
              placeholder="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rfq-notes">Application / Notes (Optional)</Label>
            <Textarea
              id="rfq-notes"
              placeholder="Describe your application or any specific requirements..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="md:col-span-2">
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Enquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
