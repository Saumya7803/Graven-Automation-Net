import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ProductSelector from "./ProductSelector";
import FileUpload from "./FileUpload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { validateCustomerProfileForPDF } from "@/lib/validations/customerProfile";

interface RequestQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
}

const RequestQuotationDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
}: RequestQuotationDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { customer, loading: customerLoading } = useCustomerProfile();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      id: string;
      name: string;
      sku: string;
      series: string;
      power_range: string;
      price: number;
      quantity: number;
    }>
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: user?.email || "",
    customer_phone: "",
    company_name: "",
    message: "",
  });

  // Check authentication and auto-fill customer data when dialog opens
  useEffect(() => {
    if (open) {
      // If user is not logged in, redirect to auth page
      if (!user) {
        onOpenChange(false);
        toast({
          title: "Authentication Required",
          description: "Please sign in or create an account to request a quotation.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Reset selectedProducts when opening with a productId
      if (productId) {
        setSelectedProducts([]);
      }

      // Auto-fill form data from customer profile
      if (customer) {
        setFormData({
          customer_name: customer.full_name || "",
          customer_email: customer.email || user.email || "",
          customer_phone: customer.phone || "",
          company_name: customer.company_name || "",
          message: formData.message,
        });
      }
    }
  }, [open, productId, user, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Re-check authentication before submission
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a quotation request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!formData.customer_name || !formData.customer_email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Starting quotation submission...", { userId: user?.id, isAuthenticated: !!user });

      // Upload file if selected
      let attachmentUrl = null;
      if (selectedFile) {
        console.log("Uploading file...", { fileName: selectedFile.name, size: selectedFile.size });
        const fileName = `${user?.id || 'guest'}_${Date.now()}_${selectedFile.name}`;
        const filePath = `${user?.id || 'guest'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("rfq-attachments")
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error("File upload failed:", uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
        attachmentUrl = filePath;
        console.log("File uploaded successfully:", filePath);
      }

      // Insert quotation request
      console.log("Inserting quotation request...", {
        user_id: user?.id || null,
        customer_email: formData.customer_email,
      });

      const { data: quotationData, error: quotationError } = await supabase
        .from("quotation_requests")
        .insert({
          user_id: user.id,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          company_name: formData.company_name || null,
          message: formData.message,
          attachment_url: attachmentUrl,
          status: "pending",
        })
        .select()
        .single();

      if (quotationError) {
        console.error("Quotation insert failed:", quotationError);
        throw new Error(`Failed to create quotation: ${quotationError.message} (Code: ${quotationError.code})`);
      }

      console.log("Quotation created successfully:", quotationData.id);

      // Insert quotation request items
      const items = selectedProducts.map((product) => ({
        quotation_request_id: quotationData.id,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: product.quantity,
      }));

      console.log("Inserting quotation items...", { count: items.length });

      const { error: itemsError } = await supabase
        .from("quotation_request_items")
        .insert(items);

      if (itemsError) {
        console.error("Items insert failed:", itemsError);
        throw new Error(`Failed to add products: ${itemsError.message} (Code: ${itemsError.code})`);
      }

      console.log("Quotation items inserted successfully");

      toast({
        title: "Success!",
        description: "Your quotation request has been submitted. We'll get back to you soon!",
      });

      onOpenChange(false);
      // Keep customer data, only reset message and file
      setFormData({
        ...formData,
        message: "",
      });
      setSelectedProducts([]);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Quotation submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit quotation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Quotation</DialogTitle>
          <DialogDescription>
            {!user ? (
              "You need to be logged in to request a quotation."
            ) : productName ? (
              `Requesting quotation for ${productName}. You can add more products below.`
            ) : (
              "Fill out the form below and we'll get back to you with a quotation"
            )}
          </DialogDescription>
        </DialogHeader>

        {customerLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your profile...
          </div>
        )}
        
        {customer && !customerLoading && (
          (() => {
            const validation = validateCustomerProfileForPDF(customer);
            return !validation.isComplete ? (
              <Alert className="border-amber-500 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 text-sm">Profile Incomplete</AlertTitle>
                <AlertDescription className="text-amber-800 text-xs">
                  For complete quotation PDFs, please add: {validation.missingFields.join(', ')} in your profile.
                </AlertDescription>
              </Alert>
            ) : null;
          })()
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="John Doe"
                required
                disabled={customerLoading}
                className={customerLoading ? "bg-muted" : ""}
              />
              {customer && (
                <p className="text-xs text-muted-foreground">
                  This information is from your profile. Update it in{" "}
                  <Link to="/profile" className="text-primary hover:underline">
                    Profile Settings
                  </Link>
                  .
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                placeholder="john@example.com"
                required
                disabled={true}
                className="bg-muted"
              />
            </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Phone</Label>
            <Input
              id="customer_phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
              placeholder="+1 (555) 000-0000"
            />
          </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="ACME Corp"
                disabled={customerLoading}
                className={customerLoading ? "bg-muted" : ""}
              />
              {customer && customer.company_name && (
                <p className="text-xs text-muted-foreground">
                  From your profile
                </p>
              )}
            </div>

          <ProductSelector
            selectedProducts={selectedProducts}
            onProductsChange={setSelectedProducts}
            defaultProductId={productId}
          />

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Please provide details about your requirements..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestQuotationDialog;
