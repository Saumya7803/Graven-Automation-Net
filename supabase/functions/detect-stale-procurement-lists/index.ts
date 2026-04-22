import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    let forceDetection = false;
    try {
      const body = await req.json();
      forceDetection = body?.forceDetection === true;
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Configuration
    const staleThresholdDays = 3; // Lists inactive for 3+ days
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - staleThresholdDays);

    console.log(`Detecting stale procurement lists older than ${staleThresholdDays} days`);

    // Get all user_favorites grouped by user with product details
    const { data: favorites, error: favError } = await supabase
      .from("user_favorites")
      .select(`
        user_id,
        product_id,
        created_at,
        products (
          id,
          name,
          sku,
          price,
          image_url,
          series
        )
      `)
      .lt("created_at", staleDate.toISOString());

    if (favError) {
      console.error("Error fetching favorites:", favError);
      throw favError;
    }

    if (!favorites || favorites.length === 0) {
      console.log("No stale procurement lists found");
      return new Response(JSON.stringify({ message: "No stale lists found", created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group favorites by user
    const userLists: Record<string, any[]> = {};
    for (const fav of favorites) {
      if (!fav.user_id) continue;
      if (!userLists[fav.user_id]) {
        userLists[fav.user_id] = [];
      }
      userLists[fav.user_id].push(fav);
    }

    console.log(`Found ${Object.keys(userLists).length} users with stale lists`);

    let created = 0;
    let skipped = 0;

    for (const [userId, items] of Object.entries(userLists)) {
      // Check if there's already an active reminder for this user
      const { data: existingReminder } = await supabase
        .from("procurement_list_reminders")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (existingReminder) {
        console.log(`Skipping user ${userId} - already has active reminder`);
        skipped++;
        continue;
      }

      // Check if user has recent orders or quotations (skip if forceDetection is true)
      if (!forceDetection) {
        const { data: recentOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .gte("created_at", staleDate.toISOString())
          .limit(1);

        if (recentOrders && recentOrders.length > 0) {
          console.log(`Skipping user ${userId} - has recent orders`);
          skipped++;
          continue;
        }

        const { data: recentQuotations } = await supabase
          .from("quotation_requests")
          .select("id")
          .eq("user_id", userId)
          .gte("created_at", staleDate.toISOString())
          .limit(1);

        if (recentQuotations && recentQuotations.length > 0) {
          console.log(`Skipping user ${userId} - has recent quotation requests`);
          skipped++;
          continue;
        }
      } else {
        console.log(`Force detection enabled - skipping recent activity check for user ${userId}`);
      }

      // Calculate list value and create snapshot
      let listValue = 0;
      const listSnapshot = items.map((item: any) => {
        const product = item.products;
        const price = product?.price || 0;
        listValue += price;
        return {
          product_id: item.product_id,
          product_name: product?.name || "Unknown Product",
          product_sku: product?.sku || "",
          product_price: price,
          product_image: product?.image_url || "",
          product_series: product?.series || "",
          added_at: item.created_at,
        };
      });

      // Find earliest item added date
      const firstItemAddedAt = items.reduce((earliest: string, item: any) => {
        return !earliest || item.created_at < earliest ? item.created_at : earliest;
      }, null);

      // Find latest activity
      const lastActivityAt = items.reduce((latest: string, item: any) => {
        return !latest || item.created_at > latest ? item.created_at : latest;
      }, null);

      // Create reminder record
      const { error: insertError } = await supabase
        .from("procurement_list_reminders")
        .insert({
          user_id: userId,
          list_snapshot: listSnapshot,
          list_value: listValue,
          item_count: items.length,
          first_item_added_at: firstItemAddedAt,
          last_activity_at: lastActivityAt,
        });

      if (insertError) {
        console.error(`Error creating reminder for user ${userId}:`, insertError);
      } else {
        console.log(`Created reminder for user ${userId} with ${items.length} items`);
        created++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Stale procurement list detection complete",
        usersProcessed: Object.keys(userLists).length,
        created,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in detect-stale-procurement-lists:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
