import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ModelMaster {
  id: string;
  model_number: string;
  category_slug: string;
  brand_slug: string;
  series_slug: string;
  name: string;
  short_description: string | null;
  lifecycle_status: "Active" | "Discontinued" | "Obsolete";
  discontinued_at: string | null;
  specifications: Record<string, string>;
  key_features: string[];
  power_range: string | null;
  replacement_models: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelMasterInput {
  model_number: string;
  category_slug: string;
  brand_slug: string;
  series_slug: string;
  name: string;
  short_description?: string;
  lifecycle_status?: "Active" | "Discontinued" | "Obsolete";
  discontinued_at?: string;
  specifications?: Record<string, string>;
  key_features?: string[];
  power_range?: string;
  replacement_models?: string[];
  is_active?: boolean;
}

export function useModelMaster() {
  const [models, setModels] = useState<ModelMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async (filters?: {
    category_slug?: string;
    brand_slug?: string;
    series_slug?: string;
    lifecycle_status?: string;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("model_master")
        .select("*")
        .order("model_number", { ascending: true });

      if (filters?.category_slug) {
        query = query.eq("category_slug", filters.category_slug);
      }
      if (filters?.brand_slug) {
        query = query.eq("brand_slug", filters.brand_slug);
      }
      if (filters?.series_slug) {
        query = query.eq("series_slug", filters.series_slug);
      }
      if (filters?.lifecycle_status) {
        query = query.eq("lifecycle_status", filters.lifecycle_status);
      }
      if (filters?.search) {
        query = query.or(
          `model_number.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setModels(
        (data || []).map((m) => ({
          ...m,
          specifications: (m.specifications as Record<string, string>) || {},
          key_features: (m.key_features as string[]) || [],
          replacement_models: m.replacement_models || [],
          lifecycle_status: m.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch models";
      setError(message);
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  };

  const createModel = async (input: ModelMasterInput): Promise<ModelMaster | null> => {
    try {
      const { data, error } = await supabase
        .from("model_master")
        .insert({
          ...input,
          specifications: input.specifications || {},
          key_features: input.key_features || [],
          replacement_models: input.replacement_models || [],
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Model created successfully");
      await fetchModels();
      
      return {
        ...data,
        specifications: (data.specifications as Record<string, string>) || {},
        key_features: (data.key_features as string[]) || [],
        replacement_models: data.replacement_models || [],
        lifecycle_status: data.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create model";
      toast.error(message);
      console.error("Error creating model:", err);
      return null;
    }
  };

  const updateModel = async (
    id: string,
    input: Partial<ModelMasterInput>
  ): Promise<ModelMaster | null> => {
    try {
      const { data, error } = await supabase
        .from("model_master")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Model updated successfully");
      await fetchModels();

      return {
        ...data,
        specifications: (data.specifications as Record<string, string>) || {},
        key_features: (data.key_features as string[]) || [],
        replacement_models: data.replacement_models || [],
        lifecycle_status: data.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update model";
      toast.error(message);
      console.error("Error updating model:", err);
      return null;
    }
  };

  const deleteModel = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("model_master").delete().eq("id", id);

      if (error) throw error;

      toast.success("Model deleted successfully");
      await fetchModels();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete model";
      toast.error(message);
      console.error("Error deleting model:", err);
      return false;
    }
  };

  const getModelById = async (id: string): Promise<ModelMaster | null> => {
    try {
      const { data, error } = await supabase
        .from("model_master")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        specifications: (data.specifications as Record<string, string>) || {},
        key_features: (data.key_features as string[]) || [],
        replacement_models: data.replacement_models || [],
        lifecycle_status: data.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
      };
    } catch (err: unknown) {
      console.error("Error fetching model:", err);
      return null;
    }
  };

  const getModelsBySelection = useCallback(async (
    categorySlug: string,
    brandSlug: string,
    seriesSlug: string
  ): Promise<ModelMaster[]> => {
    try {
      const { data, error } = await supabase
        .from("model_master")
        .select("*")
        .eq("category_slug", categorySlug)
        .eq("brand_slug", brandSlug)
        .eq("series_slug", seriesSlug)
        .eq("is_active", true)
        .order("lifecycle_status", { ascending: true })
        .order("model_number", { ascending: true });

      if (error) throw error;

      return (data || []).map((m) => ({
        ...m,
        specifications: (m.specifications as Record<string, string>) || {},
        key_features: (m.key_features as string[]) || [],
        replacement_models: m.replacement_models || [],
        lifecycle_status: m.lifecycle_status as "Active" | "Discontinued" | "Obsolete",
      }));
    } catch (err: unknown) {
      console.error("Error fetching models by selection:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    loading,
    error,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
    getModelById,
    getModelsBySelection,
  };
}
