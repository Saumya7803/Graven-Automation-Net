import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, X, ShoppingCart, Printer, Mail } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  series: string;
  sku: string;
  price: number;
  power_range: string;
  voltage_range?: string;
  current_rating?: string;
  control_method?: string;
  protection_rating?: string;
  cooling_method?: string;
  dimensions?: string;
  weight?: string;
  stock_quantity: number;
  warranty_months?: number;
  features?: string[];
  short_description?: string;
}

const ProductComparison = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productIds = sessionStorage.getItem('comparisonProducts');
    if (!productIds) {
      toast.error("No products selected for comparison");
      navigate('/shop');
      return;
    }

    fetchProducts(JSON.parse(productIds));
  }, [navigate]);

  const fetchProducts = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    sessionStorage.setItem('comparisonProducts', JSON.stringify(updatedProducts.map(p => p.id)));
    
    if (updatedProducts.length === 0) {
      toast.info("No products to compare");
      navigate('/shop');
    }
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = "VFD Product Comparison";
    const body = `I'm comparing these VFD products:\n\n${products.map(p => `${p.name} (${p.sku}) - ${formatCurrency(p.price)}`).join('\n')}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const comparisonRows = [
    { label: "Series", getValue: (p: Product) => p.series },
    { label: "SKU", getValue: (p: Product) => p.sku },
    { label: "Price", getValue: (p: Product) => formatCurrency(p.price), highlight: true },
    { label: "Power Range", getValue: (p: Product) => p.power_range },
    { label: "Voltage Range", getValue: (p: Product) => p.voltage_range || "N/A" },
    { label: "Current Rating", getValue: (p: Product) => p.current_rating || "N/A" },
    { label: "Control Method", getValue: (p: Product) => p.control_method || "N/A" },
    { label: "Protection (IP)", getValue: (p: Product) => p.protection_rating || "N/A" },
    { label: "Cooling", getValue: (p: Product) => p.cooling_method || "Natural Convection" },
    { label: "Dimensions", getValue: (p: Product) => p.dimensions || "N/A" },
    { label: "Weight", getValue: (p: Product) => p.weight || "N/A" },
    { label: "Stock Status", getValue: (p: Product) => p.stock_quantity > 0 ? `In Stock (${p.stock_quantity})` : "Out of Stock" },
    { label: "Warranty", getValue: (p: Product) => p.warranty_months ? `${p.warranty_months} months` : "12 months" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Compare VFD Products | Schneider Electric Variable Frequency Drives"
        description="Compare Variable Frequency Drives side-by-side. Check specifications, prices, and features to find the perfect VFD for your application."
        keywords="compare VFD, VFD comparison, Schneider VFD compare, ATV comparison"
        canonical="/product-comparison"
      />
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/shop')}
                className="mb-2 -ml-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
              <h1 className="text-3xl font-bold">Compare Products</h1>
              <p className="text-muted-foreground mt-1">
                Comparing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Comparison Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left font-semibold w-48 sticky left-0 bg-muted/50">
                    Specification
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 text-center min-w-[250px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="text-lg font-bold">{product.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{product.short_description}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-4 font-medium sticky left-0 bg-background">
                      {row.label}
                    </td>
                    {products.map((product) => {
                      const value = row.getValue(product);
                      const isDifferent = row.highlight || products.some(p => row.getValue(p) !== value);
                      return (
                        <td
                          key={product.id}
                          className={`p-4 text-center ${isDifferent && products.length > 1 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 font-medium sticky left-0 bg-background">Actions</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleAddToCart(product.id)}
                          className="w-full"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comparison Cards - Mobile */}
          <div className="md:hidden space-y-6">
            {products.map((product) => (
              <div key={product.id} className="bg-card rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.short_description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  {comparisonRows.map((row) => (
                    <div key={row.label} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-sm">{row.label}</span>
                      <span className="text-sm text-right">{row.getValue(product)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleAddToCart(product.id)} className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductComparison;
