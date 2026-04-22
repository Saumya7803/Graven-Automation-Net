import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Upload, List, Settings, ShoppingBag, Users, BarChart3, FileText, MessageSquare, Webhook, Code, Tags, Quote, CreditCard, Target, PhoneCall, Bell, ShoppingCart, Mail, Download, ClipboardList, FileInput, Database } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  const exportProducts = async () => {
    try {
      // Fetch all products with categories
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_category_mapping(
            product_categories(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Define CSV headers matching requirements
      const headers = [
        "№",
        "Product Name",
        "Goods or Service?",
        "Category",
        "Group",
        "SKU",
        "HS Code",
        "Payment Terms (Advance) %",
        "Payment Terms (Transfer of Ownership) %",
        "Product Condition",
        "Application",
        "Applicable Industries",
        "Minimum Cost per Unit INR",
        "Maximum Cost per Unit INR",
        "Base of Cost",
        "Number of Pieces in One Unit",
        "Unit of Measurement",
        "Image Link"
      ];

      // Map products to CSV rows
      const rows = data?.map((product: any, index: number) => {
        const categories = product.product_category_mapping?.map(
          (m: any) => m.product_categories?.name
        ).filter(Boolean).join(", ") || "";
        
        return [
          index + 1, // № of Product
          product.name || "", // Product Name
          "Goods", // Goods or Service (default)
          categories, // Category
          product.series || "", // Group
          product.sku || "", // SKU
          "", // HS Code (blank - not in DB)
          "", // Payment Terms Advance (blank)
          "", // Payment Terms Transfer (blank)
          product.condition || "new", // Product condition
          product.short_description || "", // Application
          "", // Applicable Industries (blank)
          product.price || "", // Minimum cost
          product.price || "", // Maximum cost
          "", // Base of cost (blank)
          "1", // Number of pieces (default 1)
          "Piece", // Unit of measurement (default)
          product.image_url || "" // Image Link
        ];
      }) || [];

      // Generate CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => 
          `"${String(cell).replace(/"/g, '""')}"`
        ).join(","))
      ].join("\n");

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${rows.length} products`);
    } catch (error: any) {
      toast.error("Error exporting products: " + error.message);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
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
          <h1 className="text-4xl font-bold text-foreground mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>View, edit, and delete products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/admin/products">
                    <List className="mr-2 h-4 w-4" />
                    View Products
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={exportProducts}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Model Master</CardTitle>
                <CardDescription>Manage model catalog and specs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/model-master">
                    <Database className="mr-2 h-4 w-4" />
                    Model Catalog
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View sales and revenue metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Search Analytics</CardTitle>
                <CardDescription>Monitor search trends and optimize</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/analytics/search">
                    <Target className="mr-2 h-4 w-4" />
                    View Search Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/customers">
                    <Users className="mr-2 h-4 w-4" />
                    View Customers
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Create and manage blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/blog">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Blog
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>Upload products via CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/import">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileInput className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quick SKU Import</CardTitle>
                <CardDescription>Paste model numbers to create drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/quick-sku-import">
                    <FileInput className="mr-2 h-4 w-4" />
                    Quick Import
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>RFQ Management</CardTitle>
                <CardDescription>View and respond to quotation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/rfq">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage RFQs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Tags className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Categories</h2>
                <p className="text-muted-foreground mb-4">
                  Manage product categories
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/admin/categories")}
                >
                  Manage Categories
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Webhook className="h-8 w-8 text-primary mb-2" />
                <CardTitle>CRM Integration</CardTitle>
                <CardDescription>Manage webhooks for RFQ and Order sync</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/crm-webhooks">
                    <Webhook className="mr-2 h-4 w-4" />
                    Webhooks
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-8 w-8 text-primary mb-2" />
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>Manage API keys and view docs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/api-docs">
                    <Code className="mr-2 h-4 w-4" />
                    API Docs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Quote className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Manage customer testimonials and reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/testimonials">
                    <Quote className="mr-2 h-4 w-4" />
                    Manage Testimonials
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Payment Gateways</CardTitle>
                <CardDescription>Manage payment methods and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/payment-gateways">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Gateways
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>SEO Manager</CardTitle>
                <CardDescription>Manage keywords, mappings, and variants</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/seo/keywords">
                    <Target className="mr-2 h-4 w-4" />
                    SEO Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <PhoneCall className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Callback Requests</CardTitle>
                <CardDescription>Manage and schedule customer callbacks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/callbacks">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    View Callbacks
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Send targeted push notifications to users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/push-notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Send Notifications
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Abandoned Carts</CardTitle>
                <CardDescription>Track and recover abandoned shopping carts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/abandoned-carts">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Manage Carts
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Recovery Templates</CardTitle>
                <CardDescription>Manage cart recovery email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/cart-recovery-templates">
                    <Mail className="mr-2 h-4 w-4" />
                    Manage Templates
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Procurement List Recovery</CardTitle>
                <CardDescription>Track and recover stale procurement lists</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/procurement-list-recovery">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Manage Lists
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Procurement Templates</CardTitle>
                <CardDescription>Manage procurement recovery email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/procurement-recovery-templates">
                    <Mail className="mr-2 h-4 w-4" />
                    Manage Templates
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Create and send marketing email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin/email-campaigns">
                    <Mail className="mr-2 h-4 w-4" />
                    Manage Campaigns
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Google Shopping</CardTitle>
                <CardDescription>Analytics dashboard and product sync</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/admin/google-shopping/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/admin/google-shopping">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Manage Products
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage store settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;