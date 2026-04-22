-- Fix Function Search Path Mutable security warning
-- This sets an immutable search_path for all custom functions

-- Update update_updated_at_column function (without IF EXISTS)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Fix all other custom functions dynamically
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
    LOOP
        -- Build function signature with arguments
        func_signature := format('%I.%I(%s)', 
            func_record.schema_name, 
            func_record.function_name,
            func_record.args);
            
        -- Set search_path for each function
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', func_signature);
        
        RAISE NOTICE 'Fixed function: %', func_signature;
    END LOOP;
END $$;