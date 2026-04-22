import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { abandonedCartId, interactionType, templateId, metadata = {} } = await req.json();

    if (!abandonedCartId || !interactionType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get cart and user info
    const { data: cart } = await supabase
      .from('abandoned_carts')
      .select('user_id')
      .eq('id', abandonedCartId)
      .single();

    // Insert interaction record
    const { error: insertError } = await supabase
      .from('cart_recovery_interactions')
      .insert({
        abandoned_cart_id: abandonedCartId,
        user_id: cart?.user_id,
        interaction_type: interactionType,
        template_id: templateId,
        metadata
      });

    if (insertError) {
      console.error('Error inserting interaction:', insertError);
      throw insertError;
    }

    // Update cart summary fields based on interaction type
    const updates: any = { updated_at: new Date().toISOString() };

    switch (interactionType) {
      case 'link_clicked':
        const { data: currentCart } = await supabase
          .from('abandoned_carts')
          .select('recovery_link_click_count')
          .eq('id', abandonedCartId)
          .single();
        
        updates.recovery_link_clicked_at = new Date().toISOString();
        updates.recovery_link_click_count = (currentCart?.recovery_link_click_count || 0) + 1;
        break;

      case 'page_viewed':
        const { data: currentVisitCart } = await supabase
          .from('abandoned_carts')
          .select('visit_count')
          .eq('id', abandonedCartId)
          .single();
        
        updates.last_visit_at = new Date().toISOString();
        updates.visit_count = (currentVisitCart?.visit_count || 0) + 1;
        break;

      case 'cart_recovered':
        updates.recovered_at = new Date().toISOString();
        updates.status = 'recovered';
        break;

      case 'checkout_abandoned':
        updates.status = 'checkout_abandoned';
        break;
    }

    await supabase
      .from('abandoned_carts')
      .update(updates)
      .eq('id', abandonedCartId);

    // Trigger sequence evaluation for behavioral changes
    if (['link_clicked', 'page_viewed', 'email_opened', 'checkout_abandoned'].includes(interactionType)) {
      await supabase.functions.invoke('evaluate-cart-sequence', {
        body: { abandonedCartId }
      });
    }

    console.log(`✅ Tracked ${interactionType} for cart ${abandonedCartId}`);

    return new Response(
      JSON.stringify({ success: true, interactionType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
