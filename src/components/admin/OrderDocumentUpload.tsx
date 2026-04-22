import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Loader2, Download, X } from "lucide-react";

interface OrderDocumentUploadProps {
  orderId: string;
  taxInvoiceUrl: string | null;
  ewayBillUrl: string | null;
  onUploadSuccess: () => void;
}

export default function OrderDocumentUpload({
  orderId,
  taxInvoiceUrl,
  ewayBillUrl,
  onUploadSuccess,
}: OrderDocumentUploadProps) {
  const [taxInvoiceFile, setTaxInvoiceFile] = useState<File | null>(null);
  const [ewayBillFile, setEwayBillFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const taxInvoiceInputRef = useRef<HTMLInputElement>(null);
  const ewayBillInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const uploadDocument = async (
    file: File,
    documentType: "tax_invoice" | "eway_bill"
  ) => {
    const timestamp = Date.now();
    const fileName = `${orderId}/${documentType}-${timestamp}.pdf`;

    try {
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("order-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("order-documents")
        .getPublicUrl(fileName);

      // Update order with document URL
      const updateField =
        documentType === "tax_invoice" ? "tax_invoice_url" : "eway_bill_url";

      const { error: updateError } = await supabase
        .from("orders")
        .update({ [updateField]: urlData.publicUrl })
        .eq("id", orderId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!taxInvoiceFile && !ewayBillFile) {
      toast.error("Please select at least one document to upload");
      return;
    }

    setUploading(true);
    try {
      // Track which documents are being uploaded
      const uploadedDocTypes: ('tax_invoice' | 'eway_bill')[] = [];

      if (taxInvoiceFile) {
        await uploadDocument(taxInvoiceFile, "tax_invoice");
        uploadedDocTypes.push('tax_invoice');
      }
      if (ewayBillFile) {
        await uploadDocument(ewayBillFile, "eway_bill");
        uploadedDocTypes.push('eway_bill');
      }

      // Send email notification to customer
      try {
        const { error: notificationError } = await supabase.functions.invoke(
          'send-order-documents-notification',
          {
            body: {
              orderId,
              documentTypes: uploadedDocTypes
            }
          }
        );

        if (notificationError) {
          console.error('Failed to send notification email:', notificationError);
          // Don't throw - we still want to show upload success
        }
      } catch (notifError) {
        console.error('Error calling notification function:', notifError);
        // Don't throw - we still want to show upload success
      }

      toast.success("Document(s) uploaded successfully. Customer has been notified via email.");
      setTaxInvoiceFile(null);
      setEwayBillFile(null);
      // Reset file inputs
      if (taxInvoiceInputRef.current) taxInvoiceInputRef.current.value = "";
      if (ewayBillInputRef.current) ewayBillInputRef.current.value = "";
      onUploadSuccess();
    } catch (error) {
      toast.error("Failed to upload document(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentType: "tax_invoice" | "eway_bill") => {
    setUploading(true);
    try {
      const url =
        documentType === "tax_invoice" ? taxInvoiceUrl : ewayBillUrl;
      if (!url) return;

      // Extract file path from URL
      const urlParts = url.split("/order-documents/");
      if (urlParts.length < 2) throw new Error("Invalid URL");
      const filePath = urlParts[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("order-documents")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update order
      const updateField =
        documentType === "tax_invoice" ? "tax_invoice_url" : "eway_bill_url";

      const { error: updateError } = await supabase
        .from("orders")
        .update({ [updateField]: null })
        .eq("id", orderId);

      if (updateError) throw updateError;

      toast.success("Document deleted successfully");
      onUploadSuccess();
    } catch (error) {
      console.error(`Error deleting ${documentType}:`, error);
      toast.error("Failed to delete document");
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = (type: "tax_invoice" | "eway_bill") => {
    if (type === "tax_invoice") {
      setTaxInvoiceFile(null);
      if (taxInvoiceInputRef.current) taxInvoiceInputRef.current.value = "";
    } else {
      setEwayBillFile(null);
      if (ewayBillInputRef.current) ewayBillInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tax Invoice */}
      <div className="space-y-3">
        <Label>Tax Invoice (PDF only, max 5MB)</Label>
        {taxInvoiceUrl ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Tax Invoice</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadDocument(taxInvoiceUrl, "tax-invoice.pdf")
                }
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete("tax_invoice")}
                disabled={uploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              ref={taxInvoiceInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && validateFile(file)) {
                  setTaxInvoiceFile(file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => taxInvoiceInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            {taxInvoiceFile ? (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{taxInvoiceFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => clearFile("tax_invoice")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No file chosen</span>
            )}
          </div>
        )}
      </div>

      {/* E-way Bill */}
      <div className="space-y-3">
        <Label>E-way Bill (PDF only, max 5MB)</Label>
        {ewayBillUrl ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">E-way Bill</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadDocument(ewayBillUrl, "eway-bill.pdf")}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete("eway_bill")}
                disabled={uploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              ref={ewayBillInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && validateFile(file)) {
                  setEwayBillFile(file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => ewayBillInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            {ewayBillFile ? (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{ewayBillFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => clearFile("eway_bill")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No file chosen</span>
            )}
          </div>
        )}
      </div>

      {/* Upload Button */}
      {(taxInvoiceFile || ewayBillFile) && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document(s)
            </>
          )}
        </Button>
      )}
    </div>
  );
}
