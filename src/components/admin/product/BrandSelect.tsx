import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBrandsForCategory, getAllBrands } from "@/config/brandSeriesConfig";

interface BrandSelectProps {
  value: string;
  onChange: (value: string) => void;
  categorySlug?: string;
  required?: boolean;
  disabled?: boolean;
}

export function BrandSelect({
  value,
  onChange,
  categorySlug,
  required = false,
  disabled = false,
}: BrandSelectProps) {
  // Get brands based on category, or all brands if no category selected
  let brands = categorySlug 
    ? getBrandsForCategory(categorySlug) 
    : getAllBrands();

  // If category has no specific brands, fall back to all brands
  // This allows admins to select any brand for new/unconfigured categories
  if (brands.length === 0 && categorySlug) {
    brands = getAllBrands();
  }

  // Add "Other" option if not already present
  const hasOther = brands.some(b => b.value === 'other');
  const brandsWithOther = hasOther 
    ? brands 
    : [...brands, { value: 'other', label: 'Other' }];

  return (
    <div className="space-y-2">
      <Label htmlFor="brand">
        Brand {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="brand">
          <SelectValue placeholder="Select a brand" />
        </SelectTrigger>
        <SelectContent>
          {brandsWithOther.map((brand) => (
            <SelectItem key={brand.value} value={brand.value}>
              {brand.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categorySlug && brands.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No specific brands configured for this category. Select "Other" to continue.
        </p>
      )}
    </div>
  );
}
