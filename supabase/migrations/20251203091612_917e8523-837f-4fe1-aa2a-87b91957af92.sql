-- Fix function search_path security issue for all custom functions

-- Fix update_seo_updated_at (already has correct search_path, but let's ensure)
CREATE OR REPLACE FUNCTION public.update_seo_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix create_user_notification_preferences
CREATE OR REPLACE FUNCTION public.create_user_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- Fix get_engagement_by_hour
CREATE OR REPLACE FUNCTION public.get_engagement_by_hour()
 RETURNS TABLE(hour_of_day integer, total_sent bigint, total_clicked bigint, click_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM nl.sent_at)::INTEGER as hour_of_day,
    COUNT(DISTINCT nl.id) as total_sent,
    COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END) as total_clicked,
    ROUND(
      (COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END)::decimal / 
       NULLIF(COUNT(DISTINCT nl.id), 0) * 100), 2
    ) as click_rate
  FROM notification_logs nl
  LEFT JOIN notification_interactions ni ON nl.id = ni.notification_log_id
  WHERE nl.sent_at >= NOW() - INTERVAL '30 days'
  GROUP BY hour_of_day
  ORDER BY hour_of_day;
END;
$function$;

-- Fix calculate_engagement_score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(cart_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  score NUMERIC := 0;
  email_opens INT;
  link_clicks INT;
  page_visits INT;
  checkout_visits INT;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'email_opened'),
    COUNT(*) FILTER (WHERE interaction_type = 'link_clicked'),
    COUNT(*) FILTER (WHERE interaction_type = 'page_viewed'),
    COUNT(*) FILTER (WHERE interaction_type = 'checkout_abandoned')
  INTO email_opens, link_clicks, page_visits, checkout_visits
  FROM public.cart_recovery_interactions
  WHERE abandoned_cart_id = cart_id;

  score := (email_opens * 10) + 
           (link_clicks * 25) + 
           (page_visits * 35) + 
           (checkout_visits * 60);

  RETURN score;
END;
$function$;

-- Fix update_cart_engagement_score
CREATE OR REPLACE FUNCTION public.update_cart_engagement_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  UPDATE public.abandoned_carts
  SET engagement_score = public.calculate_engagement_score(NEW.abandoned_cart_id),
      updated_at = now()
  WHERE id = NEW.abandoned_cart_id;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_quotation_pricing
CREATE OR REPLACE FUNCTION public.validate_quotation_pricing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.status IN ('quoted', 'finalized') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('quoted', 'finalized')) THEN
    
    IF EXISTS (
      SELECT 1 
      FROM public.quotation_request_items 
      WHERE quotation_request_id = NEW.id 
      AND (unit_price IS NULL OR unit_price <= 0 OR 
           final_price IS NULL OR final_price <= 0)
    ) THEN
      RAISE EXCEPTION 'Cannot set quotation status to % with incomplete item pricing. Please set unit prices and final prices for all items.', NEW.status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix log_quotation_status_change
CREATE OR REPLACE FUNCTION public.log_quotation_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix log_quotation_pricing_change
CREATE OR REPLACE FUNCTION public.log_quotation_pricing_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
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
$function$;

-- Fix log_quotation_notes_change
CREATE OR REPLACE FUNCTION public.log_quotation_notes_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix log_quotation_item_changes
CREATE OR REPLACE FUNCTION public.log_quotation_item_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix sync_primary_images_to_products
CREATE OR REPLACE FUNCTION public.sync_primary_images_to_products()
 RETURNS TABLE(updated_count integer, total_products integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  v_updated_count INTEGER;
  v_total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_count FROM products;
  
  WITH primary_images AS (
    SELECT DISTINCT ON (product_id) 
      product_id, 
      image_url
    FROM product_images
    WHERE is_primary = true
    ORDER BY product_id, created_at DESC
  )
  UPDATE products p
  SET 
    image_url = pi.image_url,
    updated_at = NOW()
  FROM primary_images pi
  WHERE p.id = pi.product_id
    AND (p.image_url IS NULL OR p.image_url != pi.image_url);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_updated_count, v_total_count;
END;
$function$;

-- Fix sync_primary_image_on_change
CREATE OR REPLACE FUNCTION public.sync_primary_image_on_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_primary = true THEN
    
    UPDATE products
    SET 
      image_url = NEW.image_url,
      updated_at = NOW()
    WHERE id = NEW.product_id;
    
    UPDATE product_images
    SET is_primary = false
    WHERE product_id = NEW.product_id 
      AND id != NEW.id 
      AND is_primary = true;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.is_primary = true THEN
    
    WITH next_image AS (
      SELECT id, image_url
      FROM product_images
      WHERE product_id = OLD.product_id
        AND id != OLD.id
      ORDER BY created_at DESC
      LIMIT 1
    )
    UPDATE products p
    SET 
      image_url = ni.image_url,
      updated_at = NOW()
    FROM next_image ni
    WHERE p.id = OLD.product_id;
    
    UPDATE products
    SET image_url = NULL, updated_at = NOW()
    WHERE id = OLD.product_id 
      AND NOT EXISTS (
        SELECT 1 FROM product_images 
        WHERE product_id = OLD.product_id AND id != OLD.id
      );
    
    UPDATE product_images
    SET is_primary = true
    WHERE product_id = OLD.product_id
      AND id = (
        SELECT id FROM product_images
        WHERE product_id = OLD.product_id AND id != OLD.id
        ORDER BY created_at DESC
        LIMIT 1
      );
    
    RETURN OLD;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;