import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RangeFilterProps {
  ranges: Array<{ id: string; name: string; count: number }>;
  selectedRanges: string[];
  onChange: (ranges: string[]) => void;
}

export const RangeFilter = ({ ranges, selectedRanges, onChange }: RangeFilterProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayRanges = showAll ? ranges : ranges.slice(0, 8);
  const hasMore = ranges.length > 8;

  const handleCheckChange = (rangeId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedRanges, rangeId]);
    } else {
      onChange(selectedRanges.filter((id) => id !== rangeId));
    }
  };

  return (
    <div className="space-y-3">
      {displayRanges.map((range) => (
        <div key={range.id} className="flex items-center space-x-2">
          <Checkbox
            id={`range-${range.id}`}
            checked={selectedRanges.includes(range.id)}
            onCheckedChange={(checked) => handleCheckChange(range.id, checked as boolean)}
          />
          <Label
            htmlFor={`range-${range.id}`}
            className="text-sm font-normal cursor-pointer flex-1"
          >
            {range.name} ({range.count})
          </Label>
        </div>
      ))}
      {hasMore && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="p-0 h-auto text-primary"
        >
          {showAll ? "View less" : `View more (${ranges.length - 8})`}
        </Button>
      )}
    </div>
  );
};
