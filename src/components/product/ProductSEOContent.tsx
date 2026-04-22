interface ProductSEOContentProps {
  productName: string;
  brand?: string | null;
  category?: string | null;
}

export const ProductSEOContent = ({ productName, brand, category }: ProductSEOContentProps) => {
  return (
    <section className="py-8 bg-muted/20 border-t border-border">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground max-w-4xl mx-auto text-center leading-relaxed">
          Buy {productName} {brand ? `from ${brand}` : ''} and industrial automation spare parts from Graven Automation. 
          We supply genuine {category ? category.toLowerCase() : 'automation'} components with technical support and fast sourcing across India. 
          Contact us for competitive pricing, bulk orders, and expert assistance for your industrial requirements.
        </p>
      </div>
    </section>
  );
};
