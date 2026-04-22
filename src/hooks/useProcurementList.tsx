import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useProcurementList = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setCount(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const productIds = data?.map((item) => item.product_id) || [];
      setItems(productIds);
      setCount(productIds.length);
    } catch (error) {
      console.error("Error fetching procurement list:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addToList = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add items to your Procurement List");
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, product_id: productId });

      if (error) {
        if (error.code === "23505") {
          toast.info("Already in your Procurement List");
          return false;
        }
        throw error;
      }

      setItems((prev) => [...prev, productId]);
      setCount((prev) => prev + 1);
      toast.success("Added to Procurement List");
      return true;
    } catch (error) {
      console.error("Error adding to procurement list:", error);
      toast.error("Failed to add to Procurement List");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromList = async (productId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      setItems((prev) => prev.filter((id) => id !== productId));
      setCount((prev) => prev - 1);
      toast.success("Removed from Procurement List");
      return true;
    } catch (error) {
      console.error("Error removing from procurement list:", error);
      toast.error("Failed to remove from Procurement List");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (productId: string) => {
    if (isInList(productId)) {
      return removeFromList(productId);
    } else {
      return addToList(productId);
    }
  };

  const isInList = (productId: string) => {
    return items.includes(productId);
  };

  const clearList = async () => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setItems([]);
      setCount(0);
      toast.success("Procurement List cleared");
      return true;
    } catch (error) {
      console.error("Error clearing procurement list:", error);
      toast.error("Failed to clear Procurement List");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    count,
    loading,
    addToList,
    removeFromList,
    toggleItem,
    isInList,
    clearList,
    refetch: fetchItems,
  };
};
