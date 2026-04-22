import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/config";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GoogleMerchantSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [merchantId, setMerchantId] = useState("");

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("google_merchant_config")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setConfig(data);
      if (data?.merchant_id) {
        setMerchantId(data.merchant_id);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Redirect to OAuth flow
      window.location.href = `${SUPABASE_URL}/functions/v1/google-merchant-auth`;
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-merchant-auth/disconnect", {
        method: "POST",
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Merchant Center",
      });

      setConfig(null);
      await checkConnectionStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveMerchantId = async () => {
    try {
      const { error } = await supabase
        .from("google_merchant_config")
        .update({ merchant_id: merchantId })
        .eq("id", config.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Merchant ID updated successfully",
      });

      await checkConnectionStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSyncProducts = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-products-to-google", {
        body: { syncMode: "full" },
      });

      if (error) throw error;

      toast({
        title: "Sync started",
        description: `Syncing ${data.synced} products to Google Merchant Center`,
      });

      await checkConnectionStatus();
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Google Merchant Center</h1>
          <p className="text-muted-foreground">Connect and sync products to Google Shopping</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Status
              {config?.is_connected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </CardTitle>
            <CardDescription>
              {config?.is_connected
                ? "Your account is connected to Google Merchant Center"
                : "Connect your Google Merchant Center account to start syncing products"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config?.is_connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="default" className="mt-1">Connected</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Synced</p>
                    <p className="text-sm text-muted-foreground">
                      {config.last_sync_at
                        ? new Date(config.last_sync_at).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDisconnect} disabled={connecting}>
                  {connecting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Connect to Google Merchant Center
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Merchant Configuration */}
        {config?.is_connected && (
          <Card>
            <CardHeader>
              <CardTitle>Merchant Configuration</CardTitle>
              <CardDescription>Configure your Google Merchant Center settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="merchantId">Merchant Center ID</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="merchantId"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="Enter your Merchant Center ID"
                  />
                  <Button onClick={handleSaveMerchantId}>Save</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Find your Merchant ID in your Google Merchant Center dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Controls */}
        {config?.is_connected && merchantId && merchantId !== "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Sync</CardTitle>
              <CardDescription>Sync your products to Google Shopping</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSyncProducts} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Syncing Products...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Sync All Products
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will sync all eligible products to Google Merchant Center
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
