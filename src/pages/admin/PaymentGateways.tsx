import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PaymentGatewayDialog } from "@/components/admin/PaymentGatewayDialog";
import { PaymentGatewayCard } from "@/components/admin/PaymentGatewayCard";

interface PaymentGateway {
  id: string;
  gateway_name: string;
  gateway_type: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  is_test_mode: boolean;
  configuration: any;
  supported_currencies: any;
  display_order: number;
  created_at: string;
}

const PaymentGateways = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchGateways();
    }
  }, [isAdmin]);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setGateways(data || []);
    } catch (error: any) {
      console.error("Error fetching gateways:", error);
      toast.error("Failed to load payment gateways");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment gateway?")) return;

    try {
      const { error } = await supabase
        .from("payment_gateways")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Payment gateway deleted successfully");
      fetchGateways();
    } catch (error: any) {
      console.error("Error deleting gateway:", error);
      toast.error("Failed to delete payment gateway");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Payment gateway ${!currentStatus ? "activated" : "deactivated"}`);
      fetchGateways();
    } catch (error: any) {
      console.error("Error toggling gateway status:", error);
      toast.error("Failed to update gateway status");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGateway(null);
    fetchGateways();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Gateways</h1>
            <p className="text-muted-foreground">Manage payment methods and integrations</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gateway
          </Button>
        </div>

        {gateways.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                No Payment Gateways
              </CardTitle>
              <CardDescription>
                Get started by adding your first payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Gateway
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gateways.map((gateway) => (
              <PaymentGatewayCard
                key={gateway.id}
                gateway={gateway}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        <PaymentGatewayDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          gateway={editingGateway}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentGateways;
