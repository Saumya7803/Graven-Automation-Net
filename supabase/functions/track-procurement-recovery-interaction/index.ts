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
    const { reminderId, interactionType, templateId, metadata } = await req.json();

    if (!reminderId || !interactionType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: reminderId, interactionType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get reminder to get user_id
    const { data: reminder, error: reminderError } = await supabase
      .from("procurement_list_reminders")
      .select("id, user_id")
      .eq("id", reminderId)
      .single();

    if (reminderError || !reminder) {
      return new Response(
        JSON.stringify({ error: "Reminder not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert interaction
    const { error: interactionError } = await supabase
      .from("procurement_recovery_interactions")
      .insert({
        reminder_id: reminderId,
        user_id: reminder.user_id,
        interaction_type: interactionType,
        template_id: templateId || null,
        metadata: metadata || {},
      });

    if (interactionError) throw interactionError;

    // Update reminder based on interaction type
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (interactionType === "link_clicked") {
      const { data: currentReminder } = await supabase
        .from("procurement_list_reminders")
        .select("recovery_link_click_count")
        .eq("id", reminderId)
        .single();

      updateData.recovery_link_clicked_at = new Date().toISOString();
      updateData.recovery_link_click_count = (currentReminder?.recovery_link_click_count || 0) + 1;
    }

    if (interactionType === "quotation_requested" || interactionType === "order_placed") {
      updateData.status = "converted";
      updateData.converted_at = new Date().toISOString();
      updateData.converted_to = interactionType === "quotation_requested" ? "quotation" : "order";
    }

    if (interactionType === "dismissed") {
      updateData.status = "dismissed";
    }

    await supabase.from("procurement_list_reminders").update(updateData).eq("id", reminderId);

    // Update template stats if provided
    if (templateId && (interactionType === "link_clicked" || interactionType === "email_opened")) {
      const field = interactionType === "link_clicked" ? "times_clicked" : "times_opened";
      const { data: template } = await supabase
        .from("procurement_recovery_templates")
        .select("times_clicked, times_opened")
        .eq("id", templateId)
        .single();

      if (template) {
        const currentValue = field === "times_clicked" ? template.times_clicked : template.times_opened;
        await supabase
          .from("procurement_recovery_templates")
          .update({ [field]: (currentValue || 0) + 1 })
          .eq("id", templateId);
      }
    }

    // Update conversion stats if converted
    if (templateId && (interactionType === "quotation_requested" || interactionType === "order_placed")) {
      const { data: template } = await supabase
        .from("procurement_recovery_templates")
        .select("conversions")
        .eq("id", templateId)
        .single();

      if (template) {
        await supabase
          .from("procurement_recovery_templates")
          .update({ conversions: (template.conversions || 0) + 1 })
          .eq("id", templateId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Interaction tracked" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});