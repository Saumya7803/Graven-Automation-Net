import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryBrandsProps {
  categoryName: string;
  brands: string[];
}

// Map brand names to their common series (for display purposes)
const BRAND_SERIES: Record<string, string[]> = {
  "schneider electric": ["Altivar", "Modicon", "Magelis", "Lexium"],
  "siemens": ["S7", "Sinamics", "Comfort Panel", "Simotics"],
  "allen bradley": ["MicroLogix", "CompactLogix", "PowerFlex", "PanelView"],
  "mitsubishi electric": ["MELSEC", "FR Series", "GOT", "MR-J"],
  "delta": ["MS300", "C2000", "DVP", "DOP"],
  "abb": ["ACS", "AC500", "CP600", "MicroFlex"],
  "yaskawa": ["A1000", "GA700", "MP3000", "Sigma"],
  "danfoss": ["VLT", "FC Series"],
  "omron": ["CP1", "NX", "NA", "1S"],
  "fuji": ["FRENIC", "MICREX", "MONITOUCH"],
};

export const CategoryBrands = ({ categoryName, brands }: CategoryBrandsProps) => {
  if (!brands || brands.length === 0) return null;

  // Get unique brands and sort alphabetically
  const uniqueBrands = [...new Set(brands.map(b => b.trim()))].sort();

  // Get series for each brand if available
  const getBrandSeries = (brand: string): string[] => {
    const lowerBrand = brand.toLowerCase();
    return BRAND_SERIES[lowerBrand] || [];
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Brands & Series We Support
              </h2>
              <p className="text-muted-foreground">
                Authorized and verified industrial automation brands
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueBrands.map((brand, index) => {
              const series = getBrandSeries(brand);
              return (
                <div 
                  key={index}
                  className="p-4 bg-background rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-foreground mb-2">{brand}</h3>
                  {series.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {series.slice(0, 4).map((s, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-xs font-normal"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Can't find your brand? <a href="/contact" className="text-primary hover:underline">Contact us</a> – we source from 50+ manufacturers worldwide.
          </p>
        </div>
      </div>
    </section>
  );
};
