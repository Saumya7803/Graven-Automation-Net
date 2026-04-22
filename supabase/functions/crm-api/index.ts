import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API key validation
async function validateApiKey(authHeader: string | null, supabase: any): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const apiKey = authHeader.substring(7);
  
  // Hash the provided key
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Check if key exists and is active
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, is_active, expires_at, permissions')
    .eq('key_hash', keyHash)
    .single();

  if (error || !keyData || !keyData.is_active) {
    return false;
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return false;
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const authHeader = req.headers.get('Authorization');
    const isValid = await validateApiKey(authHeader, supabase);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/crm-api', '');
    const method = req.method;

    // RFQ Endpoints
    if (path === '/rfqs' && method === 'GET') {
      const status = url.searchParams.get('status');
      const fromDate = url.searchParams.get('from_date');
      const toDate = url.searchParams.get('to_date');
      const customerEmail = url.searchParams.get('customer_email');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('quotation_requests')
        .select(`
          *,
          quotation_request_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            subtotal,
            discount_percentage,
            discount_amount,
            final_price
          )
        `, { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (customerEmail) query = query.eq('customer_email', customerEmail);
      if (fromDate) query = query.gte('created_at', fromDate);
      if (toDate) query = query.lte('created_at', toDate);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          data,
          pagination: {
            total: count,
            limit,
            offset,
            has_more: (count || 0) > offset + limit,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get single RFQ
    if (path.match(/^\/rfqs\/[0-9a-f-]+$/) && method === 'GET') {
      const id = path.split('/')[2];

      const { data, error } = await supabase
        .from('quotation_requests')
        .select(`
          *,
          quotation_request_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            subtotal,
            discount_percentage,
            discount_amount,
            final_price
          ),
          quotation_revisions (
            id,
            revision_number,
            revision_notes,
            total_amount,
            discount_amount,
            discount_percentage,
            final_amount,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update RFQ
    if (path.match(/^\/rfqs\/[0-9a-f-]+$/) && method === 'PATCH') {
      const id = path.split('/')[2];
      const body = await req.json();

      // Only allow updating admin_notes field
      const { admin_notes } = body;

      const { data, error } = await supabase
        .from('quotation_requests')
        .update({ admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Orders Endpoints
    if (path === '/orders' && method === 'GET') {
      const status = url.searchParams.get('status');
      const paymentStatus = url.searchParams.get('payment_status');
      const fromDate = url.searchParams.get('from_date');
      const toDate = url.searchParams.get('to_date');
      const customerEmail = url.searchParams.get('customer_email');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            subtotal
          ),
          customers (
            full_name,
            email,
            phone,
            company_name
          )
        `, { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (paymentStatus) query = query.eq('payment_status', paymentStatus);
      if (fromDate) query = query.gte('created_at', fromDate);
      if (toDate) query = query.lte('created_at', toDate);
      if (customerEmail) {
        // Need to filter by customer email - join through customers table
        const { data: customers } = await supabase
          .from('customers')
          .select('id')
          .eq('email', customerEmail);
        
        if (customers && customers.length > 0) {
          query = query.in('customer_id', customers.map(c => c.id));
        }
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          data,
          pagination: {
            total: count,
            limit,
            offset,
            has_more: (count || 0) > offset + limit,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get single order
    if (path.match(/^\/orders\/[0-9a-f-]+$/) && method === 'GET') {
      const id = path.split('/')[2];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            subtotal
          ),
          customers (
            full_name,
            email,
            phone,
            company_name
          ),
          order_status_history (
            id,
            status,
            notes,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order notes
    if (path.match(/^\/orders\/[0-9a-f-]+$/) && method === 'PATCH') {
      const id = path.split('/')[2];
      const body = await req.json();

      // Only allow updating notes field (not status)
      const { notes } = body;

      const { data, error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Customers endpoint
    if (path === '/customers' && method === 'GET') {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (count),
          quotation_requests (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
