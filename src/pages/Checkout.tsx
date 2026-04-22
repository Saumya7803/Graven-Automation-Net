import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationIdFromUrl = searchParams.get('quotation_id');
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [quotationItems, setQuotationItems] = useState<any[]>([]);
  const [isQuotationMode, setIsQuotationMode] = useState(false);
  const [quotationData, setQuotationData] = useState<any>(null);
  const [taxRate, setTaxRate] = useState(0.18); // Default 18% GST
  const { isLoaded: isMapsLoaded, error: mapsError } = useGoogleMaps();
  const [billingValidationResult, setBillingValidationResult] = useState<any>(null);
  const [shippingValidationResult, setShippingValidationResult] = useState<any>(null);
  const [isValidatingBilling, setIsValidatingBilling] = useState(false);
  const [isValidatingShipping, setIsValidatingShipping] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [policiesAccepted, setPoliciesAccepted] = useState({
    shippingPolicy: false,
    returnPolicy: false,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    companyName: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
    sameAsBilling: true,
    notes: "",
    paymentMethod: "",
  });

  // Calculate totals based on mode - reactive to state changes
  const subtotal = useMemo(() => {
    console.log("=== SUBTOTAL CALCULATION ===");
    console.log("isQuotationMode:", isQuotationMode);
    console.log("quotationData:", quotationData);
    console.log("quotationData type:", typeof quotationData);
    console.log("total_amount:", quotationData?.total_amount);
    console.log("total_amount type:", typeof quotationData?.total_amount);
    console.log("cartItems:", cartItems);
    
    if (isQuotationMode) {
      // More robust check for data availability
      if (!quotationData || quotationData.total_amount === null || quotationData.total_amount === undefined) {
        console.log("⏳ Quotation data not ready yet - quotationData:", !!quotationData, "total_amount:", quotationData?.total_amount);
        return 0;
      }
      
      // Always use the quotation's total_amount since items don't have individual pricing
      const quotationTotal = Number(quotationData.total_amount) || 0;
      console.log("✓ Using quotation total_amount as subtotal:", quotationTotal);
      console.log("  Raw value:", quotationData.total_amount);
      console.log("  After Number():", quotationTotal);
      return quotationTotal;
    }
    
    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    console.log("✓ Using cart total:", cartTotal);
    return cartTotal;
  }, [isQuotationMode, quotationData, cartItems]);

  const tax = useMemo(() => {
    console.log("=== TAX CALCULATION ===");
    console.log("subtotal:", subtotal);
    console.log("taxRate:", taxRate);
    console.log("isQuotationMode:", isQuotationMode);
    
    // ALWAYS calculate tax as a percentage of subtotal (18% GST)
    // For quotations: tax is calculated on the subtotal (total_amount)
    // For cart: tax is calculated on cart subtotal
    const calculatedTax = subtotal * taxRate;
    console.log(`✓ Calculated tax (${(taxRate * 100).toFixed(0)}%):`, calculatedTax);
    return calculatedTax;
  }, [subtotal, taxRate]);

  // Calculate shipping dynamically from product shipping costs
  const shipping = useMemo(() => {
    if (isQuotationMode) {
      // For quotations, sum shipping from quotation items (with product shipping_cost)
      return quotationItems.reduce((sum, item) => {
        const itemShipping = Number(item.product_shipping_cost) || 0;
        return sum + (itemShipping * item.quantity);
      }, 0);
    }
    
    // For cart items, sum up shipping costs
    return cartItems.reduce((sum, item) => {
      const itemShipping = Number(item.product?.shipping_cost) || 0;
      return sum + (itemShipping * item.quantity);
    }, 0);
  }, [isQuotationMode, quotationItems, cartItems]);

  const total = useMemo(() => {
    console.log("=== TOTAL CALCULATION ===");
    console.log("isQuotationMode:", isQuotationMode);
    console.log("subtotal:", subtotal);
    console.log("tax:", tax);
    console.log("shipping:", shipping);
    console.log("quotationData:", quotationData);
    
    // Always calculate: subtotal + tax + shipping - discount
    let calculatedTotal = subtotal + tax + shipping;
    
    // Apply discount if in quotation mode
    if (isQuotationMode && quotationData?.discount_amount) {
      const discount = Number(quotationData.discount_amount) || 0;
      calculatedTotal = calculatedTotal - discount;
      console.log("✓ Applied discount:", discount);
    }
    
    console.log("✓ Final total:", calculatedTotal);
    return calculatedTotal;
  }, [isQuotationMode, quotationData, subtotal, tax, shipping]);

  // Load existing customer profile to pre-fill form
  useEffect(() => {
    if (!user) return;
    
    const loadCustomerProfile = async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (customer) {
        const billing = customer.billing_address as any;
        const shipping = customer.shipping_address as any;
        
        setFormData(prev => ({
          ...prev,
          fullName: customer.full_name || prev.fullName,
          email: customer.email || user.email || prev.email,
          phone: customer.phone || prev.phone,
          companyName: customer.company_name || prev.companyName,
          billingStreet: billing?.street || prev.billingStreet,
          billingCity: billing?.city || prev.billingCity,
          billingState: billing?.state || prev.billingState,
          billingZip: billing?.zip || prev.billingZip,
          billingCountry: billing?.country || prev.billingCountry,
          shippingStreet: shipping?.street || prev.shippingStreet,
          shippingCity: shipping?.city || prev.shippingCity,
          shippingState: shipping?.state || prev.shippingState,
          shippingZip: shipping?.zip || prev.shippingZip,
          shippingCountry: shipping?.country || prev.shippingCountry,
        }));
      }
    };
    
    loadCustomerProfile();
  }, [user]);

  // Detect quotation mode from URL params using React Router
  useEffect(() => {
    if (quotationIdFromUrl) {
      console.log("🔍 Detected quotation_id from URL:", quotationIdFromUrl);
      setQuotationId(quotationIdFromUrl);
      setIsQuotationMode(true);
      fetchQuotationData(quotationIdFromUrl);
    } else {
      console.log("ℹ️ No quotation_id in URL - using cart mode");
      setIsQuotationMode(false);
      setQuotationData(null);
    }
  }, [quotationIdFromUrl]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchQuotationData = async (qId: string) => {
    try {
      // Fetch quotation details
      const { data: quotation, error: quotationError } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("id", qId)
        .eq("status", "finalized")
        .single();

      if (quotationError) throw quotationError;
      
      console.log("✓ Loaded quotation data:", quotation);
      console.log("  - ID:", quotation?.id);
      console.log("  - total_amount:", quotation?.total_amount);
      console.log("  - total_amount type:", typeof quotation?.total_amount);
      console.log("  - discount_amount:", quotation?.discount_amount);
      console.log("  - discount_amount type:", typeof quotation?.discount_amount);
      console.log("🔄 Setting quotationData state...");
      setQuotationData(quotation);

      // Fetch quotation items with product shipping_cost
      const { data: items, error: itemsError } = await supabase
        .from("quotation_request_items")
        .select(`
          *,
          product:products(shipping_cost)
        `)
        .eq("quotation_request_id", qId);

      if (itemsError) throw itemsError;

      // Map items to include shipping_cost at top level for easy access
      const itemsWithShipping = items?.map(item => ({
        ...item,
        product_shipping_cost: item.product?.shipping_cost || 0
      })) || [];

      console.log("✓ Loaded quotation items:", itemsWithShipping);
      setQuotationItems(itemsWithShipping);
      
      // Pre-fill customer info from quotation
      if (quotation) {
        setFormData(prev => ({
          ...prev,
          fullName: quotation.customer_name || "",
          email: quotation.customer_email || "",
          phone: quotation.customer_phone || "",
          companyName: quotation.company_name || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching quotation:", error);
      toast.error("Failed to load quotation data");
      navigate("/my-quotations");
    }
  };

  // Fetch active payment gateways and tax settings
  useEffect(() => {
    const fetchGateways = async () => {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (!error && data) {
        setPaymentGateways(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, paymentMethod: data[0].gateway_type }));
        }
      }
    };

    const fetchTaxSettings = async () => {
      const { data: taxSettings } = await supabase
        .from('store_settings')
        .select('setting_value')
        .eq('setting_key', 'tax_settings')
        .maybeSingle();

      if (taxSettings?.setting_value && typeof taxSettings.setting_value === 'object' && 'taxRate' in taxSettings.setting_value) {
        const rate = Number(taxSettings.setting_value.taxRate) / 100;
        console.log("✓ Loaded tax rate from settings:", rate);
        setTaxRate(rate);
      }
    };

    fetchGateways();
    fetchTaxSettings();
  }, []);

  // Check payment status from database (for UPI QR payments that complete outside browser)
  const checkPaymentStatus = async (orderId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status, status')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error("Error checking payment status:", error);
        return false;
      }
      
      console.log("Payment status check:", data);
      return data?.payment_status === 'paid';
    } catch (error) {
      console.error("Error in checkPaymentStatus:", error);
      return false;
    }
  };

  const handleRazorpayPayment = async (orderId: string) => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    try {
      // Create Razorpay order via edge function
      const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke(
        "razorpay-create-order",
        {
          body: {
            amount: total,
            currency: "INR",
            orderId,
          },
        }
      );

      if (razorpayError) throw razorpayError;

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "Schneidervfd.com",
        description: `Order ${orderId}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment via edge function
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "razorpay-verify-payment",
              {
                body: {
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              }
            );

            if (verifyError) throw verifyError;

            // Only clear cart if not in quotation mode
            if (!isQuotationMode) {
              await clearCart();
            }
            toast.success("Payment successful!");
            navigate(`/order-confirmation/${orderId}`);
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async function() {
            console.log("Razorpay modal dismissed, checking payment status...");
            // Wait a moment for webhook to process (if payment completed via UPI)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const isPaid = await checkPaymentStatus(orderId);
            if (isPaid) {
              // Payment completed (likely via UPI QR code)
              if (!isQuotationMode) {
                await clearCart();
              }
              toast.success("Payment successful!");
              navigate(`/order-confirmation/${orderId}`);
            } else {
              toast.info("Payment not completed. You can complete it from your orders page.", {
                duration: 5000
              });
              navigate(`/orders`);
            }
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#009530",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const validateAddress = async (addressData: any, type: 'billing' | 'shipping') => {
    const setValidating = type === 'billing' ? setIsValidatingBilling : setIsValidatingShipping;
    const setResult = type === 'billing' ? setBillingValidationResult : setShippingValidationResult;
    
    setValidating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'validate-address',
        { body: addressData }
      );

      if (error) throw error;
      setResult(result);
    } catch (error) {
      console.error("Address validation error:", error);
      // Mark as "unavailable" but don't block - user can confirm manually
      setResult({
        isValid: true,
        isDeliverable: false,
        confidence: 'low',
        serviceUnavailable: true,
        message: 'We couldn\'t verify your address automatically. Please confirm it\'s correct.'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleBillingPlaceSelected = async (place: any) => {
    setFormData(prev => ({
      ...prev,
      billingStreet: place.street,
      billingCity: place.city,
      billingState: place.state,
      billingZip: place.zip,
      billingCountry: place.country,
    }));
    
    await validateAddress(place, 'billing');
    toast.success("Billing address auto-filled!");
  };

  const handleShippingPlaceSelected = async (place: any) => {
    setFormData(prev => ({
      ...prev,
      shippingStreet: place.street,
      shippingCity: place.city,
      shippingState: place.state,
      shippingZip: place.zip,
      shippingCountry: place.country,
    }));
    
    await validateAddress(place, 'shipping');
    toast.success("Shipping address auto-filled!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    if (!isQuotationMode && cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (isQuotationMode && quotationItems.length === 0) {
      toast.error("No items found in quotation");
      return;
    }

    if (!policiesAccepted.shippingPolicy || !policiesAccepted.returnPolicy) {
      toast.error("Please accept both the Shipping Policy and Return Policy to continue", {
        duration: 5000
      });
      return;
    }

    // Validate billing address if not already done
    if (!billingValidationResult) {
      await validateAddress({
        street: formData.billingStreet,
        city: formData.billingCity,
        state: formData.billingState,
        zip: formData.billingZip,
        country: formData.billingCountry,
      }, 'billing');
    }
    
    // Validate shipping address (if different) if not already done
    if (!formData.sameAsBilling && !shippingValidationResult) {
      await validateAddress({
        street: formData.shippingStreet,
        city: formData.shippingCity,
        state: formData.shippingState,
        zip: formData.shippingZip,
        country: formData.shippingCountry,
      }, 'shipping');
    }
    
    // Check if validation service was unavailable and user hasn't confirmed
    const billingNeedsConfirmation = billingValidationResult?.serviceUnavailable && !addressConfirmed;
    const shippingNeedsConfirmation = !formData.sameAsBilling && shippingValidationResult?.serviceUnavailable && !addressConfirmed;
    
    if (billingNeedsConfirmation || shippingNeedsConfirmation) {
      toast.error("Please confirm your address is correct by checking the confirmation box", {
        duration: 5000
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get or create customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      let customerId = customer?.id;

      const billingAddress = {
        street: formData.billingStreet,
        city: formData.billingCity,
        state: formData.billingState,
        zip: formData.billingZip,
        country: formData.billingCountry,
      };
      
      const shippingAddress = formData.sameAsBilling
        ? billingAddress
        : {
            street: formData.shippingStreet,
            city: formData.shippingCity,
            state: formData.shippingState,
            zip: formData.shippingZip,
            country: formData.shippingCountry,
          };

      if (customer) {
        // Update existing customer with latest form data
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.companyName,
            billing_address: billingAddress,
            shipping_address: shippingAddress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id);

        if (updateError) throw updateError;
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from("customers")
          .insert({
            user_id: user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            company_name: formData.companyName,
            billing_address: billingAddress,
            shipping_address: shippingAddress,
          })
          .select()
          .single();

        if (createError) throw createError;
        customerId = newCustomer.id;
      }

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase.rpc(
        "generate_order_number"
      );
      if (orderNumberError) throw orderNumberError;

      // Get UTM data from sessionStorage
      const utmDataStr = sessionStorage.getItem('utm_data');
      const utmData = utmDataStr ? JSON.parse(utmDataStr) : { utm_source: '', utm_medium: '', utm_campaign: '' };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumberData,
          customer_id: customerId,
          user_id: user.id,
          subtotal: isQuotationMode && quotationData?.total_amount ? quotationData.total_amount : subtotal,
          tax_amount: isQuotationMode && quotationData?.total_amount ? 0 : tax,
          shipping_cost: shipping,
          total_amount: total,
          notes: formData.notes,
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign,
          shipping_address: formData.sameAsBilling
            ? {
                street: formData.billingStreet,
                city: formData.billingCity,
                state: formData.billingState,
                zip: formData.billingZip,
                country: formData.billingCountry,
              }
            : {
                street: formData.shippingStreet,
                city: formData.shippingCity,
                state: formData.shippingState,
                zip: formData.shippingZip,
                country: formData.shippingCountry,
              },
          billing_address: {
            street: formData.billingStreet,
            city: formData.billingCity,
            state: formData.billingState,
            zip: formData.billingZip,
            country: formData.billingCountry,
          },
          payment_method: formData.paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items based on mode
      const orderItems = isQuotationMode
        ? quotationItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.final_price * item.quantity,
          }))
        : cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product.name,
            product_sku: item.product.sku,
            quantity: item.quantity,
            unit_price: item.product.price,
            subtotal: item.product.price * item.quantity,
          }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // If this is from a quotation, update quotation status and link order
      if (isQuotationMode && quotationId) {
        await supabase
          .from("quotation_requests")
          .update({ 
            status: "converted_to_order",
            order_id: order.id 
          })
          .eq("id", quotationId);
      }

      // Send order confirmation email (for non-Razorpay orders)
      if (formData.paymentMethod !== "razorpay") {
        try {
          await supabase.functions.invoke("send-order-confirmation", {
            body: { orderId: order.id },
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }
      }

      // Handle Razorpay payment
      if (formData.paymentMethod === "razorpay") {
        setIsLoading(false);
        await handleRazorpayPayment(order.id);
        return;
      }

      // Clear cart and redirect to confirmation page (non-Razorpay)
      // Only clear cart if not in quotation mode
      if (!isQuotationMode) {
        await clearCart();
      }
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!quotationData && isQuotationMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Loading quotation data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Please sign in to continue with checkout.</p>
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {mapsError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Address autocomplete unavailable</p>
                <p className="text-xs mt-1">You can still enter addresses manually.</p>
              </div>
            </div>
          </div>
        )}

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Please review our{" "}
            <a
              href="/shipping-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-blue-700"
            >
              Shipping Policy
            </a>
            {" "}and{" "}
            <a
              href="/return-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-blue-700"
            >
              Return Policy
            </a>
            {" "}before placing your order. All sales are final with limited return eligibility.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="billingStreet">Street Address *</Label>
                  {isMapsLoaded ? (
                    <AutocompleteInput
                      value={formData.billingStreet}
                      onChange={(value) => setFormData({ ...formData, billingStreet: value })}
                      onPlaceSelected={handleBillingPlaceSelected}
                      placeholder="Start typing your billing address..."
                      disabled={isLoading}
                      countryRestriction="in"
                    />
                  ) : !mapsError ? (
                    <div className="relative">
                      <Skeleton className="h-10 w-full" />
                      <div className="absolute inset-0 flex items-center px-3 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading address autocomplete...</span>
                      </div>
                    </div>
                  ) : (
                    <Input
                      id="billingStreet"
                      required
                      placeholder="Enter address manually"
                      value={formData.billingStreet}
                      onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                    />
                  )}
                  {isValidatingBilling && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Validating...</span>
                    </div>
                  )}
                  {billingValidationResult && !isValidatingBilling && (
                    <div className={`mt-2 flex items-center gap-2 text-sm ${
                      billingValidationResult.isDeliverable && !billingValidationResult.serviceUnavailable
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}>
                      {billingValidationResult.isDeliverable && !billingValidationResult.serviceUnavailable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Address verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>{billingValidationResult.message}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City *</Label>
                    <Input
                      id="billingCity"
                      required
                      value={formData.billingCity}
                      onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingState">State/Province *</Label>
                    <Input
                      id="billingState"
                      required
                      value={formData.billingState}
                      onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingZip">ZIP/Postal Code *</Label>
                    <Input
                      id="billingZip"
                      required
                      value={formData.billingZip}
                      onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingCountry">Country *</Label>
                    <Input
                      id="billingCountry"
                      required
                      value={formData.billingCountry}
                      onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, sameAsBilling: checked as boolean })
                    }
                  />
                  <Label htmlFor="sameAsBilling" className="cursor-pointer">
                    Same as billing address
                  </Label>
                </div>

                {!formData.sameAsBilling && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="shippingStreet">Street Address *</Label>
                      {isMapsLoaded ? (
                        <AutocompleteInput
                          value={formData.shippingStreet}
                          onChange={(value) => setFormData({ ...formData, shippingStreet: value })}
                          onPlaceSelected={handleShippingPlaceSelected}
                          placeholder="Start typing your shipping address..."
                          disabled={isLoading}
                          countryRestriction="in"
                        />
                      ) : !mapsError ? (
                        <div className="relative">
                          <Skeleton className="h-10 w-full" />
                          <div className="absolute inset-0 flex items-center px-3 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Loading address autocomplete...</span>
                          </div>
                        </div>
                      ) : (
                        <Input
                          id="shippingStreet"
                          required
                          placeholder="Enter address manually"
                          value={formData.shippingStreet}
                          onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                        />
                      )}
                      {isValidatingShipping && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Validating...</span>
                        </div>
                      )}
                      {shippingValidationResult && !isValidatingShipping && (
                        <div className={`mt-2 flex items-center gap-2 text-sm ${
                          shippingValidationResult.isDeliverable && !shippingValidationResult.serviceUnavailable
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}>
                          {shippingValidationResult.isDeliverable && !shippingValidationResult.serviceUnavailable ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Address verified</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              <span>{shippingValidationResult.message}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shippingCity">City *</Label>
                        <Input
                          id="shippingCity"
                          required
                          value={formData.shippingCity}
                          onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingState">State/Province *</Label>
                        <Input
                          id="shippingState"
                          required
                          value={formData.shippingState}
                          onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingZip">ZIP/Postal Code *</Label>
                        <Input
                          id="shippingZip"
                          required
                          value={formData.shippingZip}
                          onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingCountry">Country *</Label>
                        <Input
                          id="shippingCountry"
                          required
                          value={formData.shippingCountry}
                          onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Confirmation - shown when validation is unavailable */}
            {(billingValidationResult?.serviceUnavailable || 
              (!formData.sameAsBilling && shippingValidationResult?.serviceUnavailable)) && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-3">
                    <p>
                      We couldn't automatically verify your address. This is usually due to a temporary service issue.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="addressConfirmed"
                        checked={addressConfirmed}
                        onCheckedChange={(checked) => setAddressConfirmed(checked as boolean)}
                      />
                      <Label htmlFor="addressConfirmed" className="cursor-pointer text-amber-800 font-medium">
                        I confirm my address is correct and deliverable
                      </Label>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Special instructions or notes about your order..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            {paymentGateways.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                        <RadioGroupItem value={gateway.gateway_type} id={gateway.gateway_type} />
                        <Label htmlFor={gateway.gateway_type} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <div>
                              <div className="font-semibold">{gateway.display_name}</div>
                              {gateway.description && (
                                <div className="text-xs text-muted-foreground">{gateway.description}</div>
                              )}
                              {gateway.is_test_mode && (
                                <span className="text-xs text-amber-600">(Test Mode)</span>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Policy Acceptance */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Required: Policy Acknowledgment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="shippingPolicyAccept"
                    checked={policiesAccepted.shippingPolicy}
                    onCheckedChange={(checked) =>
                      setPoliciesAccepted({ ...policiesAccepted, shippingPolicy: checked as boolean })
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="shippingPolicyAccept" className="cursor-pointer text-sm font-normal">
                    I have read and agree to the{" "}
                    <a
                      href="/shipping-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-700"
                    >
                      Shipping Policy
                    </a>
                    , including dispatch timelines, delivery terms, and inspection requirements.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="returnPolicyAccept"
                    checked={policiesAccepted.returnPolicy}
                    onCheckedChange={(checked) =>
                      setPoliciesAccepted({ ...policiesAccepted, returnPolicy: checked as boolean })
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="returnPolicyAccept" className="cursor-pointer text-sm font-normal">
                    I have read and agree to the{" "}
                    <a
                      href="/return-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-700"
                    >
                      Return Policy
                    </a>
                    . I understand that all sales are final and returns are only accepted for verified defects or incorrect products supplied by the company.
                  </Label>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 pl-7">
                  By checking these boxes, you acknowledge that you have reviewed and understood both policies and agree to be bound by their terms.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {isQuotationMode ? (
                    quotationItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_name} x {item.quantity}
                        </span>
                        <span>₹{(item.unit_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    {!quotationData && isQuotationMode ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%):</span>
                    {!quotationData && isQuotationMode ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>
                  {isQuotationMode && quotationData?.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Discount ({quotationData.discount_percentage}%)
                      </span>
                      <span>
                        -₹{Number(quotationData.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    {!quotationData && isQuotationMode ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Important Policies:</p>
                  <div className="space-y-1">
                    <a
                      href="/shipping-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      Shipping & Delivery Terms
                    </a>
                    <a
                      href="/return-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      Return Policy (All Sales Final)
                    </a>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || !policiesAccepted.shippingPolicy || !policiesAccepted.returnPolicy}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
