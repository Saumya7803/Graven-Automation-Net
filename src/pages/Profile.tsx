import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { KPICard } from "@/components/profile/KPICard";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { AddressForm } from "@/components/profile/AddressForm";
import { OrdersSection } from "@/components/profile/OrdersSection";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { QuotationSummary } from "@/components/profile/QuotationSummary";
import { NotificationSettings } from "@/components/profile/NotificationSettings";
import CommunicationLog from "@/components/profile/CommunicationLog";
import { Package, IndianRupee, TrendingUp, Clock, Loader2, FileText, LayoutDashboard, User, Bell, ShoppingBag, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateCustomerProfileForPDF } from "@/lib/validations/customerProfile";
import { useEffect as useEffectOnce } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const {
    customer,
    kpis,
    loading,
    updateProfile,
    updateBillingAddress,
    updateShippingAddress,
  } = useCustomerProfile();

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [profileValidation, setProfileValidation] = useState<{ isComplete: boolean; missingFields: string[] }>({ 
    isComplete: true, 
    missingFields: [] 
  });
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    if (customer?.billing_address && customer?.shipping_address) {
      const isSame = 
        customer.billing_address.street === customer.shipping_address.street &&
        customer.billing_address.city === customer.shipping_address.city &&
        customer.billing_address.state === customer.shipping_address.state &&
        customer.billing_address.zip === customer.shipping_address.zip &&
        customer.billing_address.country === customer.shipping_address.country;
      setSameAsBilling(isSame);
    }
    
    // Validate profile for PDF generation
    if (customer) {
      const validation = validateCustomerProfileForPDF(customer);
      setProfileValidation(validation);
    }
  }, [customer]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !customer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Unable to load profile</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyBillingToShipping = () => {
    if (customer.billing_address) {
      updateShippingAddress(customer.billing_address);
    }
  };

  const handleSameAsBillingChange = async (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked && customer.billing_address) {
      await updateShippingAddress(customer.billing_address);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Customer Profile</h1>
          
          {/* Profile Completion Status */}
          {!profileValidation.isComplete && (
            <Alert className="mb-6 border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Complete Your Profile</AlertTitle>
              <AlertDescription className="text-amber-800">
                Please complete the following information to enable full quotation PDF generation:
                <ul className="list-disc list-inside mt-2 ml-2">
                  {profileValidation.missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {profileValidation.isComplete && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Profile Complete</AlertTitle>
              <AlertDescription className="text-green-800">
                Your profile is complete and ready for quotation PDF generation.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="communications" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Communications</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard
                  title="Total Orders"
                  value={kpis?.totalOrders || 0}
                  icon={Package}
                  variant="info"
                  loading={!kpis}
                />
                <KPICard
                  title="Total Spent"
                  value={formatCurrency(kpis?.totalSpent || 0)}
                  icon={IndianRupee}
                  variant="success"
                  loading={!kpis}
                />
                <KPICard
                  title="Avg Order Value"
                  value={formatCurrency(kpis?.avgOrderValue || 0)}
                  icon={TrendingUp}
                  variant="default"
                  loading={!kpis}
                />
                <KPICard
                  title="Pending Orders"
                  value={kpis?.pendingOrders || 0}
                  icon={Clock}
                  variant={kpis && kpis.pendingOrders > 0 ? "warning" : "default"}
                  loading={!kpis}
                />
                <KPICard
                  title="Pending Quotes"
                  value={kpis?.pendingQuotations || 0}
                  icon={FileText}
                  variant={kpis && kpis.pendingQuotations > 0 ? "warning" : "default"}
                  loading={!kpis}
                  subtitle={`${kpis?.totalQuotations || 0} total`}
                />
              </div>

              {/* Recent Activity */}
              <RecentActivity userId={user.id} />

              {/* Quotations Summary */}
              <QuotationSummary
                totalQuotations={kpis?.totalQuotations || 0}
                pendingQuotations={kpis?.pendingQuotations || 0}
                quotedQuotations={kpis?.quotedQuotations || 0}
                loading={!kpis}
              />
            </TabsContent>

            {/* Profile & Addresses Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Personal Information */}
              <PersonalInfoForm customer={customer} onSave={updateProfile} />

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AddressForm
                  title="Billing Address"
                  description="Address for billing purposes"
                  address={customer.billing_address}
                  onSave={updateBillingAddress}
                />
                <AddressForm
                  title="Shipping Address"
                  description="Default shipping address"
                  address={customer.shipping_address}
                  onSave={updateShippingAddress}
                  canCopyFrom={customer.billing_address}
                  onCopyFrom={handleCopyBillingToShipping}
                  isShippingAddress={true}
                  sameAsBilling={sameAsBilling}
                  onSameAsBillingChange={handleSameAsBillingChange}
                  billingAddress={customer.billing_address}
                />
              </div>
            </TabsContent>

            {/* Notification Settings Tab */}
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <OrdersSection userId={user.id} />
            </TabsContent>

            <TabsContent value="communications">
              <CommunicationLog userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
