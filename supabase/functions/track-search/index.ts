import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { searchQuery, resultsCount = 0 } = await req.json();

    if (!searchQuery || typeof searchQuery !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid search query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    // Check if the search query already exists
    const { data: existing, error: fetchError } = await supabase
      .from('search_analytics')
      .select('id, search_count, zero_results_count')
      .eq('search_query', normalizedQuery)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching search analytics:', fetchError);
      throw fetchError;
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('search_analytics')
        .update({
          search_count: existing.search_count + 1,
          last_searched_at: new Date().toISOString(),
          results_count: resultsCount,
          zero_results_count: resultsCount === 0 ? (existing.zero_results_count || 0) + 1 : existing.zero_results_count || 0,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating search analytics:', updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('search_analytics')
        .insert({
          search_query: normalizedQuery,
          search_count: 1,
          results_count: resultsCount,
          zero_results_count: resultsCount === 0 ? 1 : 0,
        });

      if (insertError) {
        console.error('Error inserting search analytics:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
