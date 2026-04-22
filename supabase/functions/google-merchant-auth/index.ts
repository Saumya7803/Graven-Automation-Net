import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

// Simple encryption for tokens (in production, use a more robust solution)
function encryptToken(token: string): string {
  return btoa(token); // Base64 encoding (replace with proper encryption)
}

function decryptToken(encrypted: string): string {
  return atob(encrypted); // Base64 decoding (replace with proper decryption)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // GET /google-merchant-auth - Start OAuth flow
    if (req.method === 'GET' && path === 'google-merchant-auth') {
      const state = crypto.randomUUID();
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-merchant-auth/callback`;
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', Deno.env.get('GOOGLE_MERCHANT_CLIENT_ID') ?? '');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/content');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('prompt', 'consent');

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl.toString(),
        },
      });
    }

    // GET /google-merchant-auth/callback - Handle OAuth callback
    if (req.method === 'GET' && path === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code) {
        throw new Error('No authorization code received');
      }

      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-merchant-auth/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('GOOGLE_MERCHANT_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_MERCHANT_CLIENT_SECRET') ?? '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        throw new Error('Failed to exchange authorization code');
      }

      const tokens: TokenResponse = await tokenResponse.json();

      // Encrypt tokens before storing
      const encryptedAccessToken = encryptToken(tokens.access_token);
      const encryptedRefreshToken = encryptToken(tokens.refresh_token);
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Store tokens in database
      const { error: upsertError } = await supabaseClient
        .from('google_merchant_config')
        .upsert({
          merchant_id: 'pending',
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          token_expires_at: expiresAt.toISOString(),
          is_connected: true,
          sync_status: 'connected',
          last_sync_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error('Failed to store tokens:', upsertError);
        throw upsertError;
      }

      // Redirect back to admin settings page
      const frontendUrl = (Deno.env.get('FRONTEND_URL') ?? 'https://schneidervfd.com').replace(/\/+$/, '');
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${frontendUrl}/admin/google-merchant-settings?success=true`,
        },
      });
    }

    // GET /google-merchant-auth/status - Check connection status
    if (req.method === 'GET' && path === 'status') {
      const { data, error } = await supabaseClient
        .from('google_merchant_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return new Response(
        JSON.stringify({
          connected: data?.is_connected ?? false,
          merchantId: data?.merchant_id,
          lastSync: data?.last_sync_at,
          syncStatus: data?.sync_status,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /google-merchant-auth/disconnect - Disconnect OAuth
    if (req.method === 'POST' && path === 'disconnect') {
      const { data } = await supabaseClient
        .from('google_merchant_config')
        .select('id, access_token_encrypted')
        .single();

      if (data?.access_token_encrypted) {
        const accessToken = decryptToken(data.access_token_encrypted);
        
        // Revoke token with Google
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
          method: 'POST',
        });
      }

      // Clear config from database
      if (data?.id) {
        await supabaseClient
          .from('google_merchant_config')
          .update({
            access_token_encrypted: null,
            refresh_token_encrypted: null,
            token_expires_at: null,
            is_connected: false,
            sync_status: 'disconnected',
          })
          .eq('id', data.id);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-merchant-auth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
