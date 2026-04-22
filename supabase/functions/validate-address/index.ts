import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddressInput {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

function extractComponents(components: any[]): AddressComponents {
  return components.reduce((acc: AddressComponents, comp: any) => {
    if (comp.types.includes('route') || comp.types.includes('street_address')) {
      acc.street = comp.long_name;
    }
    if (comp.types.includes('locality')) {
      acc.city = comp.long_name;
    }
    if (comp.types.includes('administrative_area_level_1')) {
      acc.state = comp.long_name;
    }
    if (comp.types.includes('postal_code')) {
      acc.zip = comp.long_name;
    }
    if (comp.types.includes('country')) {
      acc.country = comp.long_name;
    }
    return acc;
  }, {});
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { street, city, state, zip, country }: AddressInput = await req.json();
    
    console.log('Validating address:', { street, city, state, zip, country });
    
    // Build full address string
    const fullAddress = `${street}, ${city}, ${state} ${zip}, ${country}`;
    
    // Call Google Geocoding API
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(apiUrl);
    
    const data = await response.json();
    
    console.log('Google API response status:', data.status);
    
    if (data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({
          isValid: false,
          isDeliverable: false,
          confidence: 'low',
          message: 'No matching address found. Please check your input.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (data.status !== 'OK') {
      console.error('Geocoding API error:', data.status, data.error_message);
      throw new Error(`Geocoding API error: ${data.status}`);
    }
    
    const result = data.results[0];
    const locationType = result.geometry.location_type;
    const partialMatch = result.partial_match || false;
    
    console.log('Location type:', locationType, 'Partial match:', partialMatch);
    
    // Determine deliverability
    const isDeliverable = ['ROOFTOP', 'RANGE_INTERPOLATED'].includes(locationType);
    const confidence = locationType === 'ROOFTOP' 
      ? 'high' 
      : locationType === 'RANGE_INTERPOLATED' 
      ? 'medium' 
      : 'low';
    
    // Extract address components
    const components = extractComponents(result.address_components);
    
    // Build suggestions for partial matches
    const suggestions = partialMatch && data.results.length > 1
      ? data.results.slice(0, 3).map((r: any) => ({
          formattedAddress: r.formatted_address,
          components: extractComponents(r.address_components),
        }))
      : [];
    
    return new Response(
      JSON.stringify({
        isValid: true,
        isDeliverable,
        confidence,
        formattedAddress: result.formatted_address,
        suggestions: partialMatch ? suggestions : undefined,
        message: partialMatch 
          ? 'Partial address match found. Please verify.' 
          : isDeliverable 
          ? 'Address verified successfully' 
          : 'Address found but deliverability uncertain',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Address validation error:', error);
    
    // Check if it's an API key restriction error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('REQUEST_DENIED') || errorMessage.includes('referer restrictions')) {
      console.error('⚠️ Google Maps API key has HTTP referrer restrictions. Edge functions need an API key with server-side restrictions (IP or none).');
      return new Response(
        JSON.stringify({
          isValid: false,
          isDeliverable: false,
          confidence: 'low',
          message: 'Address validation service configuration error. Please contact support.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        isValid: false,
        isDeliverable: false,
        confidence: 'low',
        message: 'Validation service temporarily unavailable',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
