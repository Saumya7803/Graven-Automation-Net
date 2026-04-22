import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEO/SEOHead";
import StructuredData from "@/components/SEO/StructuredData";
import { 
  generateProductSchema, 
  generateBreadcrumbSchema, 
  generateOrganizationSchema
} from "@/lib/seo";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { generateProductAlt } from "@/lib/imageAltTags";
import { Button } from "@/components/ui/button";
import { 
  FileText, Loader2, ArrowLeft, 
  ZoomIn, Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import product1 from "@/assets/product-vfd-1.jpg";
import RequestQuotationDialog from "@/components/rfq/RequestQuotationDialog";
import { useAuth } from "@/hooks/useAuth";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ProductFAQ } from "@/components/shop/ProductFAQ";

// New PDP Components
import { ProductTrustStrip } from "@/components/product/ProductTrustStrip";
import { ProductIdentifiers } from "@/components/product/ProductIdentifiers";
import { ProductOverview } from "@/components/product/ProductOverview";
import { FeaturesAndBenefits } from "@/components/product/FeaturesAndBenefits";
import { ProductApplications } from "@/components/product/ProductApplications";
import { ProductLifecycle } from "@/components/product/ProductLifecycle";
import { ProductRFQSection } from "@/components/product/ProductRFQSection";
import { ProductSEOContent } from "@/components/product/ProductSEOContent";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductDocuments } from "@/components/product/ProductDocuments";

interface Product {
  id: string;
  name: string;
  series: string;
  power_range: string;
  price: number | null;
  sku: string;
  description: string;
  short_description: string;
  stock_quantity: number;
  key_features: any;
  is_quote_only?: boolean;
  category_id?: string;
  brand?: string | null;
  condition?: string | null;
  is_active?: boolean;
  lifecycle_status?: string | null;
  product_categories?: { name: string };
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Specification {
  spec_key: string;
  spec_value: string;
}

interface ProductDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size_kb: number;
}

interface FAQ {
  question: string;
  answer: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [documents, setDocuments] = useState<ProductDocument[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Fetch product - remove is_active filter to allow discontinued products
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`*, product_categories (name)`)
        .eq("id", id)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) {
        toast.error("Product not found");
        return;
      }

      setProduct(productData);

      // Fetch product images
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order");

      if (imagesData && imagesData.length > 0) {
        setImages(imagesData);
        const primaryImage = imagesData.find(img => img.is_primary) || imagesData[0];
        setSelectedImage(primaryImage.image_url);
      } else {
        setSelectedImage(product1);
      }

      // Fetch specifications
      const { data: specsData } = await supabase
        .from("product_specifications")
        .select("spec_key, spec_value")
        .eq("product_id", id)
        .order("display_order");

      if (specsData) setSpecifications(specsData);

      // Fetch documents
      const { data: docsData } = await supabase
        .from("product_documents")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true)
        .order("display_order");

      if (docsData) setDocuments(docsData);

      // Fetch FAQs from database
      const { data: faqsData } = await supabase
        .from("product_faqs")
        .select("question, answer")
        .eq("product_id", id)
        .order("display_order");

      if (faqsData && faqsData.length > 0) {
        setFaqs(faqsData);
      }
    } catch (error: any) {
      toast.error("Error loading product");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = () => {
    if (!user) {
      toast.error("Please sign in to request a quotation");
      navigate("/auth");
    } else {
      setQuotationDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Button asChild>
              <Link to="/shop"><ArrowLeft className="mr-2 h-4 w-4" />Back to Shop</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const brandName = product.brand || "Graven Automation";
  const categoryName = product.product_categories?.name || "Industrial Automation";

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${product.name} | ${brandName}`}
        description={`Buy ${product.name} from Graven Automation. ${product.short_description || ''} Genuine industrial automation components with technical support and fast sourcing across India.`}
        keywords={`${product.sku}, ${product.name}, ${product.series}, ${categoryName}, ${brandName}, industrial automation, buy ${product.sku}`}
        canonical={`/product/${product.id}`}
        ogImage={selectedImage || product1}
      />
      <StructuredData 
        data={[
          generateOrganizationSchema(),
          generateProductSchema({
            id: product.id,
            name: product.name,
            description: product.short_description || product.description || '',
            price: product.price,
            image_url: selectedImage,
            images: images.length > 0 ? images.map(img => img.image_url) : [selectedImage],
            brand: brandName,
            sku: product.sku,
            stock_quantity: product.stock_quantity,
            category: `Industrial Automation > ${categoryName}`,
            specifications: specifications.map(spec => ({
              name: spec.spec_key,
              value: spec.spec_value
            }))
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Shop', url: '/shop' },
            { name: categoryName, url: '/shop' },
            { name: product.name, url: `/product/${product.id}` }
          ]),
          // FAQ Schema if FAQs exist
          ...(faqs.length > 0 ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          }] : [])
        ]} 
      />
      <Header />
      <main className="flex-1">
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />Back to Products
              </Link>
            </Button>

            {/* Product Header Section - Above the Fold */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-card group aspect-square max-h-[500px] flex items-center justify-center">
                  <OptimizedImage
                    src={selectedImage || product1} 
                    alt={generateProductAlt({
                      name: product.name,
                      series: product.series,
                      power_range: product.power_range,
                      sku: product.sku,
                      category: categoryName
                    })}
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-muted-foreground text-sm bg-background/80 px-3 py-1 rounded">
                    <ZoomIn className="h-4 w-4" />
                    <span>Roll over image to zoom in</span>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.image_url)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          selectedImage === image.image_url
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <OptimizedImage
                          src={image.image_url}
                          alt={`${product.name} - View ${image.display_order}`}
                          sizes="80px"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Product Name (H1) */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {product.name}
                  </h1>
                  {product.short_description && (
                    <p className="text-muted-foreground">
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Key Identifiers */}
                <ProductIdentifiers
                  brand={product.brand}
                  category={categoryName}
                  series={product.series}
                  sku={product.sku}
                  isActive={product.is_active !== false}
                  lifecycleStatus={product.lifecycle_status as any}
                  condition={product.condition}
                />

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleRequestQuote}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Request Price / Get Quote
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    asChild
                  >
                    <a href="tel:+919876543210">
                      <Phone className="mr-2 h-5 w-5" />
                      Talk to Technical Expert
                    </a>
                  </Button>
                </div>

                {/* Trust Strip */}
                <ProductTrustStrip />
              </div>
            </div>

            {/* Page Sections - Below the Fold */}
            <div className="mt-12 space-y-8">
              {/* Product Overview */}
              <ProductOverview 
                description={product.description} 
                shortDescription={product.short_description}
              />

              {/* Features & Benefits */}
              <FeaturesAndBenefits 
                features={product.key_features as string[] | undefined}
                category={categoryName}
              />

              {/* Technical Specifications */}
              <ProductSpecifications specifications={specifications} />

              {/* Applications & Industries */}
              <ProductApplications category={categoryName} />

              {/* Lifecycle Info (only shows if discontinued/obsolete) */}
              <ProductLifecycle 
                productId={product.id}
                isActive={product.is_active !== false}
                lifecycleStatus={product.lifecycle_status as any}
                series={product.series}
                category={categoryName}
              />

              {/* Documents & Downloads */}
              <ProductDocuments documents={documents} />

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <ProductFAQ faqs={faqs} />
              )}

              {/* RFQ Section */}
              <ProductRFQSection 
                productId={product.id}
                productName={product.name}
                productSku={product.sku}
              />
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        <RelatedProducts 
          currentProductId={product.id}
          categoryId={product.category_id}
          series={product.series}
          limit={4}
        />

        {/* SEO Content Block */}
        <ProductSEOContent 
          productName={product.name}
          brand={product.brand}
          category={categoryName}
        />
      </main>
      <Footer />

      <RequestQuotationDialog
        open={quotationDialogOpen}
        onOpenChange={setQuotationDialogOpen}
        productId={product?.id}
        productName={product?.name}
      />
    </div>
  );
};

export default ProductDetail;
