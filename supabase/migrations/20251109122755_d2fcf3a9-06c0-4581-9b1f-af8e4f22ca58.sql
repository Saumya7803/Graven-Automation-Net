-- Create quotation_audit_log table for comprehensive audit trail
CREATE TABLE quotation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id UUID NOT NULL REFERENCES quotation_requests(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'status_change', 'pricing_change', 'item_change', 'notes_change', 'created'
  field_name TEXT, -- e.g., 'status', 'admin_notes', 'unit_price', 'quantity'
  old_value JSONB, -- Previous value (flexible format)
  new_value JSONB, -- New value (flexible format)
  changed_by UUID, -- Who made the change (references auth.users, but we don't use FK)
  change_summary TEXT, -- Human-readable summary
  metadata JSONB DEFAULT '{}', -- Additional context (e.g., item_id, product_name)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotation_audit_log_quotation_id ON quotation_audit_log(quotation_request_id);
CREATE INDEX idx_quotation_audit_log_created_at ON quotation_audit_log(created_at DESC);
CREATE INDEX idx_quotation_audit_log_change_type ON quotation_audit_log(change_type);

-- Enable RLS
ALTER TABLE quotation_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view quotation audit logs"
  ON quotation_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view audit logs for their quotations
CREATE POLICY "Users can view their quotation audit logs"
  ON quotation_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotation_requests
      WHERE quotation_requests.id = quotation_audit_log.quotation_request_id
      AND quotation_requests.user_id = auth.uid()
    )
  );

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_quotation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id,
      change_type,
      field_name,
      old_value,
      new_value,
      changed_by,
      change_summary
    ) VALUES (
      NEW.id,
      'status_change',
      'status',
      to_jsonb(OLD.status),
      to_jsonb(NEW.status),
      auth.uid(),
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER quotation_status_change_trigger
  AFTER UPDATE ON quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_quotation_status_change();

-- Function to log pricing changes
CREATE OR REPLACE FUNCTION log_quotation_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Track total_amount changes
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      old_value, new_value, changed_by, change_summary
    ) VALUES (
      NEW.id, 'pricing_change', 'total_amount',
      to_jsonb(OLD.total_amount), to_jsonb(NEW.total_amount),
      auth.uid(),
      'Total amount changed from ₹' || COALESCE(OLD.total_amount::TEXT, '0') || ' to ₹' || COALESCE(NEW.total_amount::TEXT, '0')
    );
  END IF;
  
  -- Track discount changes
  IF OLD.discount_percentage IS DISTINCT FROM NEW.discount_percentage OR
     OLD.discount_amount IS DISTINCT FROM NEW.discount_amount THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      old_value, new_value, changed_by, change_summary,
      metadata
    ) VALUES (
      NEW.id, 'pricing_change', 'discount',
      jsonb_build_object('percentage', OLD.discount_percentage, 'amount', OLD.discount_amount),
      jsonb_build_object('percentage', NEW.discount_percentage, 'amount', NEW.discount_amount),
      auth.uid(),
      'Discount changed from ' || COALESCE(OLD.discount_percentage::TEXT, '0') || '% to ' || COALESCE(NEW.discount_percentage::TEXT, '0') || '%',
      jsonb_build_object('old_percentage', OLD.discount_percentage, 'new_percentage', NEW.discount_percentage)
    );
  END IF;
  
  -- Track final_amount changes
  IF OLD.final_amount IS DISTINCT FROM NEW.final_amount THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      old_value, new_value, changed_by, change_summary
    ) VALUES (
      NEW.id, 'pricing_change', 'final_amount',
      to_jsonb(OLD.final_amount), to_jsonb(NEW.final_amount),
      auth.uid(),
      'Final amount changed from ₹' || COALESCE(OLD.final_amount::TEXT, '0') || ' to ₹' || COALESCE(NEW.final_amount::TEXT, '0')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER quotation_pricing_change_trigger
  AFTER UPDATE ON quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_quotation_pricing_change();

-- Function to log admin notes changes
CREATE OR REPLACE FUNCTION log_quotation_notes_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.admin_notes IS DISTINCT FROM NEW.admin_notes THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      old_value, new_value, changed_by, change_summary
    ) VALUES (
      NEW.id, 'notes_change', 'admin_notes',
      to_jsonb(COALESCE(OLD.admin_notes, '')),
      to_jsonb(COALESCE(NEW.admin_notes, '')),
      auth.uid(),
      'Admin notes updated'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER quotation_notes_change_trigger
  AFTER UPDATE ON quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_quotation_notes_change();

-- Function to log item-level changes
CREATE OR REPLACE FUNCTION log_quotation_item_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      new_value, changed_by, change_summary, metadata
    ) VALUES (
      NEW.quotation_request_id, 'item_change', 'item_added',
      jsonb_build_object(
        'product_name', NEW.product_name,
        'quantity', NEW.quantity,
        'unit_price', NEW.unit_price
      ),
      auth.uid(),
      'Added item: ' || NEW.product_name || ' (Qty: ' || NEW.quantity || ')',
      jsonb_build_object('item_id', NEW.id, 'product_id', NEW.product_id)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log quantity changes
    IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
      INSERT INTO quotation_audit_log (
        quotation_request_id, change_type, field_name,
        old_value, new_value, changed_by, change_summary, metadata
      ) VALUES (
        NEW.quotation_request_id, 'item_change', 'quantity',
        to_jsonb(OLD.quantity), to_jsonb(NEW.quantity),
        auth.uid(),
        'Changed quantity for ' || NEW.product_name || ' from ' || OLD.quantity || ' to ' || NEW.quantity,
        jsonb_build_object('item_id', NEW.id, 'product_name', NEW.product_name)
      );
    END IF;
    
    -- Log unit price changes
    IF OLD.unit_price IS DISTINCT FROM NEW.unit_price THEN
      INSERT INTO quotation_audit_log (
        quotation_request_id, change_type, field_name,
        old_value, new_value, changed_by, change_summary, metadata
      ) VALUES (
        NEW.quotation_request_id, 'item_change', 'unit_price',
        to_jsonb(OLD.unit_price), to_jsonb(NEW.unit_price),
        auth.uid(),
        'Changed unit price for ' || NEW.product_name || ' from ₹' || COALESCE(OLD.unit_price::TEXT, '0') || ' to ₹' || COALESCE(NEW.unit_price::TEXT, '0'),
        jsonb_build_object('item_id', NEW.id, 'product_name', NEW.product_name)
      );
    END IF;

    -- Log discount percentage changes
    IF OLD.discount_percentage IS DISTINCT FROM NEW.discount_percentage THEN
      INSERT INTO quotation_audit_log (
        quotation_request_id, change_type, field_name,
        old_value, new_value, changed_by, change_summary, metadata
      ) VALUES (
        NEW.quotation_request_id, 'item_change', 'discount_percentage',
        to_jsonb(OLD.discount_percentage), to_jsonb(NEW.discount_percentage),
        auth.uid(),
        'Changed discount for ' || NEW.product_name || ' from ' || COALESCE(OLD.discount_percentage::TEXT, '0') || '% to ' || COALESCE(NEW.discount_percentage::TEXT, '0') || '%',
        jsonb_build_object('item_id', NEW.id, 'product_name', NEW.product_name)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO quotation_audit_log (
      quotation_request_id, change_type, field_name,
      old_value, changed_by, change_summary, metadata
    ) VALUES (
      OLD.quotation_request_id, 'item_change', 'item_removed',
      jsonb_build_object(
        'product_name', OLD.product_name,
        'quantity', OLD.quantity,
        'unit_price', OLD.unit_price
      ),
      auth.uid(),
      'Removed item: ' || OLD.product_name,
      jsonb_build_object('item_id', OLD.id, 'product_id', OLD.product_id)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER quotation_item_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON quotation_request_items
  FOR EACH ROW
  EXECUTE FUNCTION log_quotation_item_changes();

-- Backfill existing quotations with creation entries
INSERT INTO quotation_audit_log (
  quotation_request_id,
  change_type,
  field_name,
  new_value,
  change_summary,
  created_at
)
SELECT 
  id,
  'created',
  'quotation',
  jsonb_build_object(
    'customer_name', customer_name,
    'customer_email', customer_email,
    'status', status
  ),
  'Quotation created',
  created_at
FROM quotation_requests
WHERE NOT EXISTS (
  SELECT 1 FROM quotation_audit_log 
  WHERE quotation_audit_log.quotation_request_id = quotation_requests.id
);