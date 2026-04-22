-- Add shipping label columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT,
ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS awb_code TEXT;

COMMENT ON COLUMN orders.shipping_label_url IS 'URL to the generated PDF shipping label stored in Supabase storage';
COMMENT ON COLUMN orders.shiprocket_order_id IS 'ShipRocket order ID for reference';
COMMENT ON COLUMN orders.shiprocket_shipment_id IS 'ShipRocket shipment ID';
COMMENT ON COLUMN orders.awb_code IS 'Air Waybill code (tracking number) from carrier';