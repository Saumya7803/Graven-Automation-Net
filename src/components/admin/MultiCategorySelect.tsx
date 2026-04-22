import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface MultiCategorySelectProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
}

export const MultiCategorySelect = ({ 
  categories, 
  selectedCategoryIds, 
  onChange 
}: MultiCategorySelectProps) => {
  const handleToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedCategoryIds, categoryId]);
    } else {
      onChange(selectedCategoryIds.filter(id => id !== categoryId));
    }
  };

  const handleRemove = (categoryId: string) => {
    onChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const selectedCategories = categories.filter(cat => 
    selectedCategoryIds.includes(cat.id)
  );

  return (
    <div className="space-y-4">
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary" 
              className="gap-1"
            >
              {category.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemove(category.id)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
        {categories.map(category => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategoryIds.includes(category.id)}
              onCheckedChange={(checked) => 
                handleToggle(category.id, checked as boolean)
              }
            />
            <Label
              htmlFor={`category-${category.id}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {category.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
