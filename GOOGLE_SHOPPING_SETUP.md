# Google Shopping Feed Integration

This document provides instructions for setting up and using the Google Shopping XML feed integration.

## Overview

The automated Google Shopping feed is now available at:
```
https://izphkdvrexejctdabplp.supabase.co/functions/v1/generate-google-shopping-feed
```

This feed automatically pulls all active products from your database and formats them according to Google Shopping requirements.

## Database Fields

The following fields have been added to the `products` table:

| Field | Type | Description | Default Value |
|-------|------|-------------|---------------|
| `gtin` | text | Global Trade Item Number (barcode) | null |
| `brand` | text | Product brand name | "Schneider Electric" |
| `condition` | text | Product condition | "new" |
| `google_product_category` | text | Google product taxonomy | "Hardware > Power & Electrical Supplies > Power Controllers & Transformers" |
| `image_url` | text | Main product image URL | null |

## Next Steps

### 1. Populate Product Data

You need to add the missing data for your existing products:

**Required for Google Shopping:**
- **GTIN**: Add product barcodes/GTINs to each product
- **Image URLs**: Ensure all products have valid image URLs
- **Brand**: Already set to "Schneider Electric" by default
- **Condition**: Already set to "new" by default

**Example SQL to update products:**
```sql
-- Update a specific product
UPDATE products 
SET 
  gtin = '1234567890123',
  image_url = 'https://your-domain.com/images/product.jpg'
WHERE sku = 'VFD-001';
```

### 2. Set Up Google Merchant Center

1. **Create Account**
   - Go to [Google Merchant Center](https://merchants.google.com/)
   - Sign up or sign in with your Google account
   - Complete business information verification

2. **Add Your Feed**
   - Navigate to: Products → Feeds
   - Click "+" to create a new feed
   - Select "Primary Feed"
   - Choose country: India
   - Select language: English
   - Feed name: "VFD Products Feed"
   - Input type: "Scheduled fetch"
   - Feed URL: `https://izphkdvrexejctdabplp.supabase.co/functions/v1/generate-google-shopping-feed`
   - Fetch schedule: Daily (recommended)
   - Time: Choose off-peak hours

3. **Configure Shipping & Tax**
   - Go to: Settings → Shipping and returns
   - Add your shipping rates for India
   - Configure return policy
   - Go to: Settings → Tax
   - Configure tax settings (GST for India)

4. **Verify Website**
   - Go to: Settings → Business information
   - Add and verify your website URL
   - Use one of the verification methods (HTML file, meta tag, Google Analytics, or Tag Manager)

### 3. Monitor Feed Status

After submitting your feed:

1. **Initial Processing** (3-5 hours)
   - Google will fetch and validate your feed
   - Check for any errors in the "Processing" tab

2. **Product Approval** (3-5 days)
   - Products will be reviewed by Google
   - Fix any disapproved products
   - Common issues:
     - Missing GTIN
     - Low-quality images
     - Incomplete descriptions
     - Pricing issues

3. **Feed Health**
   - Monitor feed health regularly in Merchant Center
   - Address warnings and errors promptly
   - Update product data as needed

## Feed Format

The feed generates RSS 2.0 XML with Google Shopping namespace:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VFD Products - Variable Frequency Drives</title>
    <item>
      <g:id>VFD-001</g:id>
      <g:title>Altivar 12 VFD 0.37kW</g:title>
      <g:description>Variable frequency drive...</g:description>
      <g:link>https://your-domain.com/product/...</g:link>
      <g:image_link>https://your-domain.com/images/...</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>15000 INR</g:price>
      <g:brand>Schneider Electric</g:brand>
      <g:gtin>1234567890123</g:gtin>
      <g:google_product_category>Hardware > Power & Electrical Supplies > Power Controllers & Transformers</g:google_product_category>
      <g:product_type>Industrial Equipment > Variable Frequency Drives > Altivar 12</g:product_type>
      <g:custom_label_0>Altivar 12</g:custom_label_0>
      <g:custom_label_1>0.37kW - 15kW</g:custom_label_1>
    </item>
  </channel>
</rss>
```

## Feed Updates

The feed automatically updates when:
- Products are added, updated, or removed
- Stock quantities change
- Prices change
- Product information is modified

**Refresh frequency:** The feed is generated in real-time on each request, with a 1-hour cache.

## Testing Your Feed

1. **Google Feed Validator**
   - Use [Google's Feed Rules Test](https://support.google.com/merchants/answer/7052112)
   - Paste your feed URL
   - Review any warnings or errors

2. **Manual Validation**
   - Open feed URL in browser
   - Verify XML structure is correct
   - Check that all products appear
   - Ensure images load correctly

## Google Shopping Campaigns (Optional)

Once your products are approved:

1. **Create Google Ads Account**
   - Link to Merchant Center
   - Set up billing information

2. **Create Shopping Campaign**
   - Campaign type: Shopping
   - Sales country: India
   - Merchant Center account: Select your account
   - Campaign priority: Medium
   - Budget: Start with ₹10,000-20,000/month

3. **Optimize Performance**
   - Monitor click-through rates
   - Adjust bids for high-performing products
   - Use negative keywords to filter irrelevant searches
   - Test different product titles and descriptions

## Troubleshooting

### Feed Not Loading
- Check that the edge function is deployed
- Verify products exist in database
- Check product `is_active` status
- Review edge function logs for errors

### Products Not Approved
- Ensure GTIN is valid
- Check image quality (min 100x100px, recommended 800x800px)
- Verify product descriptions are complete
- Ensure pricing is accurate

### Missing Products in Feed
- Verify `is_active = true`
- Check that required fields are populated
- Review edge function logs

## Support

For issues with:
- **Feed generation**: Check edge function logs
- **Google Merchant Center**: Visit [Google Merchant Center Help](https://support.google.com/merchants)
- **Product data**: Update products through admin panel

## Additional Resources

- [Google Merchant Center Help](https://support.google.com/merchants)
- [Product Data Specification](https://support.google.com/merchants/answer/7052112)
- [Google Shopping Policies](https://support.google.com/merchants/answer/6149970)
- [Feed Optimization Best Practices](https://support.google.com/merchants/answer/7052112)
