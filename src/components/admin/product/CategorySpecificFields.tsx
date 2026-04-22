import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryFieldConfigs, CategoryFieldConfig } from "@/config/categoryFields";
import { Info } from "lucide-react";

interface CategorySpecificFieldsProps {
  categorySlug: string | undefined;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export const CategorySpecificFields = ({
  categorySlug,
  values,
  onChange,
}: CategorySpecificFieldsProps) => {
  if (!categorySlug || !categoryFieldConfigs[categorySlug]) {
    return null;
  }

  const config = categoryFieldConfigs[categorySlug];

  const renderField = (field: CategoryFieldConfig) => {
    const value = values[field.id] || '';

    switch (field.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => onChange(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case 'number':
        return (
          <div className="relative">
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div className="relative">
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {field.unit}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {config.name} Specifications
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {config.description} - Fill in the relevant specifications
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
