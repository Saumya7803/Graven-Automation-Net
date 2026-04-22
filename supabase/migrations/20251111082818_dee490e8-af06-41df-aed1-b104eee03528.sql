-- Create trigger function to automatically sync primary images
CREATE OR REPLACE FUNCTION sync_primary_image_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle INSERT or UPDATE when is_primary = true
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_primary = true THEN
    
    -- Update the product's image_url
    UPDATE products
    SET 
      image_url = NEW.image_url,
      updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Unset other primary images for this product (only one primary allowed)
    UPDATE product_images
    SET is_primary = false
    WHERE product_id = NEW.product_id 
      AND id != NEW.id 
      AND is_primary = true;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE of primary image
  IF TG_OP = 'DELETE' AND OLD.is_primary = true THEN
    
    -- Try to find another image to make primary and update products.image_url
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
    
    -- If no next image exists, set to NULL
    UPDATE products
    SET image_url = NULL, updated_at = NOW()
    WHERE id = OLD.product_id 
      AND NOT EXISTS (
        SELECT 1 FROM product_images 
        WHERE product_id = OLD.product_id AND id != OLD.id
      );
    
    -- If there was a next image, make it primary
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
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_primary_image_trigger ON product_images;

-- Create trigger that fires on INSERT, UPDATE of relevant columns, or DELETE
CREATE TRIGGER sync_primary_image_trigger
AFTER INSERT OR UPDATE OF is_primary, image_url OR DELETE
ON product_images
FOR EACH ROW
EXECUTE FUNCTION sync_primary_image_on_change();