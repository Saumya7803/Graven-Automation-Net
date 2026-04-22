import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  selectedRanges: Array<{ id: string; name: string }>;
  selectedCategories: Array<{ id: string; name: string }>;
  onRemoveRange: (id: string) => void;
  onRemoveCategory: (id: string) => void;
}

export const ActiveFilters = ({
  selectedRanges,
  selectedCategories,
  onRemoveRange,
  onRemoveCategory,
}: ActiveFiltersProps) => {
  const hasFilters = selectedRanges.length > 0 || selectedCategories.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
      {selectedRanges.map((range) => (
        <Badge key={range.id} variant="secondary" className="gap-1">
          {range.name}
          <button
            onClick={() => onRemoveRange(range.id)}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedCategories.map((category) => (
        <Badge key={category.id} variant="secondary" className="gap-1">
          {category.name}
          <button
            onClick={() => onRemoveCategory(category.id)}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
