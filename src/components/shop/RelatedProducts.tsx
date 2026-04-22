import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generateProductAlt } from "@/lib/imageAltTags";
import product1 from "@/assets/product-vfd-1.jpg";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  series?: string;
  limit?: number;
}

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  sku: string;
  short_description: string;
  image_url?: string;
  is_quote_only?: boolean;
  stock_quantity: number;
  product_categories?: { name: string };
}

export const RelatedProducts = ({ 
  currentProductId, 
  categoryId, 
  series,
  limit = 4 
}: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId, series]);

  const fetchRelatedProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select(`*, product_categories (name)`)
        .eq("is_active", true)
        .neq("id", currentProductId)
        .limit(limit);

      // Priority 1: Same series
      if (series) {
        const { data: seriesProducts } = await query.eq("series", series);
        if (seriesProducts && seriesProducts.length >= limit) {
          setProducts(seriesProducts);
          setLoading(false);
          return;
        }
      }

      // Priority 2: Same category
      if (categoryId) {
        const { data: mappings } = await supabase
          .from("product_category_mapping")
          .select(`
            products (
              *,
              product_categories (name)
            )
          `)
          .eq("category_id", categoryId)
          .limit(limit);

        const categoryProducts = mappings
          ?.map((m: any) => m.products)
          .filter((p: any) => p && p.is_active && p.id !== currentProductId) || [];

        if (categoryProducts.length >= limit) {
          setProducts(categoryProducts.slice(0, limit));
          setLoading(false);
          return;
        }
      }

      // Priority 3: Featured products
      const { data: featuredProducts } = await supabase
        .from("products")
        .select(`*, product_categories (name)`)
        .eq("is_active", true)
        .eq("featured", true)
        .neq("id", currentProductId)
        .limit(limit);

      setProducts(featuredProducts || []);
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Related Products</h2>
            <p className="text-muted-foreground">
              You may also be interested in these products
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/shop">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isQuoteOnly = product.is_quote_only || !product.price || product.price <= 0;
            
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                      <OptimizedImage
                        src={product.image_url || product1}
                        alt={generateProductAlt({
                          name: product.name,
                          series: product.series,
                          power_range: product.power_range,
                          sku: product.sku,
                          category: product.product_categories?.name
                        })}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <CardTitle className="text-base line-clamp-2 mb-1">
                    <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {product.series} | {product.power_range}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    {isQuoteOnly ? (
                      <Badge variant="secondary">Price on Request</Badge>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.price!)}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    asChild
                  >
                    <Link to={`/product/${product.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
