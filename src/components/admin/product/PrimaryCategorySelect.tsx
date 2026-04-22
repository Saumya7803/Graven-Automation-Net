import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { categoryFieldConfigs, getCategorySlugByName } from "@/config/categoryFields";
import { useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface PrimaryCategorySelectProps {
  categories: Category[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string, categorySlug: string | undefined) => void;
}

export const PrimaryCategorySelect = ({
  categories,
  selectedCategoryId,
  onSelect,
}: PrimaryCategorySelectProps) => {
  // Group categories by whether they have specific fields
  const categorizedList = useMemo(() => {
    const withFields: Category[] = [];
    const withoutFields: Category[] = [];
    
    categories.forEach((cat) => {
      const slug = cat.slug || getCategorySlugByName(cat.name);
      if (slug && categoryFieldConfigs[slug]) {
        withFields.push(cat);
      } else {
        withoutFields.push(cat);
      }
    });
    
    return { withFields, withoutFields };
  }, [categories]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedSlug = selectedCategory 
    ? (selectedCategory.slug || getCategorySlugByName(selectedCategory.name))
    : undefined;
  const selectedConfig = selectedSlug ? categoryFieldConfigs[selectedSlug] : undefined;

  const handleSelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const slug = category?.slug || getCategorySlugByName(category?.name || '');
    onSelect(categoryId, slug);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-semibold">Primary Product Category *</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select the main category to show category-specific fields
        </p>
      </div>
      
      <Select value={selectedCategoryId} onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select product category..." />
        </SelectTrigger>
        <SelectContent>
          {categorizedList.withFields.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Categories with specific fields
              </div>
              {categorizedList.withFields.map((category) => {
                const slug = category.slug || getCategorySlugByName(category.name);
                const config = slug ? categoryFieldConfigs[slug] : undefined;
                return (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.name}</span>
                      {config && (
                        <Badge variant="secondary" className="text-xs">
                          {config.fields.length} fields
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </>
          )}
          
          {categorizedList.withoutFields.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                Other categories
              </div>
              {categorizedList.withoutFields.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {selectedConfig && (
        <div className="bg-muted/50 rounded-lg p-3 mt-2">
          <p className="text-sm font-medium mb-2">
            {selectedConfig.name}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {selectedConfig.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedConfig.fields.map((field) => (
              <Badge 
                key={field.id} 
                variant={field.required ? "default" : "outline"}
                className="text-xs"
              >
                {field.label}
                {field.required && " *"}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
