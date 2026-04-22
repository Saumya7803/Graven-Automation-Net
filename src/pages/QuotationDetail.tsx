import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Package, ArrowLeft, RefreshCw, ShoppingCart, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { RevisionRequestDialog } from "@/components/quotation/RevisionRequestDialog";

interface QuotationItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  final_price: number;
}

interface Quotation {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  company_name: string;
  status: string;
  message: string;
  quote_notes: string | null;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  created_at: string;
  quoted_at: string | null;
  expires_at: string | null;
  attachment_url: string | null;
  is_final: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  quoted: "bg-green-100 text-green-800",
  revision_requested: "bg-orange-100 text-orange-800",
  revised: "bg-purple-100 text-purple-800",
  finalized: "bg-emerald-100 text-emerald-800",
  converted_to_order: "bg-gray-100 text-gray-800",
  closed: "bg-red-100 text-red-800",
};

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: quotationData, error: quotationError } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (quotationError) throw quotationError;

      setQuotation(quotationData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("quotation_request_items")
        .select("*")
        .eq("quotation_request_id", id);

      if (itemsError) throw itemsError;

      setItems(itemsData || []);
    } catch (error: any) {
      console.error("Error fetching quotation:", error);
      toast.error("Failed to load quotation");
      navigate("/my-quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const { error } = await supabase
        .from("quotation_requests")
        .update({ status: "finalized" })
        .eq("id", id);

      if (error) throw error;

      // Send notification to admin
      await supabase.functions.invoke("send-finalized-notification", {
        body: {
          adminEmail: "sales@gravenautomation.com",
          customerName: quotation?.customer_name,
          customerEmail: quotation?.customer_email,
          customerId: quotation?.user_id,
          quotationNumber: `QR-${id?.slice(0, 8).toUpperCase()}`,
          quotationId: id,
          finalAmount: quotation?.final_amount || 0,
          itemCount: items.length,
        },
      });

      toast.success("Quotation finalized! You can now proceed to checkout.");
      fetchQuotation();
    } catch (error: any) {
      console.error("Error finalizing quotation:", error);
      toast.error("Failed to finalize quotation");
    } finally {
      setFinalizing(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate(`/checkout?quotation_id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quotation) {
    return null;
  }

  const daysUntilExpiry = quotation.expires_at
    ? Math.ceil(
        (new Date(quotation.expires_at).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/my-quotations")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Quotations
          </Button>

          {/* Header Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Quotation #{id?.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[quotation.status]}>
                    {quotation.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  {quotation.status === "revision_requested" && (
                    <span className="text-sm text-muted-foreground">
                      ⏳ Awaiting admin review
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Requested on</p>
                <p className="font-medium">
                  {format(new Date(quotation.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              {quotation.quoted_at && (
                <div>
                  <p className="text-muted-foreground">Quoted on</p>
                  <p className="font-medium">
                    {format(new Date(quotation.quoted_at), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
              {quotation.expires_at && (
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {format(new Date(quotation.expires_at), "MMM dd, yyyy")}
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                      <span className="text-orange-600 ml-2">
                        ({daysUntilExpiry} days remaining)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Products Table */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Quoted Products
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  {quotation.quoted_at && (
                    <>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Final Price</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.product_sku}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    {quotation.quoted_at && (
                      <>
                        <TableCell className="text-right">
                          ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {item.discount_percentage}%
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{item.final_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {quotation.quoted_at && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ₹{quotation.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {quotation.discount_percentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({quotation.discount_percentage}%):</span>
                      <span className="font-medium">
                        -₹
                        {(
                          quotation.total_amount - quotation.final_amount
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL AMOUNT:</span>
                    <span className="text-primary">
                      ₹{quotation.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Quote Notes */}
          {quotation.quote_notes && (
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2 flex items-center text-blue-900">
                <FileText className="mr-2 h-4 w-4" />
                Notes from our team:
              </h3>
              <p className="text-blue-800 whitespace-pre-wrap">
                {quotation.quote_notes}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              {/* Show final quote alert if is_final is true */}
              {quotation.is_final && quotation.status === "quoted" && (
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900">Final Quotation</AlertTitle>
                  <AlertDescription className="text-amber-800">
                    This is the final quotation and cannot be revised. Please proceed with finalization or contact us directly for any changes.
                  </AlertDescription>
                </Alert>
              )}

              {(quotation.status === "quoted" || quotation.status === "revised") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Only show Request Revision button if NOT final */}
                    {!quotation.is_final && (
                      <Button
                        variant="outline"
                        onClick={() => setRevisionDialogOpen(true)}
                        className="w-full"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Revision
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="w-full"
                    size="lg"
                  >
                    {finalizing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                    )}
                    Finalize & Order Now
                  </Button>
                </>
              )}

              {quotation.status === "finalized" && (
                <>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Proceed to Checkout
                  </Button>
                </>
              )}

              {quotation.status === "converted_to_order" && (
                <div className="text-center py-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium mb-2">
                      ✅ This quotation has been converted to an order
                    </p>
                    <p className="text-sm text-green-700">
                      Order #ORD-{id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <Button onClick={() => navigate("/orders")} variant="outline">
                    View Order Details
                  </Button>
                </div>
              )}

              {quotation.status === "pending" && (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Waiting for quotation from our team...</p>
                </div>
              )}
            </div>
        </Card>
      </div>
      </main>
      <Footer />

      <RevisionRequestDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        quotationId={id || ""}
        quotationNumber={`QR-${id?.slice(0, 8).toUpperCase()}`}
        quotation={quotation}
        itemCount={items.length}
        onSuccess={fetchQuotation}
      />
    </div>
  );
};

export default QuotationDetail;
