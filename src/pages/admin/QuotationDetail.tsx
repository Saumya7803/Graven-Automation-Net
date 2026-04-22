import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, ArrowLeft, Mail, Phone, Building2, Package, Calendar, User, FileText, Send, History, TrendingUp, AlertCircle, Info } from "lucide-react";
import { QuotationAuditTimeline } from "@/components/admin/QuotationAuditTimeline";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface QuotationRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  company_name: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  message: string;
  status: "pending" | "reviewing" | "quoted" | "closed" | "revision_requested" | "revised" | "finalized" | "converted_to_order";
  admin_notes: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  quoted_at: string | null;
  expires_at: string | null;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  quote_notes: string | null;
  order_id: string | null;
  user_id: string | null;
}

interface QuotationItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price?: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_price?: number;
  subtotal?: number;
  products: {
    price: number;
  };
}

interface ItemPricing {
  id: string;
  unitPrice: number;
  discountPercent: number;
}

interface QuotationRevision {
  id: string;
  revision_number: number;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  revision_notes: string | null;
  created_at: string;
}

interface CustomerQuotation {
  id: string;
  created_at: string;
  status: string;
  final_amount: number;
  discount_percentage: number;
  discount_amount: number;
  quoted_at: string | null;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  quoted: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  revision_requested: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  revised: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  finalized: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  converted_to_order: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [quotation, setQuotation] = useState<QuotationRequest | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"pending" | "reviewing" | "quoted" | "closed" | "revision_requested" | "revised" | "finalized" | "converted_to_order">("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [downloadingAttachment, setDownloadingAttachment] = useState(false);
  
  // Quotation pricing state
  const [itemPricing, setItemPricing] = useState<ItemPricing[]>([]);
  const [overallDiscountType, setOverallDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [overallDiscountValue, setOverallDiscountValue] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [isFinalQuote, setIsFinalQuote] = useState(false);
  
  // History state
  const [revisions, setRevisions] = useState<QuotationRevision[]>([]);
  const [customerHistory, setCustomerHistory] = useState<CustomerQuotation[]>([]);
  
  // Order confirmation dialog state
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchQuotation();
    }
  }, [isAdmin, id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setQuotation(data);
      setStatus(data.status);
      setAdminNotes(data.admin_notes || "");

      // Fetch quotation items
      const { data: itemsData, error: itemsError } = await supabase
        .from("quotation_request_items")
        .select(`
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          discount_percentage,
          products (
            price
          )
        `)
        .eq("quotation_request_id", id);

      if (itemsError) throw itemsError;
      setQuotationItems(itemsData || []);
      
      // Initialize item pricing from products or existing quotation items
      // Priority: existing unit_price > product price > 0
      if (itemsData) {
        const pricing = itemsData.map(item => {
          const unitPrice = item.unit_price && item.unit_price > 0 
            ? item.unit_price 
            : (item.products?.price || 0);
          const discountPercent = item.discount_percentage || 0;
          
          return {
            id: item.id,
            unitPrice,
            discountPercent
          };
        });
        setItemPricing(pricing);
        console.log("Initialized item pricing:", pricing);
      }
      
      // Load existing quote data if already quoted
      if (data.quote_notes) setQuoteNotes(data.quote_notes);
      if (data.discount_percentage) {
        setOverallDiscountType('percentage');
        setOverallDiscountValue(data.discount_percentage);
      } else if (data.discount_amount) {
        setOverallDiscountType('amount');
        setOverallDiscountValue(data.discount_amount);
      }
      
      // Fetch revision history
      const { data: revisionsData, error: revisionsError } = await supabase
        .from("quotation_revisions")
        .select("*")
        .eq("quotation_request_id", id)
        .order("revision_number", { ascending: false });
      
      if (!revisionsError && revisionsData) {
        setRevisions(revisionsData);
      }
      
      // Fetch customer's other quotations
      const { data: customerQuotesData, error: customerQuotesError } = await supabase
        .from("quotation_requests")
        .select("id, created_at, status, final_amount, discount_percentage, discount_amount, quoted_at")
        .eq("customer_email", data.customer_email)
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (!customerQuotesError && customerQuotesData) {
        setCustomerHistory(customerQuotesData);
      }
      
    } catch (error: any) {
      console.error("Error fetching quotation:", error);
      toast.error("Failed to load quotation details");
      navigate("/admin/rfq");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async () => {
    if (!quotation?.attachment_url) return;

    try {
      setDownloadingAttachment(true);
      const { data, error } = await supabase.storage
        .from("rfq-attachments")
        .download(quotation.attachment_url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = quotation.attachment_url.split("/").pop() || "attachment";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download attachment");
    } finally {
      setDownloadingAttachment(false);
    }
  };


  const calculateEstimatedTotal = () => {
    return quotationItems.reduce((total, item) => {
      const price = item.products?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const updateItemPricing = (itemId: string, field: 'unitPrice' | 'discountPercent', value: number) => {
    setItemPricing(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const calculateItemSubtotal = (itemId: string) => {
    const item = quotationItems.find(i => i.id === itemId);
    const pricing = itemPricing.find(p => p.id === itemId);
    if (!item || !pricing) return 0;
    
    const subtotal = pricing.unitPrice * item.quantity;
    const discount = (subtotal * pricing.discountPercent) / 100;
    return subtotal - discount;
  };

  const calculateQuotationTotals = () => {
    const subtotal = quotationItems.reduce((total, item) => {
      const pricing = itemPricing.find(p => p.id === item.id);
      if (!pricing) return total;
      return total + (pricing.unitPrice * item.quantity);
    }, 0);

    const itemDiscounts = quotationItems.reduce((total, item) => {
      const pricing = itemPricing.find(p => p.id === item.id);
      if (!pricing) return total;
      const itemSubtotal = pricing.unitPrice * item.quantity;
      return total + (itemSubtotal * pricing.discountPercent) / 100;
    }, 0);

    const afterItemDiscounts = subtotal - itemDiscounts;
    
    let overallDiscount = 0;
    if (overallDiscountType === 'percentage') {
      overallDiscount = (afterItemDiscounts * overallDiscountValue) / 100;
    } else {
      overallDiscount = overallDiscountValue;
    }

    const finalAmount = afterItemDiscounts - overallDiscount;

    return {
      subtotal,
      itemDiscounts,
      afterItemDiscounts,
      overallDiscount,
      finalAmount: Math.max(0, finalAmount)
    };
  };

  const handleSubmitQuotation = async () => {
    if (!quotation || itemPricing.length === 0) return;

    // Validation
    const hasInvalidPrices = itemPricing.some(p => p.unitPrice <= 0);
    if (hasInvalidPrices) {
      toast.error("All items must have a unit price greater than 0");
      return;
    }

    try {
      setSubmittingQuote(true);
      const totals = calculateQuotationTotals();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // If status is changing from quoted to quoted again, save current pricing as a revision
      if (quotation.quoted_at && quotation.status === 'quoted') {
        const nextRevisionNumber = revisions.length + 1;
        const { error: revisionError } = await supabase
          .from("quotation_revisions")
          .insert({
            quotation_request_id: quotation.id,
            revision_number: nextRevisionNumber,
            total_amount: quotation.total_amount,
            discount_percentage: quotation.discount_percentage,
            discount_amount: quotation.discount_amount,
            final_amount: quotation.final_amount,
            revision_notes: "Previous quotation before update"
          });
        
        if (revisionError) console.error("Error creating revision:", revisionError);
      }

      // Update each quotation item with pricing
      for (const item of quotationItems) {
        const pricing = itemPricing.find(p => p.id === item.id);
        if (!pricing) {
          console.error("Missing pricing for item:", item.id);
          continue;
        }

        const itemSubtotal = pricing.unitPrice * item.quantity;
        const itemDiscountAmount = (itemSubtotal * pricing.discountPercent) / 100;
        const itemFinalPrice = itemSubtotal - itemDiscountAmount;

        console.log("Saving item pricing:", {
          itemId: item.id,
          productName: item.product_name,
          unitPrice: pricing.unitPrice,
          discountPercent: pricing.discountPercent,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          discountAmount: itemDiscountAmount,
          finalPrice: itemFinalPrice
        });

        const { error: itemError } = await supabase
          .from("quotation_request_items")
          .update({
            unit_price: pricing.unitPrice,
            discount_percentage: pricing.discountPercent,
            discount_amount: itemDiscountAmount,
            subtotal: itemSubtotal,
            final_price: itemFinalPrice
          })
          .eq("id", item.id);

        if (itemError) {
          console.error("Error saving item pricing:", itemError);
          throw itemError;
        }
      }

      // Update quotation request with totals and status
      const { error: quotationError } = await supabase
        .from("quotation_requests")
        .update({
          total_amount: totals.subtotal,
          discount_percentage: overallDiscountType === 'percentage' ? overallDiscountValue : 0,
          discount_amount: totals.overallDiscount,
          final_amount: totals.finalAmount,
          quote_notes: quoteNotes,
          quoted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'quoted',
          is_final: isFinalQuote
        })
        .eq("id", quotation.id);

      if (quotationError) throw quotationError;

      // Trigger email notification to customer
      await supabase.functions.invoke('send-quotation-email', {
        body: { quotationId: quotation.id }
      });

      toast.success("Quotation submitted successfully and customer has been notified");

      fetchQuotation();
    } catch (error: any) {
      console.error("Error submitting quotation:", error);
      toast.error("Failed to submit quotation");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSave = async () => {
    if (!quotation) return;

    try {
      setSaving(true);
      const previousStatus = quotation.status;
      
      // VALIDATION: Only validate pricing when changing TO 'quoted' or 'finalized' FROM a non-priced status
      // This allows admins to revert from 'quoted'/'finalized' back to 'pending' to fix pricing issues
      const needsPricingValidation = (status === 'quoted' || status === 'finalized') && 
                                       previousStatus !== 'quoted' && 
                                       previousStatus !== 'finalized';
      
      if (needsPricingValidation) {
        const { data: items, error: itemsError } = await supabase
          .from("quotation_request_items")
          .select("unit_price, final_price")
          .eq("quotation_request_id", quotation.id);
          
        if (itemsError) throw itemsError;
        
        const hasPricingIssue = items?.some(item => 
          !item.unit_price || item.unit_price <= 0 || !item.final_price || item.final_price <= 0
        );
        
        if (hasPricingIssue) {
          toast.error("Please use 'Prepare Quotation' section and click 'Submit Quotation' to set pricing before changing status to 'quoted' or 'finalized'");
          setSaving(false);
          return;
        }
      }
      
      const { error } = await supabase
        .from("quotation_requests")
        .update({
          status,
          admin_notes: adminNotes,
        })
        .eq("id", quotation.id);

      if (error) throw error;

      // Handle converting quotation to order
      if (status !== previousStatus && status === 'converted_to_order' && !quotation.order_id) {
        try {
          console.log("🔄 Creating order from quotation...");
          
          if (!quotation.user_id) {
            throw new Error('Quotation must have a user_id to create an order');
          }
          
          // Generate order number
          const { data: orderNumberData, error: orderNumberError } = await supabase.rpc('generate_order_number');
          if (orderNumberError) throw orderNumberError;

          // Get customer data
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', quotation.user_id)
            .single();

          if (customerError || !customer) {
            throw new Error('Customer not found');
          }

          // Calculate totals
          const quotationSubtotal = Number(quotation.total_amount) || 0;
          const taxAmount = quotationSubtotal * 0.18; // 18% GST
          const shippingCost = 500;
          const discount = Number(quotation.discount_amount) || 0;
          const orderTotal = quotationSubtotal + taxAmount + shippingCost - discount;

          // Create order
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumberData,
              customer_id: customer.id,
              user_id: quotation.user_id,
              subtotal: quotationSubtotal,
              tax_amount: taxAmount,
              shipping_cost: shippingCost,
              total_amount: orderTotal,
              notes: `Created from quotation ${quotation.id.substring(0, 8)}`,
              shipping_address: customer.shipping_address || customer.billing_address,
              billing_address: customer.billing_address,
              payment_method: 'pending',
              status: 'confirmed',
              payment_status: 'pending'
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Create order items from quotation items
          const orderItems = quotationItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            quantity: item.quantity,
            unit_price: item.final_price || item.unit_price,
            subtotal: (item.final_price || item.unit_price) * item.quantity,
          }));

          const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
          if (itemsError) throw itemsError;

          // Update quotation with order_id
          await supabase
            .from('quotation_requests')
            .update({ order_id: order.id })
            .eq('id', quotation.id);

          // Send order confirmation email
          try {
            await supabase.functions.invoke('send-order-confirmation', {
              body: { orderId: order.id }
            });
          } catch (emailError) {
            console.error('Order confirmation email failed:', emailError);
          }

          toast.success(`Order created successfully: ${orderNumberData}`, {
            action: {
              label: "View Order →",
              onClick: () => navigate(`/admin/orders/${order.id}`)
            },
            duration: 10000
          });

          console.log("✅ Order created:", order.id);
        } catch (error: any) {
          console.error('Error creating order:', error);
          toast.error(`Failed to create order: ${error.message}`);
          setSaving(false);
          return;
        }
      }
      
      // Send quotation email if status changed to 'quoted'
      else if (status !== previousStatus && status === 'quoted') {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-quotation-email', {
            body: { quotationId: quotation.id }
          });
          
          if (emailError) {
            console.error("Quotation email failed:", emailError);
            toast("Status updated but quotation email failed to send");
          } else {
            toast.success("Status updated to Quoted and customer has been notified");
          }
        } catch (emailError) {
          console.error("Quotation email error:", emailError);
          toast("Status updated but quotation email failed to send");
        }
      }
      // Send email notification for ALL other status changes
      else if (status !== previousStatus) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-quotation-status-email', {
            body: { 
              quotationId: quotation.id, 
              status,
              previousStatus 
            }
          });
          
          if (emailError) {
            console.error("Email notification failed:", emailError);
            toast("Quotation updated but email notification failed");
          } else {
            toast.success("Quotation updated and customer notified");
          }
        } catch (emailError) {
          console.error("Email notification error:", emailError);
          toast("Quotation updated but email notification failed");
        }
      } else {
        toast.success("Quotation request updated successfully");
      }
      
      fetchQuotation();
    } catch (error: any) {
      console.error("Error updating quotation:", error);
      toast.error("Failed to update quotation request");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    // Check if status is being changed to 'converted_to_order'
    if (status === 'converted_to_order' && quotation?.status !== 'converted_to_order') {
      // Show confirmation dialog first
      setShowOrderConfirmation(true);
    } else {
      // For all other status changes, proceed normally
      handleSave();
    }
  };

  const handleConfirmOrderCreation = () => {
    setShowOrderConfirmation(false);
    handleSave(); // Now proceed with actual order creation
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin || !quotation) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/rfq")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to RFQ List
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quotation Request Details</h1>
              <p className="text-muted-foreground">
                Request ID: {quotation.id.substring(0, 8)}...
              </p>
            </div>
            <Badge className={statusColors[quotation.status]} variant="outline">
              {quotation.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{quotation.customer_name}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{quotation.customer_email}</p>
                  </div>
                </div>
                {quotation.customer_phone && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{quotation.customer_phone}</p>
                      </div>
                    </div>
                  </>
                )}
                {quotation.company_name && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{quotation.company_name}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products Requested ({quotationItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotationItems.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotationItems.map((item) => {
                          const unitPrice = item.unit_price || item.products?.price || 0;
                          const subtotal = unitPrice * item.quantity;
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.product_name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {item.product_sku}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Estimated Total Value
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{calculateEstimatedTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No specific products selected - General inquiry
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{quotation.message}</p>
              </CardContent>
            </Card>

            {quotation.attachment_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Attachment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={handleDownloadAttachment}
                    disabled={downloadingAttachment}
                    className="w-full"
                  >
                    {downloadingAttachment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Attachment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(quotation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(quotation.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="space-y-6">
            {/* Prepare Quotation Section - Only show for pending/revision_requested */}
            {(quotation.status === 'pending' || quotation.status === 'revision_requested') && quotationItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prepare Quotation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Item Pricing */}
                  <div className="space-y-4">
                    <Label>Item Pricing & Discounts</Label>
                    {quotationItems.map((item) => {
                      const pricing = itemPricing.find(p => p.id === item.id);
                      if (!pricing) return null;
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Unit Price (₹)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={pricing.unitPrice}
                                onChange={(e) => updateItemPricing(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discount (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={pricing.discountPercent}
                                onChange={(e) => updateItemPricing(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="font-medium">
                              Total: ₹{calculateItemSubtotal(item.id).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Overall Discount */}
                  <div className="space-y-3">
                    <Label>Overall Discount</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={overallDiscountType} onValueChange={(v) => setOverallDiscountType(v as 'percentage' | 'amount')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="amount">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={overallDiscountValue}
                        onChange={(e) => setOverallDiscountValue(parseFloat(e.target.value) || 0)}
                        placeholder={overallDiscountType === 'percentage' ? '0-100' : 'Amount'}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Quote Notes */}
                  <div className="space-y-2">
                    <Label>Quote Notes (for customer)</Label>
                    <Textarea
                      placeholder="Add any special terms, conditions, or notes for the customer..."
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Expiry Days */}
                  <div className="space-y-2">
                    <Label>Quote Valid For (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                    />
                  </div>

                  {/* Mark as Final Quote */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <Checkbox 
                      id="is-final" 
                      checked={isFinalQuote}
                      onCheckedChange={(checked) => setIsFinalQuote(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="is-final"
                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mark as Final Quote
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        When checked, customer cannot request revisions for this quotation
                      </p>
                    </div>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>

                  <Separator />

                  {/* Totals Summary */}
                  <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{calculateQuotationTotals().subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {calculateQuotationTotals().itemDiscounts > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Item Discounts:</span>
                        <span>-₹{calculateQuotationTotals().itemDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {calculateQuotationTotals().overallDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Overall Discount:</span>
                        <span>-₹{calculateQuotationTotals().overallDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Final Amount:</span>
                      <span className="text-primary">₹{calculateQuotationTotals().finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitQuotation}
                    disabled={submittingQuote}
                    className="w-full"
                    size="lg"
                  >
                    {submittingQuote ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Quotation...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Quotation to Customer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Submitted Quotation Details - Show when quoted */}
            {quotation.quoted_at && quotationItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quotation Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Item Breakdown */}
                  <div className="space-y-3">
                    <Label>Quoted Items</Label>
                    {quotationItems.map((item) => {
                      const unitPrice = item.unit_price || item.products?.price || 0;
                      const itemSubtotal = unitPrice * item.quantity;
                      const itemDiscount = item.discount_percentage ? (itemSubtotal * item.discount_percentage) / 100 : 0;
                      const itemFinalPrice = itemSubtotal - itemDiscount;
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Unit Price:</span>
                              <span className="ml-2 font-medium">₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qty:</span>
                              <span className="ml-2 font-medium">{item.quantity}</span>
                            </div>
                            {item.discount_percentage > 0 && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Discount:</span>
                                  <span className="ml-2 font-medium text-green-600">{item.discount_percentage}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Saved:</span>
                                  <span className="ml-2 font-medium text-green-600">₹{itemDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Item Total:</span>
                            <span className="font-bold">₹{itemFinalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">₹{quotation.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {quotation.discount_percentage > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({quotation.discount_percentage}%):</span>
                        <span>-₹{quotation.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {quotation.discount_percentage === 0 && quotation.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-₹{quotation.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Final Amount:</span>
                      <span className="text-primary">₹{quotation.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    {quotation.quote_notes && (
                      <div>
                        <Label className="text-xs">Quote Notes</Label>
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap bg-muted/30 p-2 rounded">{quotation.quote_notes}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Quoted Date</Label>
                        <p className="text-muted-foreground">{new Date(quotation.quoted_at).toLocaleDateString()}</p>
                      </div>
                      {quotation.expires_at && (
                        <div>
                          <Label className="text-xs">Expires On</Label>
                          <p className="text-muted-foreground">{new Date(quotation.expires_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revision History */}
            {revisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Revision History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {revisions.map((revision) => (
                      <AccordionItem key={revision.id} value={revision.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-left">
                            <span className="font-medium">Revision #{revision.revision_number}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(revision.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total:</span>
                              <span>₹{revision.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {revision.discount_percentage > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({revision.discount_percentage}%):</span>
                                <span>-₹{revision.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {revision.discount_percentage === 0 && revision.discount_amount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>-₹{revision.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Final Amount:</span>
                              <span>₹{revision.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {revision.revision_notes && (
                              <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                                {revision.revision_notes}
                              </p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Customer Quotation History */}
            {customerHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Customer's Previous Quotations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerHistory.map((quote) => (
                      <div 
                        key={quote.id} 
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/rfq/${quote.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(quote.created_at).toLocaleDateString()}
                            </p>
                            <Badge 
                              className={`${statusColors[quote.status as keyof typeof statusColors] || 'bg-gray-500/10'} text-xs mt-1`}
                              variant="outline"
                            >
                              {quote.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{quote.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            {(quote.discount_percentage > 0 || quote.discount_amount > 0) && (
                              <p className="text-xs text-green-600">
                                {quote.discount_percentage > 0 
                                  ? `${quote.discount_percentage}% off` 
                                  : `${formatCurrency(quote.discount_amount)} off`}
                              </p>
                            )}
                          </div>
                        </div>
                        {quote.quoted_at && (
                          <p className="text-xs text-muted-foreground">
                            Quoted: {new Date(quote.quoted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comprehensive Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Complete Change History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed audit trail of all changes made to this quotation
                </p>
              </CardHeader>
              <CardContent>
                <QuotationAuditTimeline quotationId={quotation.id} />
              </CardContent>
            </Card>

            {/* Status Update Card */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Status</label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Email Notifications:</p>
                          <ul className="text-xs space-y-1.5 text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Pending</strong> - Customer notified request received</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Reviewing</strong> - Customer notified under review</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Quoted</strong> - Full quote with detailed pricing sent</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Closed</strong> - Customer notified request closed</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Revised</strong> - Customer notified of quotation update</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Finalized</strong> - Customer notified ready for checkout</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span><strong>Converted to Order</strong> - Customer notified of conversion</span>
                            </li>
                          </ul>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <Select
                    value={status} 
                    onValueChange={(value) => setStatus(value as "pending" | "reviewing" | "quoted" | "closed" | "revision_requested" | "revised" | "finalized" | "converted_to_order")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="revised">Revised</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                      <SelectItem value="converted_to_order">Converted to Order</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes about this quotation request..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={handleSaveClick}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Order Conversion Confirmation Dialog */}
      <AlertDialog open={showOrderConfirmation} onOpenChange={setShowOrderConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert Quotation to Order?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to convert this quotation into an order. This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create a new order with status "Confirmed"</li>
                <li>Send order confirmation email to customer</li>
                <li>Mark this quotation as "Converted to Order"</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {quotation && (
            <div className="space-y-2 py-4 border-t border-b">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{quotation.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Amount:</span>
                <span className="font-medium">{formatCurrency(quotation.final_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{quotationItems.length}</span>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOrderCreation}>
              Create Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationDetail;
