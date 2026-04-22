import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }: RequestBody = await req.json();

    console.log("Verifying Razorpay payment:", { orderId, razorpayPaymentId });

    // Fetch Razorpay configuration
    const { data: gatewayData, error: gatewayError } = await supabase
      .from("payment_gateways")
      .select("configuration")
      .eq("gateway_type", "razorpay")
      .eq("is_active", true)
      .single();

    if (gatewayError || !gatewayData) {
      throw new Error("Razorpay gateway not configured");
    }

    const { key_secret } = gatewayData.configuration;

    // Verify payment signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key_secret);
    const messageData = encoder.encode(`${razorpayOrderId}|${razorpayPaymentId}`);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const generatedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (generatedSignature !== razorpaySignature) {
      console.error("Payment signature verification failed");
      throw new Error("Invalid payment signature");
    }

    console.log("Payment signature verified successfully");

    // Update order payment status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        payment_method: "razorpay",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw updateError;
    }

    console.log("Order updated successfully:", orderId);

    // Trigger order confirmation email
    const { error: emailError } = await supabase.functions.invoke(
      "send-order-confirmation",
      {
        body: { orderId },
      }
    );

    if (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        orderId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in razorpay-verify-payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
