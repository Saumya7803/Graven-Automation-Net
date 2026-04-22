import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const notification = await req.json();
    
    console.log('Received Google Merchant webhook:', JSON.stringify(notification, null, 2));

    const { resource, attribute } = notification;

    if (resource === 'products' && attribute) {
      const { offerId, status, itemLevelIssues } = attribute;

      // Update product status
      const { error } = await supabaseClient
        .from('google_product_status')
        .update({
          approval_status: status === 'approved' ? 'approved' : 
                          status === 'disapproved' ? 'disapproved' : 
                          'pending',
          item_level_issues: itemLevelIssues || [],
          updated_at: new Date().toISOString(),
        })
        .eq('merchant_product_id', offerId);

      if (error) {
        console.error('Failed to update product status:', error);
      } else {
        console.log(`✅ Updated status for product ${offerId}: ${status}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-merchant-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
