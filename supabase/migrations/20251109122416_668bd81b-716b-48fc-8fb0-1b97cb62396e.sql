-- Create validation function to prevent quotations from becoming 'quoted' or 'finalized' with incomplete pricing
CREATE OR REPLACE FUNCTION public.validate_quotation_pricing()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate when moving TO 'quoted' or 'finalized' FROM other statuses
  IF NEW.status IN ('quoted', 'finalized') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('quoted', 'finalized')) THEN
    
    -- Check if any items have incomplete pricing
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce pricing validation
DROP TRIGGER IF EXISTS validate_quotation_pricing_trigger ON public.quotation_requests;
CREATE TRIGGER validate_quotation_pricing_trigger
  BEFORE UPDATE ON public.quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quotation_pricing();