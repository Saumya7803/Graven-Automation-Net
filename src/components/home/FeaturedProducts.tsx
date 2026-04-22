import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, FileText } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import product1 from "@/assets/product-vfd-1.jpg";
import product2 from "@/assets/product-vfd-2.jpg";
import product3 from "@/assets/product-vfd-3.jpg";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { generateProductAlt } from "@/lib/imageAltTags";

const fallbackImages = [product1, product2, product3];

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  is_quote_only?: boolean;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }>;
}

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_images (
              image_url,
              is_primary,
              display_order
            )
          `)
          .eq("featured", true)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our most popular Variable Frequency Drives designed for industrial automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-64" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : products.length === 0 ? (
            // No products message
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          ) : (
            // Products display
            products.map((product, index) => {
              const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url 
                || fallbackImages[index % fallbackImages.length];
              const isQuoteOnly = product.is_quote_only || !product.price || product.price <= 0;

              return (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-border overflow-hidden">
                  <div className="relative overflow-hidden bg-card">
                    <OptimizedImage
                      src={primaryImage} 
                      alt={generateProductAlt({
                        name: product.name,
                        series: product.series,
                        power_range: product.power_range,
                        category: "Industrial Automation"
                      })}
                      width={600}
                      height={600}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.series}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Power Range: {product.power_range}
                    </p>
                    {isQuoteOnly ? (
                      <Badge variant="secondary" className="text-base">Price on Request</Badge>
                    ) : (
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{product.price!.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-muted-foreground">starting from</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-6 pt-0 flex gap-2">
                    {isQuoteOnly ? (
                      <Button asChild className="w-full bg-primary hover:bg-primary-hover">
                        <Link to={`/product/${product.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Request Quote
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild className="flex-1 bg-primary hover:bg-primary-hover">
                          <Link to={`/product/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => addToCart(product.id, 1)}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link to="/shop">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
