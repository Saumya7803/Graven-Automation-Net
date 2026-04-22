import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function encryptToken(token: string): string {
  return btoa(token);
}

function decryptToken(encrypted: string): string {
  return atob(encrypted);
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get current config
    const { data: config, error: configError } = await supabaseClient
      .from('google_merchant_config')
      .select('*')
      .single();

    if (configError || !config) {
      throw new Error('Google Merchant not connected');
    }

    // Check if token needs refresh (expires in less than 5 minutes)
    const expiresAt = new Date(config.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return new Response(
        JSON.stringify({
          accessToken: decryptToken(config.access_token_encrypted),
          expiresAt: config.token_expires_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Refreshing Google OAuth token...');

    // Refresh the token
    const refreshToken = decryptToken(config.refresh_token_encrypted);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_MERCHANT_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_MERCHANT_CLIENT_SECRET') ?? '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Update database with new token
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const { error: updateError } = await supabaseClient
      .from('google_merchant_config')
      .update({
        access_token_encrypted: encryptedAccessToken,
        token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    if (updateError) {
      console.error('Failed to update tokens:', updateError);
      throw updateError;
    }

    console.log('✅ Token refreshed successfully');

    return new Response(
      JSON.stringify({
        accessToken: tokens.access_token,
        expiresAt: newExpiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-google-token:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
