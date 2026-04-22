import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string; count: number }>;
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export const CategoryFilter = ({ categories, selectedCategories, onChange }: CategoryFilterProps) => {
  const handleCheckChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedCategories, categoryId]);
    } else {
      onChange(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center space-x-2">
          <Checkbox
            id={`category-${category.id}`}
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={(checked) => handleCheckChange(category.id, checked as boolean)}
          />
          <Label
            htmlFor={`category-${category.id}`}
            className="text-sm font-normal cursor-pointer flex-1"
          >
            {category.name} ({category.count})
          </Label>
        </div>
      ))}
    </div>
  );
};
