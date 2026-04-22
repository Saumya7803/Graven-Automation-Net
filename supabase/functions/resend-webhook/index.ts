import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
};

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    clicked_link?: {
      url: string;
    };
  };
}

// Verify Resend webhook signature (Svix format)
async function verifySignature(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string
): Promise<boolean> {
  try {
    const signedContent = `${headers.id}.${headers.timestamp}.${payload}`;
    
    // Remove the 'whsec_' prefix if present
    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const secretBytes = new TextEncoder().encode(secretKey);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signedContent)
    );
    
    const signatureArray = new Uint8Array(signature);
    const expectedSignature = base64Encode(signatureArray.buffer);
    
    // Parse signatures (Svix format: "v1,signature")
    const signatures = headers.signature.split(' ');
    for (const sig of signatures) {
      const parts = sig.split(',');
      if (parts.length === 2) {
        const [version, sigValue] = parts;
        if (version === 'v1' && sigValue === expectedSignature) {
          console.log('✅ Signature verified with version:', version);
          return true;
        }
      }
    }
    
    console.error('❌ No matching signature found. Expected:', expectedSignature);
    return false;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signingSecret = Deno.env.get('RESEND_SIGNING_SECRET');
    if (!signingSecret) {
      console.error('❌ RESEND_SIGNING_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook signing secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook headers and body - Resend uses Svix which sends these headers
    const webhook_id = req.headers.get('webhook-id') || req.headers.get('svix-id');
    const webhook_timestamp = req.headers.get('webhook-timestamp') || req.headers.get('svix-timestamp');
    const webhook_signature = req.headers.get('webhook-signature') || req.headers.get('svix-signature');

    console.log('📥 Webhook headers:', {
      id: webhook_id,
      timestamp: webhook_timestamp,
      signature: webhook_signature ? 'present' : 'missing'
    });

    if (!webhook_id || !webhook_timestamp || !webhook_signature) {
      console.error('❌ Missing webhook signature headers');
      return new Response(
        JSON.stringify({ error: 'Missing webhook signature headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    console.log('📝 Received webhook payload length:', body.length);
    
    // Verify webhook signature
    const isValid = await verifySignature(
      body,
      { id: webhook_id, timestamp: webhook_timestamp, signature: webhook_signature },
      signingSecret
    );
    
    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Webhook signature verified');

    // Parse event
    const event: ResendWebhookEvent = JSON.parse(body);
    console.log(`📨 Received webhook event: ${event.type} for email: ${event.data.email_id}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the communication record by resend_id in metadata
    const { data: communication, error: findError } = await supabase
      .from('customer_communications')
      .select('id, status, opened_at, clicked_at, delivered_at, metadata')
      .eq('metadata->>resend_id', event.data.email_id)
      .single();

    if (findError || !communication) {
      console.log(`⚠️ No communication found for resend_id: ${event.data.email_id}`);
      // Return 200 to acknowledge receipt (not an error, just no matching record)
      return new Response(
        JSON.stringify({ message: 'No matching communication record found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📝 Found communication: ${communication.id}`);

    // Prepare update data based on event type
    const updates: any = {};
    let shouldUpdate = false;

    switch (event.type) {
      case 'email.delivered':
        if (!communication.delivered_at) {
          updates.delivered_at = new Date().toISOString();
          if (communication.status === 'sent') {
            updates.status = 'delivered';
          }
          shouldUpdate = true;
          console.log('📬 Marking email as delivered');
        }
        break;

      case 'email.opened':
        if (!communication.opened_at) {
          updates.opened_at = new Date().toISOString();
          shouldUpdate = true;
          console.log('👀 Marking email as opened (first open)');
        }
        // Always increment open count
        const currentOpenCount = communication.metadata?.open_count || 0;
        updates.metadata = {
          ...communication.metadata,
          open_count: currentOpenCount + 1,
          last_opened_at: new Date().toISOString(),
        };
        shouldUpdate = true;
        break;

      case 'email.clicked':
        if (!communication.clicked_at) {
          updates.clicked_at = new Date().toISOString();
          shouldUpdate = true;
          console.log('🔗 Marking email as clicked (first click)');
        }
        // Track clicked URLs
        const clickedUrl = event.data.clicked_link?.url;
        const currentClickCount = communication.metadata?.click_count || 0;
        const clickedUrls = communication.metadata?.clicked_urls || [];
        if (clickedUrl && !clickedUrls.includes(clickedUrl)) {
          clickedUrls.push(clickedUrl);
        }
        updates.metadata = {
          ...communication.metadata,
          click_count: currentClickCount + 1,
          last_clicked_at: new Date().toISOString(),
          clicked_urls: clickedUrls,
        };
        shouldUpdate = true;
        break;

      case 'email.bounced':
        updates.status = 'failed';
        updates.failed_reason = 'Email bounced';
        shouldUpdate = true;
        console.log('❌ Marking email as bounced');
        break;

      case 'email.complained':
        updates.status = 'failed';
        updates.failed_reason = 'Spam complaint';
        shouldUpdate = true;
        console.log('⚠️ Marking email as spam complaint');
        break;

      case 'email.delivery_delayed':
        updates.status = 'delayed';
        shouldUpdate = true;
        console.log('⏱️ Marking email as delayed');
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Update the database if needed
    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from('customer_communications')
        .update(updates)
        .eq('id', communication.id);

      if (updateError) {
        console.error('❌ Failed to update communication:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update communication record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`✅ Successfully updated communication ${communication.id}`);
    } else {
      console.log(`ℹ️ No update needed for communication ${communication.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Webhook processed: ${event.type}`,
        communication_id: communication.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
