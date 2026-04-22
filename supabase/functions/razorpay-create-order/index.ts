import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  amount: number;
  currency: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { amount, currency, orderId }: RequestBody = await req.json();

    console.log("Creating Razorpay order:", { amount, currency, orderId });

    // Fetch Razorpay configuration from database
    const { data: gatewayData, error: gatewayError } = await supabase
      .from("payment_gateways")
      .select("configuration, is_active, is_test_mode")
      .eq("gateway_type", "razorpay")
      .eq("is_active", true)
      .single();

    if (gatewayError || !gatewayData) {
      console.error("Gateway not found or inactive:", gatewayError);
      throw new Error("Razorpay gateway not configured or inactive");
    }

    const { key_id, key_secret } = gatewayData.configuration;

    if (!key_id || !key_secret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Create Razorpay order
    const razorpayOrderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: orderId,
      notes: {
        order_id: orderId,
      },
    };

    const authString = btoa(`${key_id}:${key_secret}`);
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(razorpayOrderData),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay API error:", errorData);
      throw new Error("Failed to create Razorpay order");
    }

    const razorpayOrder = await razorpayResponse.json();

    console.log("Razorpay order created successfully:", razorpayOrder.id);

    return new Response(
      JSON.stringify({
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: key_id,
        isTestMode: gatewayData.is_test_mode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in razorpay-create-order:", error);
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
