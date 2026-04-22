import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, calculateCustomerTier, getTierBadgeConfig, CustomerTier } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, User, Mail, Phone, Building2, Package, IndianRupee } from "lucide-react";

interface CustomerWithKPIs {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  tier: CustomerTier;
}

const CustomersList = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithKPIs[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<CustomerTier | 'all'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false });

        if (customersError) throw customersError;

        // Fetch orders data for each customer
        const customersWithKPIs = await Promise.all(
          (customersData || []).map(async (customer) => {
            const { data: ordersData } = await supabase
              .from("orders")
              .select("total_amount")
              .eq("user_id", customer.user_id);

            const totalOrders = ordersData?.length || 0;
            const totalSpent = ordersData?.reduce(
              (sum, order) => sum + Number(order.total_amount),
              0
            ) || 0;

            const tier = calculateCustomerTier(totalSpent, totalOrders, customer.created_at);
            
            return {
              ...customer,
              total_orders: totalOrders,
              total_spent: totalSpent,
              tier,
            };
          })
        );

        setCustomers(customersWithKPIs);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchCustomers();
    }
  }, [isAdmin]);

  const tierStats = {
    vip: customers.filter(c => c.tier === 'vip').length,
    regular: customers.filter(c => c.tier === 'regular').length,
    new: customers.filter(c => c.tier === 'new').length,
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = selectedTier === 'all' || customer.tier === selectedTier;
    
    return matchesSearch && matchesTier;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-foreground">Customer Management</h1>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {customers.length} Total Customers
            </Badge>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tier Segmentation Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">Customer Segments</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredCustomers.length} of {customers.length}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTier === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier('all')}
                    className="gap-2"
                  >
                    All Customers
                    <Badge variant="secondary" className="ml-1">{customers.length}</Badge>
                  </Button>
                  
                  <Button
                    variant={selectedTier === 'vip' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier('vip')}
                    className="gap-2"
                  >
                    👑 VIP
                    <Badge variant="secondary" className="ml-1">{tierStats.vip}</Badge>
                  </Button>
                  
                  <Button
                    variant={selectedTier === 'regular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier('regular')}
                    className="gap-2"
                  >
                    ⭐ Regular
                    <Badge variant="secondary" className="ml-1">{tierStats.regular}</Badge>
                  </Button>
                  
                  <Button
                    variant={selectedTier === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier('new')}
                    className="gap-2"
                  >
                    🆕 New
                    <Badge variant="secondary" className="ml-1">{tierStats.new}</Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : filteredCustomers.length === 0 ? (
              <Card className="lg:col-span-2">
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No customers found</p>
                </CardContent>
              </Card>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg">{customer.full_name}</CardTitle>
                            <Badge variant={getTierBadgeConfig(customer.tier).variant}>
                              {getTierBadgeConfig(customer.tier).icon} {getTierBadgeConfig(customer.tier).label}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.company_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {customer.company_name}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Package className="h-4 w-4" />
                          <span className="text-xs">Total Orders</span>
                        </div>
                        <p className="text-lg font-bold">{customer.total_orders}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <IndianRupee className="h-4 w-4" />
                          <span className="text-xs">Total Spent</span>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(customer.total_spent)}</p>
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <Link to={`/admin/customers/${customer.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomersList;
