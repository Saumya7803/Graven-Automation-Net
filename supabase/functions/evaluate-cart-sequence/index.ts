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
    const { abandonedCartId } = await req.json();

    if (!abandonedCartId) {
      return new Response(
        JSON.stringify({ error: 'Missing abandonedCartId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get cart details
    const { data: cart } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', abandonedCartId)
      .single();

    if (!cart) {
      return new Response(
        JSON.stringify({ error: 'Cart not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get interaction stats
    const { data: interactions } = await supabase
      .from('cart_recovery_interactions')
      .select('interaction_type')
      .eq('abandoned_cart_id', abandonedCartId);

    const stats = {
      emailsSent: interactions?.filter(i => i.interaction_type === 'email_sent').length || 0,
      emailsOpened: interactions?.filter(i => i.interaction_type === 'email_opened').length || 0,
      clicks: cart.recovery_link_click_count || 0,
      visits: cart.visit_count || 0,
      recovered: !!cart.recovered_at,
      checkoutAbandoned: cart.status === 'checkout_abandoned',
      hoursSinceAbandonment: (Date.now() - new Date(cart.abandoned_at).getTime()) / (1000 * 60 * 60),
      hoursSinceLastVisit: cart.last_visit_at 
        ? (Date.now() - new Date(cart.last_visit_at).getTime()) / (1000 * 60 * 60)
        : 999
    };

    // Get all active sequences ordered by priority
    const { data: sequences } = await supabase
      .from('cart_recovery_sequences')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Evaluate each sequence's conditions
    let bestSequence = null;

    for (const sequence of sequences || []) {
      const conditions = sequence.trigger_conditions;
      let matches = true;

      // Check checkout abandoner sequence
      if (conditions.checkout_abandoned && !stats.checkoutAbandoned) {
        matches = false;
      }

      // Check high intent (multiple visits)
      if (conditions.min_visits && stats.visits < conditions.min_visits) {
        matches = false;
      }

      // Check engaged visitor
      if (conditions.min_clicks && stats.clicks < conditions.min_clicks) {
        matches = false;
      }
      
      if (conditions.min_visits && stats.visits < conditions.min_visits) {
        matches = false;
      }

      if (conditions.not_purchased && stats.recovered) {
        matches = false;
      }

      // Check single click scenario
      if (conditions.max_visits && stats.visits > conditions.max_visits) {
        matches = false;
      }

      if (conditions.hours_since_last && stats.hoursSinceLastVisit < conditions.hours_since_last) {
        matches = false;
      }

      // Check never opened scenario
      if (conditions.emails_sent_min && stats.emailsSent < conditions.emails_sent_min) {
        matches = false;
      }

      if (conditions.emails_opened !== undefined && stats.emailsOpened !== conditions.emails_opened) {
        matches = false;
      }

      // Default sequence
      if (conditions.default && bestSequence) {
        matches = false; // Only use default if no other matches
      }

      if (matches) {
        bestSequence = sequence;
        break; // Take highest priority match
      }
    }

    // If no sequence matched, use standard
    if (!bestSequence) {
      const { data: standardSequence } = await supabase
        .from('cart_recovery_sequences')
        .select('*')
        .eq('sequence_name', 'standard')
        .single();
      
      bestSequence = standardSequence;
    }

    // Update cart if sequence changed
    if (bestSequence && bestSequence.sequence_name !== cart.current_sequence) {
      await supabase
        .from('abandoned_carts')
        .update({
          current_sequence: bestSequence.sequence_name,
          sequence_stage: 0, // Reset to beginning of new sequence
          sequence_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', abandonedCartId);

      console.log(`🔄 Switched cart ${abandonedCartId} to sequence: ${bestSequence.sequence_name}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sequence: bestSequence?.sequence_name,
        changed: bestSequence?.sequence_name !== cart.current_sequence,
        stats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error evaluating sequence:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
