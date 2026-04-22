-- Create function to sync primary images from product_images to products.image_url
CREATE OR REPLACE FUNCTION sync_primary_images_to_products()
RETURNS TABLE(updated_count INTEGER, total_products INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_updated_count INTEGER;
  v_total_count INTEGER;
BEGIN
  -- Get total product count
  SELECT COUNT(*) INTO v_total_count FROM products;
  
  -- Update products.image_url with primary images from product_images
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
$$;