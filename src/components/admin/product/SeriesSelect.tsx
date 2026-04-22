import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSeriesForBrandCategory, SeriesInfo } from "@/config/brandSeriesConfig";

interface SeriesSelectProps {
  value: string;
  onChange: (value: string) => void;
  brandSlug?: string;
  categorySlug?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SeriesSelect({
  value,
  onChange,
  brandSlug,
  categorySlug,
  required = false,
  disabled = false,
}: SeriesSelectProps) {
  // Get series based on brand and category
  const series: SeriesInfo[] = brandSlug && categorySlug 
    ? getSeriesForBrandCategory(brandSlug, categorySlug) 
    : [];

  // If brand is "other" or no series available, show text input
  const showTextInput = brandSlug === 'other' || series.length === 0;

  if (showTextInput) {
    return (
      <div className="space-y-2">
        <Label htmlFor="series">
          Series/Model Line {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="series"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter series or model line (e.g., ATV320, S7-1200)"
          disabled={disabled}
        />
        <p className="text-sm text-muted-foreground">
          Enter the product series or model line name
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="series">
        Series {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="series">
          <SelectValue placeholder="Select a series" />
        </SelectTrigger>
        <SelectContent>
          {series.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              <div className="flex flex-col">
                <span>{s.label}</span>
                {s.description && (
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="other">Other (specify in name)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
