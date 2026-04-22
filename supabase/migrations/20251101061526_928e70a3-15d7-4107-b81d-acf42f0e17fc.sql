-- Drop webhook triggers that are causing the "schema 'net' does not exist" error
DROP TRIGGER IF EXISTS on_rfq_created ON quotation_requests;
DROP TRIGGER IF EXISTS on_rfq_updated ON quotation_requests;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP TRIGGER IF EXISTS on_order_updated ON orders;

-- Drop the webhook notification functions
DROP FUNCTION IF EXISTS notify_rfq_webhook();
DROP FUNCTION IF EXISTS notify_order_webhook();