import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema, generateBreadcrumbSchema, generateItemListSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Loader2, Filter as FilterIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchBar } from "@/components/shop/SearchBar";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductComparison } from "@/components/shop/ProductComparison";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { CategoryNavigation } from "@/components/shop/CategoryNavigation";
import { TrustStrip } from "@/components/shop/TrustStrip";
import { BrandBrowsing } from "@/components/shop/BrandBrowsing";
import { HelpCTA } from "@/components/shop/HelpCTA";
import { ShopSEOContent } from "@/components/shop/ShopSEOContent";
import { ShopFinalCTA } from "@/components/shop/ShopFinalCTA";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import product1 from "@/assets/product-vfd-1.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import { BRANDS } from "@/components/shop/BrandFilter";

type LifecycleStatus = 'active' | 'discontinued' | 'obsolete';

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  stock_quantity: number;
  short_description: string;
  is_active: boolean;
  lifecycle_status?: string | null; // From DB as string, we'll cast on use
  featured: boolean;
  sku: string;
  brand?: string;
  condition?: string;
  is_quote_only?: boolean;
  has_replacements?: boolean;
  image_url?: string | null;
  product_category_mapping?: Array<{
    product_categories: { id: string; name: string; slug: string };
  }>;
}

const PRODUCTS_PER_PAGE = 100;

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productStatus, setProductStatus] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
  
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize searchTerm from URL on mount and handle category redirect
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    const urlBrand = searchParams.get("brand");
    
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    
    if (urlBrand) {
      setSelectedBrands([urlBrand]);
    }
    
    // Redirect to category page if category param exists (backwards compatibility)
    if (urlCategory) {
      navigate(`/category/${urlCategory}`, { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const BATCH_SIZE = 1000;
    const MAX_PRODUCTS = 10000;
    let allProducts: Product[] = [];
    let offset = 0;
    
    try {
      while (offset < MAX_PRODUCTS) {
        // PLIS: Include ALL products (active + discontinued) by default
        // Obsolete products excluded from default view
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_category_mapping(
              product_categories(id, name, slug)
            )
          `)
          .in("lifecycle_status", ["active", "discontinued"])
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + BATCH_SIZE - 1);

        if (error) throw error;
        
        if (!data || data.length === 0) break;
        
        allProducts = [...allProducts, ...data];
        
        if (data.length < BATCH_SIZE) break;
        
        offset += BATCH_SIZE;
      }
      
      setProducts(allProducts);
    } catch (error: any) {
      toast.error("Error loading products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
    }
  };

  // Calculate brand counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BRANDS.forEach(brand => {
      counts[brand.id] = products.filter(p => 
        p.brand?.toLowerCase().includes(brand.name.toLowerCase().split(' ')[0]) ||
        p.brand?.toLowerCase() === brand.id
      ).length;
    });
    return counts;
  }, [products]);

  // Calculate filter data with counts
  const rangesWithCounts = useMemo(() => {
    const uniqueRanges = Array.from(
      new Set(products.map((p) => p.power_range).filter(Boolean))
    );
    
    const rangeCounts = uniqueRanges.map((range) => {
      const count = products.filter((p) => p.power_range === range).length;
      return { id: range, name: range, count };
    });
    
    return rangeCounts
      .filter((r) => r.count > 0)
      .sort((a, b) => {
        const aNum = parseFloat(a.name.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.name.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
  }, [products]);

  const categoriesWithCounts = useMemo(() => {
    return categories.map((category) => {
      const count = products.filter((p) =>
        p.product_category_mapping?.some(
          (mapping) => mapping.product_categories.id === category.id
        )
      ).length;
      return { ...category, count };
    });
  }, [products, categories]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      
      filtered = filtered.filter((product) => {
        const searchableText = [
          product.name,
          product.series,
          product.sku,
          product.power_range,
          product.short_description,
          product.brand
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        
        return searchWords.every((word) => searchableText.includes(word));
      });
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.brand) return false;
        const productBrand = p.brand.toLowerCase();
        return selectedBrands.some(brandId => {
          const brand = BRANDS.find(b => b.id === brandId);
          if (!brand) return false;
          return productBrand.includes(brand.name.toLowerCase().split(' ')[0]) ||
                 productBrand === brandId;
        });
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        p.product_category_mapping?.some((mapping) =>
          selectedCategories.includes(mapping.product_categories.id)
        )
      );
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      filtered = filtered.filter((p) => {
        if (selectedAvailability.includes("in-stock") && p.stock_quantity > 0) return true;
        if (selectedAvailability.includes("on-request") && p.stock_quantity === 0) return true;
        if (selectedAvailability.includes("fast-sourcing")) return true; // Placeholder logic
        return false;
      });
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => {
        const condition = p.condition?.toLowerCase() || 'new';
        if (selectedConditions.includes("new") && condition === 'new') return true;
        if (selectedConditions.includes("refurbished") && condition === 'refurbished') return true;
        return false;
      });
    }

    // Range filter (power rating)
    if (selectedRanges.length > 0) {
      filtered = filtered.filter((p) => 
        selectedRanges.includes(p.power_range || "")
      );
    }

    // Product Status filter (lifecycle)
    if (productStatus && productStatus !== "all") {
      filtered = filtered.filter((p) => {
        const status = p.lifecycle_status || (p.is_active ? 'active' : 'discontinued');
        return status === productStatus;
      });
    }

    return filtered;
  }, [products, searchTerm, selectedBrands, selectedCategories, productStatus, selectedAvailability, selectedConditions, selectedRanges]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrands, selectedCategories, productStatus, selectedAvailability, selectedConditions, selectedRanges]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setProductStatus("all");
    setSelectedAvailability([]);
    setSelectedConditions([]);
    setSelectedRanges([]);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleCompareProducts = () => {
    if (comparisonProducts.length < 2) {
      toast.error("Please select at least 2 products to compare");
      return;
    }
    sessionStorage.setItem('comparisonProducts', JSON.stringify(comparisonProducts));
    navigate('/product-comparison');
  };

  const handleBrandClick = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  // Get display names for active filters
  const selectedRangeNames = rangesWithCounts.filter((r) =>
    selectedRanges.includes(r.id)
  );
  const selectedCategoryNames = categoriesWithCounts.filter((c) =>
    selectedCategories.includes(c.id)
  );

  const sidebar = (
    <FilterSidebar
      selectedBrands={selectedBrands}
      onBrandsChange={setSelectedBrands}
      brandCounts={brandCounts}
      categories={categoriesWithCounts}
      selectedCategories={selectedCategories}
      onCategoriesChange={setSelectedCategories}
      productStatus={productStatus}
      onProductStatusChange={setProductStatus}
      selectedAvailability={selectedAvailability}
      onAvailabilityChange={setSelectedAvailability}
      selectedConditions={selectedConditions}
      onConditionsChange={setSelectedConditions}
      ranges={rangesWithCounts}
      selectedRanges={selectedRanges}
      onRangesChange={setSelectedRanges}
      onClearFilters={handleClearFilters}
      totalProducts={filteredProducts.length}
    />
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Industrial Automation Products & Spare Parts | Graven Automation"
        description="Explore genuine PLCs, VFDs, servo motors, sensors, HMIs and industrial automation spare parts. Fast sourcing for manufacturers, OEMs & system integrators across India."
        keywords="industrial automation products, automation spare parts India, PLC supplier, VFD dealer, servo motor India, industrial control equipment"
        canonical="/shop"
      />
      <StructuredData 
        data={[
          generateOrganizationSchema(), 
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' }, 
            { name: 'Shop', url: '/shop' }
          ]),
          generateItemListSchema({
            name: "Industrial Automation Products & Spare Parts",
            description: "Complete range of genuine industrial automation components",
            numberOfItems: filteredProducts.length,
            items: filteredProducts.slice(0, 20).map((product, index) => ({
              name: product.name,
              url: `/product/${product.id}`,
              image: product1,
              price: product.price,
              availability: product.stock_quantity > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              position: index + 1
            }))
          })
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-4 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Shop Products
              </h1>
              <div className="w-full md:w-96">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <CategoryNavigation />

        {/* Main Content with Sidebar and Products */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex gap-6">
              {/* Desktop Sidebar */}
              {!isMobile && (
                <aside className="w-80 flex-shrink-0 sticky top-4 h-[calc(100vh-120px)]">
                  {sidebar}
                </aside>
              )}

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {/* Mobile Filter Button */}
                {isMobile && (
                  <div className="mb-4">
                    <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <FilterIcon className="mr-2 h-4 w-4" />
                          Filters {(selectedBrands.length + selectedCategories.length + selectedRanges.length) > 0 && `(${selectedBrands.length + selectedCategories.length + selectedRanges.length})`}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80 p-0">
                        {sidebar}
                      </SheetContent>
                    </Sheet>
                  </div>
                )}

                {/* Active Filters */}
                <ActiveFilters
                  selectedRanges={selectedRangeNames}
                  selectedCategories={selectedCategoryNames}
                  onRemoveRange={(id) =>
                    setSelectedRanges(selectedRanges.filter((r) => r !== id))
                  }
                  onRemoveCategory={(id) =>
                    setSelectedCategories(selectedCategories.filter((c) => c !== id))
                  }
                />

                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}-{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                  </p>
                </div>

                {/* Product Grid */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">No products found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleClearFilters}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isSelected={comparisonProducts.includes(product.id)}
                          onSelectChange={(selected) => {
                            if (selected) {
                              if (comparisonProducts.length < 4) {
                                setComparisonProducts([...comparisonProducts, product.id]);
                              } else {
                                toast.error("You can only compare up to 4 products");
                              }
                            } else {
                              setComparisonProducts(
                                comparisonProducts.filter((id) => id !== product.id)
                              );
                            }
                          }}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 mb-20">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {renderPaginationNumbers()}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <TrustStrip />

        {/* Shop by Brand */}
        <BrandBrowsing onBrandClick={handleBrandClick} />

        {/* Help CTA */}
        <HelpCTA />

        {/* SEO Content */}
        <ShopSEOContent />

        {/* Final CTA */}
        <ShopFinalCTA />
      </main>

      {/* Product Comparison Bar */}
      <ProductComparison
        selectedCount={comparisonProducts.length}
        onCompare={handleCompareProducts}
        onClear={() => setComparisonProducts([])}
      />

      <Footer />
    </div>
  );
};

export default Shop;
