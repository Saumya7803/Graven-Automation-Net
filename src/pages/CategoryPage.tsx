import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { generateOrganizationSchema, generateBreadcrumbSchema, generateCollectionPageSchema, generateFAQSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Loader2, Filter as FilterIcon, Package, BookOpen, ChevronDown, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { SearchBar } from "@/components/shop/SearchBar";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductComparison } from "@/components/shop/ProductComparison";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Category Components
import { CategoryEducation } from "@/components/category/CategoryEducation";
import { CategoryApplications } from "@/components/category/CategoryApplications";
import { CategorySelectionGuide } from "@/components/category/CategorySelectionGuide";
import { CategoryBrands } from "@/components/category/CategoryBrands";
import { CategoryFAQ } from "@/components/category/CategoryFAQ";
import { CategoryHelpCTA } from "@/components/category/CategoryHelpCTA";
import { CategorySEOContent } from "@/components/category/CategorySEOContent";

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  stock_quantity: number;
  short_description: string;
  is_active: boolean;
  featured: boolean;
  sku: string;
  image_url?: string;
  brand?: string;
  is_quote_only?: boolean;
  product_category_mapping?: Array<{
    product_categories: { id: string; name: string; slug: string };
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string | null;
  applications?: string[] | null;
  benefits?: string[] | null;
  meta_keywords?: string[] | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [productViewType, setProductViewType] = useState("all");
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const { addToCart } = useCart();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("product_categories")
        .select("id, name, slug, description, long_description, applications, benefits, meta_keywords")
        .eq("slug", slug)
        .single();

      if (categoryError) {
        toast.error("Category not found");
        navigate("/shop");
        return;
      }

      setCategory(categoryData as unknown as Category);

      const { data: mappingsData, error: mappingsError } = await supabase
        .from("product_category_mapping")
        .select(`
          product_id,
          products (
            *,
            product_category_mapping(
              product_categories(id, name, slug)
            )
          )
        `)
        .eq("category_id", categoryData.id);

      if (mappingsError) throw mappingsError;

      const productsData = mappingsData
        ?.map((m: any) => m.products)
        .filter((p: any) => p && p.is_active) || [];

      const uniqueProducts = Array.from(
        new Map(productsData.map((p: any) => [p.id, p])).values()
      ).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setProducts(uniqueProducts as any);
    } catch (error: any) {
      toast.error("Error loading category products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableBrands = useMemo(() => {
    const brands = products
      .map(p => p.brand)
      .filter((brand): brand is string => Boolean(brand));
    return [...new Set(brands)].sort();
  }, [products]);

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

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.series.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
    }

    if (productViewType === "featured") {
      filtered = filtered.filter((p) => p.featured);
    }

    if (selectedRanges.length > 0) {
      filtered = filtered.filter((p) => 
        selectedRanges.includes(p.power_range || "")
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => 
        p.brand && selectedBrands.includes(p.brand)
      );
    }

    return filtered;
  }, [products, searchTerm, productViewType, selectedRanges, selectedBrands]);

  const handleClearFilters = () => {
    setSelectedRanges([]);
    setSelectedBrands([]);
    setProductViewType("all");
    setSearchTerm("");
  };

  const handleCompareProducts = () => {
    if (comparisonProducts.length < 2) {
      toast.error("Please select at least 2 products to compare");
      return;
    }
    sessionStorage.setItem('comparisonProducts', JSON.stringify(comparisonProducts));
    navigate('/product-comparison');
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
  };

  const selectedRangeNames = rangesWithCounts.filter((r) =>
    selectedRanges.includes(r.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  const categoryTitle = `${category.name} | Industrial Automation Components | Graven Automation`;
  const categoryDescription = `Buy ${category.name} for industrial automation. ${category.description} Genuine products, technical support, and fast sourcing across India.`;
  const categoryKeywords = category.meta_keywords?.join(', ') || 
    `${category.name}, buy ${category.name}, ${category.name} India, industrial automation`;

  const categoryFAQs = [
    { question: `What ${category.name} brands do you offer?`, answer: `We offer ${category.name} from leading brands including ${availableBrands.slice(0, 5).join(', ')}${availableBrands.length > 5 ? ' and more' : ''}.` },
    { question: `How do I choose the right ${category.name}?`, answer: `Consider factors like power rating, communication protocols, environmental requirements, and compatibility with existing systems. Our technical team can help you select the right model.` },
    { question: `Do you provide technical support for ${category.name}?`, answer: `Yes, we provide comprehensive technical support including product selection, installation guidance, and troubleshooting assistance.` },
    { question: `What is your delivery time for ${category.name}?`, answer: `In-stock items ship within 1-2 business days. For special orders, we provide estimated delivery times based on supplier availability.` },
    { question: `Can I get bulk pricing for ${category.name}?`, answer: `Yes, we offer competitive pricing for bulk orders. Contact our sales team for quotations on larger quantities.` }
  ];
  const faqSchema = generateFAQSchema(categoryFAQs);

  const sidebar = (
    <FilterSidebar
      ranges={rangesWithCounts}
      categories={[]}
      selectedRanges={selectedRanges}
      selectedCategories={[]}
      productViewType={productViewType}
      onRangesChange={setSelectedRanges}
      onCategoriesChange={() => {}}
      onProductViewTypeChange={setProductViewType}
      onClearFilters={handleClearFilters}
      totalProducts={products.length}
    />
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={categoryTitle}
        description={categoryDescription}
        keywords={categoryKeywords}
        canonical={`/category/${slug}`}
      />
      <StructuredData 
        data={[
          generateOrganizationSchema(), 
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' }, 
            { name: 'Shop', url: '/shop' },
            { name: category.name, url: `/category/${slug}` }
          ]),
          generateCollectionPageSchema({
            name: category.name,
            description: category.description,
            url: `/category/${slug}`,
            breadcrumbs: [
              { name: 'Home', url: '/' },
              { name: 'Shop', url: '/shop' },
              { name: category.name, url: `/category/${slug}` }
            ],
            products: filteredProducts.slice(0, 20).map(p => ({
              id: p.id,
              name: p.name,
              url: `/product/${p.id}`,
              image: p.image_url,
              price: p.price,
              availability: p.stock_quantity > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock"
            }))
          }),
          faqSchema
        ]} 
      />
      <Header />
      <main className="flex-1">
        {/* Condensed Hero with inline search */}
        <section className="bg-muted/30 py-4 border-b">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {category.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <div className="w-full md:w-96">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Sidebar + Product Grid - Immediately visible */}
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
                          Filters {(selectedRanges.length + selectedBrands.length) > 0 && `(${selectedRanges.length + selectedBrands.length})`}
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
                  selectedCategories={[]}
                  onRemoveRange={(id) =>
                    setSelectedRanges(selectedRanges.filter((r) => r !== id))
                  }
                  onRemoveCategory={() => {}}
                />

                {/* Product Grid or Empty State */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {products.length === 0 
                        ? `No ${category.name} Listed Yet`
                        : 'No products match your filters'
                      }
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {products.length === 0 
                        ? `We source ${category.name} from leading manufacturers. Tell us what you need and we'll find it for you.`
                        : 'Try adjusting your filters or search terms to find what you need.'
                      }
                    </p>
                    {products.length === 0 ? (
                      <Button asChild>
                        <Link to="/contact">
                          <FileText className="mr-2 h-4 w-4" />
                          Request a Quote
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear all filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredProducts.map((product) => (
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
                        onAddToCart={() => handleAddToCart(product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Educational Content - Collapsible, after products */}
        <Collapsible open={educationOpen} onOpenChange={setEducationOpen} className="border-t">
          <CollapsibleTrigger className="w-full py-5 px-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/20 hover:bg-muted/30">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Learn More About {category.name}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${educationOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CategoryEducation
              categoryName={category.name}
              longDescription={category.long_description}
              categorySlug={slug || ''}
            />
            <CategoryApplications
              categoryName={category.name}
              applications={category.applications}
              categorySlug={slug || ''}
            />
            <CategorySelectionGuide
              categoryName={category.name}
              categorySlug={slug || ''}
            />
            {availableBrands.length > 0 && (
              <CategoryBrands
                categoryName={category.name}
                brands={availableBrands}
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* FAQ */}
        <CategoryFAQ
          categoryName={category.name}
          categorySlug={slug || ''}
          faqs={categoryFAQs}
        />

        {/* Help CTA */}
        <CategoryHelpCTA categoryName={category.name} />

        {/* SEO Content Block */}
        <CategorySEOContent
          categoryName={category.name}
          categorySlug={slug || ''}
        />
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

export default CategoryPage;
