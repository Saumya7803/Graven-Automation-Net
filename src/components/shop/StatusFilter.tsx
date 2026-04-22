import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  counts?: {
    all?: number;
    active?: number;
    discontinued?: number;
    obsolete?: number;
  };
}

export const StatusFilter = ({ value, onChange, counts }: StatusFilterProps) => {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="status-all" />
            <Label htmlFor="status-all" className="text-sm font-normal cursor-pointer">
              All Products
            </Label>
          </div>
          {counts?.all !== undefined && (
            <Badge variant="secondary" className="text-xs">{counts.all}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="status-active" />
            <Label htmlFor="status-active" className="text-sm font-normal cursor-pointer flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Active
            </Label>
          </div>
          {counts?.active !== undefined && (
            <Badge variant="secondary" className="text-xs">{counts.active}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="discontinued" id="status-discontinued" />
            <Label htmlFor="status-discontinued" className="text-sm font-normal cursor-pointer flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Discontinued
            </Label>
          </div>
          {counts?.discontinued !== undefined && (
            <Badge variant="secondary" className="text-xs">{counts.discontinued}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="obsolete" id="status-obsolete" />
            <Label htmlFor="status-obsolete" className="text-sm font-normal cursor-pointer flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              End-of-Life
            </Label>
          </div>
          {counts?.obsolete !== undefined && (
            <Badge variant="secondary" className="text-xs">{counts.obsolete}</Badge>
          )}
        </div>
      </div>
    </RadioGroup>
  );
};
