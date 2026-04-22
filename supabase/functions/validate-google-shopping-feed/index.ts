import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationIssue {
  type: 'error' | 'warning';
  field: string;
  message: string;
  productId?: string;
}

interface ValidationRule {
  field: string;
  required: boolean;
  format?: RegExp;
  maxLength?: number;
  allowedValues?: string[];
}

const GOOGLE_SHOPPING_RULES: ValidationRule[] = [
  { field: 'g:id', required: true },
  { field: 'title', required: true, maxLength: 150 },
  { field: 'description', required: true, maxLength: 5000 },
  { field: 'g:link', required: true, format: /^https?:\/\/.+/ },
  { field: 'g:image_link', required: true, format: /^https?:\/\/.+/ },
  { field: 'g:price', required: true, format: /^\d+\.\d{2} [A-Z]{3}$/ },
  { field: 'g:availability', required: true, allowedValues: ['in_stock', 'out_of_stock', 'preorder', 'backorder'] },
  { field: 'g:condition', required: true, allowedValues: ['new', 'refurbished', 'used'] },
  { field: 'g:brand', required: true },
  { field: 'g:mpn', required: true }, // MPN (SKU) is now required
  { field: 'g:google_product_category', required: false },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('Starting feed validation...');

    // Fetch the feed from generate-google-shopping-feed
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const feedUrl = `${supabaseUrl}/functions/v1/generate-google-shopping-feed`;
    
    console.log('Fetching feed from:', feedUrl);
    const feedResponse = await fetch(feedUrl);
    
    if (!feedResponse.ok) {
      throw new Error(`Failed to fetch feed: ${feedResponse.status} ${feedResponse.statusText}`);
    }

    const feedXml = await feedResponse.text();
    console.log('Feed fetched, length:', feedXml.length);

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(feedXml, 'text/xml');
    
    if (!xmlDoc) {
      throw new Error('Failed to parse XML');
    }

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML parsing error: ${parseError.textContent}`);
    }

    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Get all items
    const items = Array.from(xmlDoc.querySelectorAll('item'));
    console.log(`Found ${items.length} products to validate`);

    if (items.length === 0) {
      errors.push({
        type: 'error',
        field: 'feed',
        message: 'Feed contains no products',
      });
    }

    // Validate each item
    items.forEach((node) => {
      const item = node as Element;
      const getElementText = (tagName: string): string => {
        const element = item.querySelector(tagName);
        return element?.textContent?.trim() || '';
      };

      const productId = getElementText('g\\:id') || getElementText('id');

      // Validate against rules
      GOOGLE_SHOPPING_RULES.forEach((rule) => {
        const value = getElementText(rule.field);

        // Check required fields
        if (rule.required && !value) {
          errors.push({
            type: 'error',
            field: rule.field,
            message: `Missing required field: ${rule.field}`,
            productId,
          });
          return;
        }

        // Skip validation if value is empty and field is optional
        if (!value && !rule.required) {
          // Add warning for recommended fields
          if (['g:google_product_category'].includes(rule.field)) {
            warnings.push({
              type: 'warning',
              field: rule.field,
              message: `Missing ${rule.field} (recommended for better visibility)`,
              productId,
            });
          }
          return;
        }

        // Check format
        if (rule.format && value && !rule.format.test(value)) {
          errors.push({
            type: 'error',
            field: rule.field,
            message: `Invalid format for ${rule.field}: "${value}"`,
            productId,
          });
        }

        // Check max length
        if (rule.maxLength && value && value.length > rule.maxLength) {
          errors.push({
            type: 'error',
            field: rule.field,
            message: `${rule.field} exceeds maximum length of ${rule.maxLength} characters (current: ${value.length})`,
            productId,
          });
        }

        // Check allowed values
        if (rule.allowedValues && value && !rule.allowedValues.includes(value)) {
          errors.push({
            type: 'error',
            field: rule.field,
            message: `Invalid value for ${rule.field}: "${value}". Allowed values: ${rule.allowedValues.join(', ')}`,
            productId,
          });
        }
      });

      // Additional quality checks
      const description = getElementText('description');
      if (description && description.length < 50) {
        warnings.push({
          type: 'warning',
          field: 'description',
          message: `Description is too short (${description.length} chars). Recommended minimum: 50 characters`,
          productId,
        });
      }

      const imageLink = getElementText('g\\:image_link');
      if (imageLink && imageLink.includes('placeholder.svg')) {
        warnings.push({
          type: 'warning',
          field: 'g:image_link',
          message: 'Using placeholder image. Consider uploading actual product images',
          productId,
        });
      }

      const availability = getElementText('g\\:availability');
      if (availability === 'out_of_stock') {
        warnings.push({
          type: 'warning',
          field: 'g:availability',
          message: 'Product is out of stock',
          productId,
        });
      }
    });

    const validationTime = Date.now() - startTime;

    const results = {
      valid: errors.length === 0,
      productCount: items.length,
      errors,
      warnings,
      summary: {
        totalProducts: items.length,
        productsWithErrors: new Set(errors.map(e => e.productId).filter(Boolean)).size,
        productsWithWarnings: new Set(warnings.map(w => w.productId).filter(Boolean)).size,
        validationTime: `${validationTime}ms`,
      },
    };

    console.log('Validation complete:', {
      valid: results.valid,
      productCount: results.productCount,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        productCount: 0,
        errors: [{
          type: 'error',
          field: 'feed',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        }],
        warnings: [],
        summary: {
          totalProducts: 0,
          productsWithErrors: 0,
          productsWithWarnings: 0,
          validationTime: `${Date.now() - startTime}ms`,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
