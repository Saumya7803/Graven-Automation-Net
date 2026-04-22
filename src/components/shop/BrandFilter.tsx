import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const BRANDS = [
  { id: "siemens", name: "Siemens" },
  { id: "allen-bradley", name: "Allen Bradley / Rockwell" },
  { id: "schneider", name: "Schneider Electric" },
  { id: "abb", name: "ABB" },
  { id: "mitsubishi", name: "Mitsubishi Electric" },
  { id: "delta", name: "Delta Electronics" },
  { id: "yaskawa", name: "Yaskawa" },
  { id: "lenze", name: "Lenze" },
  { id: "invt", name: "INVT" },
];

interface BrandFilterProps {
  selectedBrands: string[];
  onChange: (brands: string[]) => void;
  brandCounts?: Record<string, number>;
}

export const BrandFilter = ({ selectedBrands, onChange, brandCounts = {} }: BrandFilterProps) => {
  const handleCheckChange = (brandId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedBrands, brandId]);
    } else {
      onChange(selectedBrands.filter((id) => id !== brandId));
    }
  };

  return (
    <div className="space-y-3">
      {BRANDS.map((brand) => {
        const count = brandCounts[brand.id] || 0;
        return (
          <div key={brand.id} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.id)}
              onCheckedChange={(checked) => handleCheckChange(brand.id, checked as boolean)}
            />
            <Label
              htmlFor={`brand-${brand.id}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {brand.name} {count > 0 && `(${count})`}
            </Label>
          </div>
        );
      })}
    </div>
  );
};

export { BRANDS };
