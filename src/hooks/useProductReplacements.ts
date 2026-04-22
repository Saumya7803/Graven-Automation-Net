import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Replacement {
  id: string;
  replacement_type: 'oem_recommended' | 'same_brand_series' | 'functional_equivalent' | 'compatible_alternative';
  compatibility_notes: string | null;
  display_order: number;
  product: {
    id: string;
    name: string;
    sku: string;
    series: string;
    power_range: string;
    brand: string | null;
    image_url: string | null;
    is_active: boolean;
  };
}

const REPLACEMENT_TYPE_ORDER = {
  'oem_recommended': 0,
  'same_brand_series': 1,
  'functional_equivalent': 2,
  'compatible_alternative': 3
};

export const REPLACEMENT_TYPE_LABELS: Record<string, string> = {
  'oem_recommended': 'OEM Recommended',
  'same_brand_series': 'Same Brand – New Series',
  'functional_equivalent': 'Functional Equivalent',
  'compatible_alternative': 'Compatible Alternative'
};

export function useProductReplacements(productId: string | undefined) {
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setReplacements([]);
      setLoading(false);
      return;
    }

    const fetchReplacements = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("product_replacements")
          .select(`
            id,
            replacement_type,
            compatibility_notes,
            display_order,
            replacement_product_id,
            products!product_replacements_replacement_product_id_fkey (
              id,
              name,
              sku,
              series,
              power_range,
              brand,
              image_url,
              is_active
            )
          `)
          .eq("product_id", productId)
          .order("display_order", { ascending: true });

        if (fetchError) throw fetchError;

        // Transform data to expected format
        const transformedData: Replacement[] = (data || [])
          .filter((item: any) => item.products) // Filter out any with missing product
          .map((item: any) => ({
            id: item.id,
            replacement_type: item.replacement_type,
            compatibility_notes: item.compatibility_notes,
            display_order: item.display_order,
            product: item.products
          }))
          // Sort by replacement type priority, then display_order
          .sort((a, b) => {
            const typeOrderA = REPLACEMENT_TYPE_ORDER[a.replacement_type] ?? 99;
            const typeOrderB = REPLACEMENT_TYPE_ORDER[b.replacement_type] ?? 99;
            if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
            return a.display_order - b.display_order;
          });

        setReplacements(transformedData);
      } catch (err: any) {
        console.error("Error fetching replacements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReplacements();
  }, [productId]);

  return { replacements, loading, error, hasReplacements: replacements.length > 0 };
}
