import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Loader2, ArrowLeft, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  featured: boolean;
  is_quote_only?: boolean;
}

const ProductsList = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [forceDeleteDialog, setForceDeleteDialog] = useState<{ open: boolean; productId: string | null; productName: string }>({
    open: false,
    productId: null,
    productName: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_category_mapping(
            product_categories(id, name, slug)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Error loading products: " + error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Reactivate product "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: true })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Product reactivated successfully", {
        description: `${name} is now active and available for sale.`
      });
      
      fetchProducts();
    } catch (error: any) {
      toast.error("Error reactivating product: " + error.message);
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteDialog.productId) return;

    try {
      // Check if product has quotation or order history
      const [orderItemsCheck, quotationItemsCheck] = await Promise.all([
        supabase
          .from("order_items")
          .select("id")
          .eq("product_id", forceDeleteDialog.productId)
          .limit(1),
        supabase
          .from("quotation_request_items")
          .select("id")
          .eq("product_id", forceDeleteDialog.productId)
          .limit(1)
      ]);

      const hasOrders = orderItemsCheck.data && orderItemsCheck.data.length > 0;
      const hasQuotations = quotationItemsCheck.data && quotationItemsCheck.data.length > 0;

      // Prevent deletion if product has quotation or order history
      if (hasOrders || hasQuotations) {
        toast.error("Cannot Delete Product", {
          description: "This product has order/quotation history and cannot be permanently deleted. It will remain inactive to preserve data integrity."
        });
        setForceDeleteDialog({ open: false, productId: null, productName: "" });
        return;
      }

      // Only delete if no history exists
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", forceDeleteDialog.productId);

      if (error) throw error;
      
      toast.success("Product permanently deleted", {
        description: "This product has been completely removed from the database."
      });
      
      setForceDeleteDialog({ open: false, productId: null, productName: "" });
      fetchProducts();
    } catch (error: any) {
      toast.error("Error deleting product: " + error.message);
    }
  };

  const handleDelete = async (id: string, isActive: boolean, name: string) => {
    // For inactive products, show force delete dialog
    if (!isActive) {
      setForceDeleteDialog({ open: true, productId: id, productName: name });
      return;
    }

    // For active products, check history and soft/hard delete
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // Check if product has historical data (orders or quotations)
      const [orderItemsCheck, quotationItemsCheck] = await Promise.all([
        supabase
          .from("order_items")
          .select("id")
          .eq("product_id", id)
          .limit(1),
        supabase
          .from("quotation_request_items")
          .select("id")
          .eq("product_id", id)
          .limit(1)
      ]);

      const hasOrders = orderItemsCheck.data && orderItemsCheck.data.length > 0;
      const hasQuotations = quotationItemsCheck.data && quotationItemsCheck.data.length > 0;

      if (hasOrders || hasQuotations) {
        // Soft delete - product has historical data
        const { error } = await supabase
          .from("products")
          .update({ is_active: false })
          .eq("id", id);

        if (error) throw error;
        
        toast.success("Product deactivated successfully", {
          description: "This product has order/quotation history and was deactivated instead of deleted."
        });
      } else {
        // Hard delete - product has no historical data
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        toast.success("Product permanently deleted", {
          description: "This product had no order history and was completely removed."
        });
      }
      
      fetchProducts();
    } catch (error: any) {
      toast.error("Error deleting product: " + error.message);
    }
  };

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingProducts) {
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
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Manage Products</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportProducts}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button asChild>
                <Link to="/admin/products/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, series, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="bg-card rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: any) => {
                    const categories = product.product_category_mapping?.map(
                      (m: any) => m.product_categories.name
                    ) || [];
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.series}</TableCell>
                        <TableCell>
                          {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {categories.slice(0, 2).map((cat: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                              {categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!product.is_active && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleReactivate(product.id, product.name)}
                              title="Reactivate product"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                           <Button
                             size="sm"
                             variant="destructive"
                             onClick={() => handleDelete(product.id, product.is_active, product.name)}
                             title={product.is_active ? "Delete product" : "Permanently delete product"}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   );
                 })
               )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <Footer />

      <AlertDialog open={forceDeleteDialog.open} onOpenChange={(open) => !open && setForceDeleteDialog({ open: false, productId: null, productName: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                Warning: This action cannot be undone!
              </p>
              <p>
                You are about to permanently delete <span className="font-semibold">{forceDeleteDialog.productName}</span> from the database.
              </p>
              <p className="text-sm">
                This product is currently inactive. Only products without any order or quotation history can be permanently deleted.
              </p>
              <p className="text-sm font-semibold">
                Are you absolutely sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsList;