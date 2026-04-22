import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event_type: string;
  resource_type: string;
  resource_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_type, resource_type, resource_id }: WebhookPayload = await req.json();

    if (!event_type || !resource_type || !resource_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_type, resource_type, resource_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing webhook for ${event_type}: ${resource_type} ${resource_id}`);

    // Fetch active webhook configurations
    const { data: webhookConfigs, error: configError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      console.error('Error fetching webhook configs:', configError);
      throw configError;
    }

    if (!webhookConfigs || webhookConfigs.length === 0) {
      console.log('No active webhooks configured');
      return new Response(JSON.stringify({ message: 'No active webhooks' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the resource data
    let resourceData: any;
    if (resource_type === 'rfq') {
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
          )
        `)
        .eq('id', resource_id)
        .single();
      
      if (error) throw error;
      resourceData = data;
    } else if (resource_type === 'order') {
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
          )
        `)
        .eq('id', resource_id)
        .single();
      
      if (error) throw error;
      resourceData = data;
    }

    if (!resourceData) {
      return new Response(
        JSON.stringify({ error: `Unsupported resource_type: ${resource_type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build webhook payload
    const payload = {
      event: event_type,
      timestamp: new Date().toISOString(),
      resource_type,
      data: resource_type === 'rfq' ? {
        rfq: {
          id: resourceData.id,
          status: resourceData.status,
          customer: {
            name: resourceData.customer_name,
            email: resourceData.customer_email,
            phone: resourceData.customer_phone,
            company: resourceData.company_name,
          },
          items: resourceData.quotation_request_items || [],
          total_amount: resourceData.total_amount,
          discount_amount: resourceData.discount_amount,
          discount_percentage: resourceData.discount_percentage,
          final_amount: resourceData.final_amount,
          message: resourceData.message,
          attachment_url: resourceData.attachment_url,
          quote_notes: resourceData.quote_notes,
          admin_notes: resourceData.admin_notes,
          created_at: resourceData.created_at,
          quoted_at: resourceData.quoted_at,
          expires_at: resourceData.expires_at,
        },
      } : {
        order: {
          id: resourceData.id,
          order_number: resourceData.order_number,
          status: resourceData.status,
          payment_status: resourceData.payment_status,
          customer: resourceData.customers ? {
            name: resourceData.customers.full_name,
            email: resourceData.customers.email,
            phone: resourceData.customers.phone,
            company: resourceData.customers.company_name,
          } : null,
          items: resourceData.order_items || [],
          shipping_address: resourceData.shipping_address,
          billing_address: resourceData.billing_address,
          subtotal: resourceData.subtotal,
          tax_amount: resourceData.tax_amount,
          shipping_cost: resourceData.shipping_cost,
          total_amount: resourceData.total_amount,
          payment_method: resourceData.payment_method,
          notes: resourceData.notes,
          quotation_id: resourceData.quotation_id,
          created_at: resourceData.created_at,
        },
      },
    };

    // Send to each webhook
    const deliveryPromises = webhookConfigs.map(async (config) => {
      // Check if this event is enabled for this webhook
      const events = config.events as string[];
      if (!events.includes(event_type)) {
        console.log(`Event ${event_type} not enabled for webhook ${config.name}`);
        return;
      }

      // Generate HMAC signature
      const encoder = new TextEncoder();
      const keyData = encoder.encode(config.secret_key);
      const messageData = encoder.encode(JSON.stringify(payload));
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const payloadWithSignature = { ...payload, signature };

      // Send webhook with retry logic
      let attempt = 0;
      let success = false;
      let lastError: any = null;

      while (attempt < config.retry_attempts && !success) {
        try {
          const response = await fetch(config.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'User-Agent': 'Lovable-Webhook/1.0',
            },
            body: JSON.stringify(payloadWithSignature),
            signal: AbortSignal.timeout(config.timeout_seconds * 1000),
          });

          const responseBody = await response.text();

          // Log delivery
          await supabase.from('webhook_deliveries').insert({
            webhook_configuration_id: config.id,
            event_type,
            resource_type,
            resource_id,
            payload: payloadWithSignature,
            status: response.ok ? 'success' : 'failed',
            http_status_code: response.status,
            response_body: responseBody,
            error_message: response.ok ? null : `HTTP ${response.status}`,
            retry_count: attempt,
            delivered_at: response.ok ? new Date().toISOString() : null,
          });

          if (response.ok) {
            success = true;
            console.log(`Webhook delivered to ${config.name} on attempt ${attempt + 1}`);
          } else {
            lastError = `HTTP ${response.status}: ${responseBody}`;
          }
        } catch (error: any) {
          lastError = error.message;
          console.error(`Webhook delivery failed (attempt ${attempt + 1}):`, error);
          
          // Log failed delivery
          await supabase.from('webhook_deliveries').insert({
            webhook_configuration_id: config.id,
            event_type,
            resource_type,
            resource_id,
            payload: payloadWithSignature,
            status: 'failed',
            error_message: error.message,
            retry_count: attempt,
          });
        }

        attempt++;
        if (!success && attempt < config.retry_attempts) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      if (!success) {
        console.error(`Failed to deliver webhook to ${config.name} after ${attempt} attempts: ${lastError}`);
      }
    });

    await Promise.all(deliveryPromises);

    return new Response(
      JSON.stringify({ message: 'Webhooks processed', event_type, resource_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
