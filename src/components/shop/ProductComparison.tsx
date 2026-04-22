import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductComparisonProps {
  selectedCount: number;
  onCompare: () => void;
  onClear: () => void;
}

export const ProductComparison = ({ selectedCount, onCompare, onClear }: ProductComparisonProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
              {selectedCount} product{selectedCount > 1 ? "s" : ""} selected for comparison
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <Button
            onClick={onCompare}
            disabled={selectedCount < 2}
            className={cn(
              "bg-primary hover:bg-primary-hover",
              selectedCount < 2 && "opacity-50 cursor-not-allowed"
            )}
          >
            Compare Products {selectedCount >= 2 && `(${selectedCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
};
