import { useCallback } from "react";

const brands = [
  { id: "siemens", name: "Siemens", logo: "S" },
  { id: "allen-bradley", name: "Allen Bradley", logo: "AB" },
  { id: "schneider", name: "Schneider Electric", logo: "SE" },
  { id: "abb", name: "ABB", logo: "ABB" },
  { id: "mitsubishi", name: "Mitsubishi", logo: "M" },
  { id: "delta", name: "Delta", logo: "Δ" },
  { id: "yaskawa", name: "Yaskawa", logo: "Y" },
  { id: "lenze", name: "Lenze", logo: "L" },
  { id: "invt", name: "INVT", logo: "I" },
];

interface BrandBrowsingProps {
  onBrandClick?: (brandId: string) => void;
}

export const BrandBrowsing = ({ onBrandClick }: BrandBrowsingProps) => {
  const handleClick = useCallback((brandId: string) => {
    if (onBrandClick) {
      onBrandClick(brandId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onBrandClick]);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Shop by Brand
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleClick(brand.id)}
              className="flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center mb-2">
                <span className="text-lg md:text-xl font-bold text-foreground">
                  {brand.logo}
                </span>
              </div>
              <span className="text-xs text-muted-foreground text-center px-1 leading-tight">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
