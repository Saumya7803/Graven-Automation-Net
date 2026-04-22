import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface CustomerKPIs {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  pendingOrders: number;
  lastOrderDate: string | null;
  totalQuotations: number;
  pendingQuotations: number;
  quotedQuotations: number;
}

export interface Customer {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  gst_number: string | null;
  billing_address: any;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

export const useCustomerProfile = () => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [kpis, setKpis] = useState<CustomerKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomerData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch customer profile
      let { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customerError) throw customerError;

      // Auto-create customer record if it doesn't exist
      if (!customerData) {
        const { data: newCustomer, error: insertError } = await supabase
          .from("customers")
          .insert({
            user_id: user.id,
            email: user.email || "",
            full_name: user.email || "User",
          })
          .select()
          .single();

        if (insertError) {
          // If conflict, someone else created it, fetch again
          const { data: refetchData } = await supabase
            .from("customers")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          customerData = refetchData;
        } else {
          customerData = newCustomer;
        }
      }

      setCustomer(customerData);

      // Fetch KPIs
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at")
        .eq("user_id", user.id);

      if (ordersError) throw ordersError;

      const totalOrders = ordersData?.length || 0;
      const totalSpent = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const pendingOrders = ordersData?.filter(
        (order) => order.status === "pending" || order.status === "confirmed"
      ).length || 0;
      const lastOrderDate = ordersData && ordersData.length > 0
        ? ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      // Fetch Quotation KPIs
      const { data: quotationsData, error: quotationsError } = await supabase
        .from("quotation_requests")
        .select("id, status, created_at")
        .eq("user_id", user.id);

      if (quotationsError) throw quotationsError;

      const totalQuotations = quotationsData?.length || 0;
      const pendingQuotations = quotationsData?.filter(
        (q) => q.status === "pending" || q.status === "reviewing"
      ).length || 0;
      const quotedQuotations = quotationsData?.filter(
        (q) => q.status === "quoted" || q.status === "revised"
      ).length || 0;

      setKpis({
        totalOrders,
        totalSpent,
        avgOrderValue,
        pendingOrders,
        lastOrderDate,
        totalQuotations,
        pendingQuotations,
        quotedQuotations,
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [user]);

  const updateProfile = async (data: Partial<Customer>) => {
    if (!user || !customer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update(data)
        .eq("user_id", user.id);

      if (error) throw error;

      setCustomer({ ...customer, ...data } as Customer);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateBillingAddress = async (address: any) => {
    if (!user || !customer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update({ billing_address: address })
        .eq("user_id", user.id);

      if (error) throw error;

      setCustomer({ ...customer, billing_address: address });
      toast({
        title: "Success",
        description: "Billing address saved",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update billing address",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateShippingAddress = async (address: any) => {
    if (!user || !customer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update({ shipping_address: address })
        .eq("user_id", user.id);

      if (error) throw error;

      setCustomer({ ...customer, shipping_address: address });
      toast({
        title: "Success",
        description: "Shipping address updated",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update shipping address",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    customer,
    kpis,
    loading,
    error,
    updateProfile,
    updateBillingAddress,
    updateShippingAddress,
    refetch: fetchCustomerData,
  };
};
