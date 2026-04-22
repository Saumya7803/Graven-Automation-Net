import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
}

// Calculate customer tier (same logic as frontend)
function calculateCustomerTier(
  totalSpent: number,
  totalOrders: number,
  createdAt: string
): string {
  if (totalSpent >= 100000 || totalOrders >= 10) {
    return 'vip';
  }
  if (totalSpent >= 20000 || totalOrders >= 5) {
    return 'regular';
  }
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  if (accountAge < thirtyDaysInMs) {
    return 'new';
  }
  return 'regular';
}

// Replace placeholders in template
function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

// Get tier badge emoji
function getTierBadge(tier: string): string {
  switch (tier) {
    case 'vip': return '👑';
    case 'regular': return '⭐';
    case 'new': return '🆕';
    default: return '⭐';
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    const { campaignId }: CampaignRequest = await req.json();
    if (!campaignId) {
      return new Response(JSON.stringify({ error: "campaignId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing campaign: ${campaignId}`);

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message}`);
    }

    // Validate campaign status
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error(`Campaign cannot be sent. Current status: ${campaign.status}`);
    }

    // Fetch all customers
    const { data: customers, error: customersError } = await supabaseClient
      .from("customers")
      .select("id, user_id, email, full_name, created_at");

    if (customersError) {
      throw new Error(`Failed to fetch customers: ${customersError.message}`);
    }

    // Fetch orders for tier calculation
    const { data: orders } = await supabaseClient
      .from("orders")
      .select("user_id, total_amount");

    // Calculate customer tiers and filter by target tiers
    const customerTiers = new Map();
    const ordersByUser = new Map();

    // Group orders by user
    orders?.forEach(order => {
      if (!ordersByUser.has(order.user_id)) {
        ordersByUser.set(order.user_id, []);
      }
      ordersByUser.get(order.user_id).push(order);
    });

    // Calculate tier for each customer and filter by target tiers
    const targetCustomers = campaign.target_tiers.includes('all')
      ? customers || []  // If "all" is selected, include all customers
      : customers?.filter(customer => {
          const userOrders = ordersByUser.get(customer.user_id) || [];
          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
          
          const tier = calculateCustomerTier(totalSpent, totalOrders, customer.created_at);
          customerTiers.set(customer.id, tier);
          
          return campaign.target_tiers.includes(tier);
        }) || [];
    
    // If "all" is selected, calculate tier for all customers for personalization
    if (campaign.target_tiers.includes('all')) {
      targetCustomers.forEach(customer => {
        const userOrders = ordersByUser.get(customer.user_id) || [];
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
        const tier = calculateCustomerTier(totalSpent, totalOrders, customer.created_at);
        customerTiers.set(customer.id, tier);
      });
    }

    console.log(`Found ${targetCustomers.length} customers matching target tiers: ${campaign.target_tiers.join(', ')}`);

    let sentCount = 0;
    let failedCount = 0;

    // Update campaign status
    await supabaseClient
      .from("email_campaigns")
      .update({ 
        status: 'sending',
        total_recipients: targetCustomers.length 
      })
      .eq("id", campaignId);

    // Send emails
    for (const customer of targetCustomers) {
      try {
        const tier = customerTiers.get(customer.id);
        const tierBadge = getTierBadge(tier);

        // Create delivery record
        const { data: delivery, error: deliveryError } = await supabaseClient
          .from("email_campaign_deliveries")
          .insert({
            campaign_id: campaignId,
            customer_id: customer.id,
            customer_email: customer.email,
            customer_tier: tier,
            status: 'pending'
          })
          .select()
          .single();

        if (deliveryError) {
          console.error(`Failed to create delivery record for ${customer.email}:`, deliveryError);
          failedCount++;
          continue;
        }

        // Personalize email template
        const personalizedHtml = replacePlaceholders(campaign.template_html, {
          customer_name: customer.full_name,
          tier: tier,
          tier_badge: tierBadge,
        });

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "Schneidervfd.com <noreply@schneidervfd.com>",
          reply_to: "sales@gravenautomation.com",
          to: [customer.email],
          subject: campaign.subject,
          html: personalizedHtml,
        });

        // Update delivery record
        await supabaseClient
          .from("email_campaign_deliveries")
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_id: emailResponse.data?.id
          })
          .eq("id", delivery.id);

        sentCount++;
        console.log(`Email sent to ${customer.email} (${tier})`);

        // Rate limiting: delay between sends
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        console.error(`Failed to send email to ${customer.email}:`, error);
        
        // Update delivery record with error
        await supabaseClient
          .from("email_campaign_deliveries")
          .update({
            status: 'failed',
            error_message: error?.message || 'Unknown error'
          })
          .eq("customer_email", customer.email)
          .eq("campaign_id", campaignId);

        failedCount++;
      }
    }

    // Update campaign with final statistics
    await supabaseClient
      .from("email_campaigns")
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_sent: sentCount,
        total_failed: failedCount
      })
      .eq("id", campaignId);

    console.log(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        total_recipients: targetCustomers.length,
        sent: sentCount,
        failed: failedCount
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in send-campaign-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
