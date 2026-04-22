import { Badge } from "@/components/ui/badge";
import { Package, ShieldCheck } from "lucide-react";

interface CategoryHeroProps {
  name: string;
  description?: string;
  productCount: number;
  slug: string;
}

export const CategoryHero = ({ name, description, productCount, slug }: CategoryHeroProps) => {
  // Generate a professional subtext if no description provided
  const subtext = description || `Industrial-grade ${name} for automation, process control, and machine applications across manufacturing industries.`;

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-16 border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-foreground transition-colors">Shop</a>
            <span>/</span>
            <span className="text-foreground font-medium">{name}</span>
          </nav>

          {/* H1 - Category Name Only (SEO) */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {name}
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl">
            {subtext}
          </p>

          {/* Trust & Stats Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Product Count Badge */}
            <Badge variant="secondary" className="h-10 px-4 text-sm font-medium">
              <Package className="h-4 w-4 mr-2" />
              {productCount} Products Available
            </Badge>

            {/* Trust Note */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Only verified and authentic industrial automation brands</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
