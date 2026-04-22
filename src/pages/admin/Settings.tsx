import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AlertConfigForm } from "@/components/admin/search/AlertConfigForm";

export default function Settings() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    currency: "USD",
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: "",
    standardShippingCost: "",
    expressShippingCost: "",
  });

  const [taxSettings, setTaxSettings] = useState({
    taxRate: "",
    taxInclusive: false,
  });

  const [alertConfig, setAlertConfig] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("store_settings").select("*");

      data?.forEach((setting) => {
        const value = setting.setting_value;
        switch (setting.setting_key) {
          case "store_info":
            setStoreInfo(value as any);
            break;
          case "shipping_settings":
            setShippingSettings(value as any);
            break;
          case "tax_settings":
            setTaxSettings(value as any);
            break;
        }
      });

      // Fetch alert configuration
      const { data: alertData } = await supabase
        .from("search_alert_config")
        .select("*")
        .eq("alert_type", "zero_results")
        .single();
      
      if (alertData) {
        setAlertConfig(alertData);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase.from("store_settings").upsert(
      {
        setting_key: key,
        setting_value: value,
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
  };

  const handleSaveStoreInfo = async () => {
    setSaving(true);
    try {
      await saveSetting("store_info", storeInfo);
      toast({ title: "Success", description: "Store information saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async () => {
    setSaving(true);
    try {
      await saveSetting("shipping_settings", shippingSettings);
      toast({ title: "Success", description: "Shipping settings saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTax = async () => {
    setSaving(true);
    try {
      await saveSetting("tax_settings", taxSettings);
      toast({ title: "Success", description: "Tax settings saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList>
            <TabsTrigger value="store">Store Info</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="alerts">Search Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={storeInfo.name}
                    onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={storeInfo.phone}
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={storeInfo.address}
                    onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeInfo.currency}
                    onChange={(e) => setStoreInfo({ ...storeInfo, currency: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveStoreInfo} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Store Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="freeShipping">Free Shipping Threshold ($)</Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="standardShipping">Standard Shipping Cost ($)</Label>
                  <Input
                    id="standardShipping"
                    type="number"
                    value={shippingSettings.standardShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        standardShippingCost: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="expressShipping">Express Shipping Cost ($)</Label>
                  <Input
                    id="expressShipping"
                    type="number"
                    value={shippingSettings.expressShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        expressShippingCost: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleSaveShipping} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Shipping Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={taxSettings.taxRate}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxRate: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveTax} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Tax Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <AlertConfigForm 
              config={alertConfig} 
              onUpdate={fetchSettings} 
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
