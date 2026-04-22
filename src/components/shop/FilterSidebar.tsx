import { FilterSection } from "./FilterSection";
import { CategoryFilter } from "./CategoryFilter";
import { BrandFilter } from "./BrandFilter";
import { StatusFilter } from "./StatusFilter";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { ConditionFilter } from "./ConditionFilter";
import { RangeFilter } from "./RangeFilter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// New advanced filter props (for Shop page)
interface AdvancedFilterSidebarProps {
  // Brand filter
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  brandCounts?: Record<string, number>;
  // Category filter
  categories: Array<{ id: string; name: string; count: number }>;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  // Status filter
  productStatus: string;
  onProductStatusChange: (status: string) => void;
  // Availability filter
  selectedAvailability: string[];
  onAvailabilityChange: (availability: string[]) => void;
  // Condition filter
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  // Power range filter (technical)
  ranges: Array<{ id: string; name: string; count: number }>;
  selectedRanges: string[];
  onRangesChange: (ranges: string[]) => void;
  // General
  onClearFilters: () => void;
  totalProducts: number;
}

// Legacy props (for CategoryPage, etc.)
interface LegacyFilterSidebarProps {
  ranges: Array<{ id: string; name: string; count: number }>;
  categories: Array<{ id: string; name: string; count: number }>;
  selectedRanges: string[];
  selectedCategories: string[];
  productViewType: string;
  onRangesChange: (ranges: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onProductViewTypeChange: (type: string) => void;
  onClearFilters: () => void;
  totalProducts: number;
}

type FilterSidebarProps = AdvancedFilterSidebarProps | LegacyFilterSidebarProps;

// Type guard to check if using legacy props
function isLegacyProps(props: FilterSidebarProps): props is LegacyFilterSidebarProps {
  return 'productViewType' in props;
}

export const FilterSidebar = (props: FilterSidebarProps) => {
  if (isLegacyProps(props)) {
    return <LegacyFilterSidebar {...props} />;
  }
  return <AdvancedFilterSidebar {...props} />;
};

// Legacy sidebar component (for CategoryPage, etc.)
const LegacyFilterSidebar = ({
  ranges,
  categories,
  selectedRanges,
  selectedCategories,
  productViewType,
  onRangesChange,
  onCategoriesChange,
  onProductViewTypeChange,
  onClearFilters,
  totalProducts,
}: LegacyFilterSidebarProps) => {
  const hasActiveFilters = selectedRanges.length > 0 || selectedCategories.length > 0 || productViewType !== "all";

  return (
    <div className="w-full h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-lg font-bold">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <FilterSection title="Products" defaultOpen={true}>
          <RadioGroup value={productViewType} onValueChange={onProductViewTypeChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="view-all" />
                <Label htmlFor="view-all" className="text-sm font-normal cursor-pointer">
                  All product categories ({totalProducts})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="featured" id="view-featured" />
                <Label htmlFor="view-featured" className="text-sm font-normal cursor-pointer">
                  Featured Products
                </Label>
              </div>
            </div>
          </RadioGroup>
        </FilterSection>

        <FilterSection title="Ranges" defaultOpen={true}>
          <RangeFilter ranges={ranges} selectedRanges={selectedRanges} onChange={onRangesChange} />
        </FilterSection>

        <FilterSection title="Series" defaultOpen={false}>
          <CategoryFilter categories={categories} selectedCategories={selectedCategories} onChange={onCategoriesChange} />
        </FilterSection>
      </div>
    </div>
  );
};

// Advanced sidebar component (for Shop page)
const AdvancedFilterSidebar = ({
  selectedBrands,
  onBrandsChange,
  brandCounts,
  categories,
  selectedCategories,
  onCategoriesChange,
  productStatus,
  onProductStatusChange,
  selectedAvailability,
  onAvailabilityChange,
  selectedConditions,
  onConditionsChange,
  ranges,
  selectedRanges,
  onRangesChange,
  onClearFilters,
  totalProducts,
}: AdvancedFilterSidebarProps) => {
  const hasActiveFilters = 
    selectedBrands.length > 0 || 
    selectedCategories.length > 0 || 
    productStatus !== "all" ||
    selectedAvailability.length > 0 ||
    selectedConditions.length > 0 ||
    selectedRanges.length > 0;

  return (
    <div className="w-full h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-lg font-bold">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <FilterSection title="Brand" defaultOpen={true}>
          <BrandFilter selectedBrands={selectedBrands} onChange={onBrandsChange} brandCounts={brandCounts} />
        </FilterSection>

        <FilterSection title="Category" defaultOpen={true}>
          <CategoryFilter categories={categories} selectedCategories={selectedCategories} onChange={onCategoriesChange} />
        </FilterSection>

        <FilterSection title="Product Status" defaultOpen={false}>
          <StatusFilter value={productStatus} onChange={onProductStatusChange} />
        </FilterSection>

        <FilterSection title="Availability" defaultOpen={false}>
          <AvailabilityFilter selectedAvailability={selectedAvailability} onChange={onAvailabilityChange} />
        </FilterSection>

        <FilterSection title="Condition" defaultOpen={false}>
          <ConditionFilter selectedConditions={selectedConditions} onChange={onConditionsChange} />
        </FilterSection>

        <FilterSection title="Power Rating" defaultOpen={false}>
          <RangeFilter ranges={ranges} selectedRanges={selectedRanges} onChange={onRangesChange} />
        </FilterSection>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">{totalProducts.toLocaleString()} products available</p>
        </div>
      </div>
    </div>
  );
};
