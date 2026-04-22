import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CONDITION_OPTIONS = [
  { id: "new", name: "New" },
  { id: "refurbished", name: "Refurbished / Tested" },
];

interface ConditionFilterProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

export const ConditionFilter = ({ selectedConditions, onChange }: ConditionFilterProps) => {
  const handleCheckChange = (conditionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedConditions, conditionId]);
    } else {
      onChange(selectedConditions.filter((id) => id !== conditionId));
    }
  };

  return (
    <div className="space-y-3">
      {CONDITION_OPTIONS.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`condition-${option.id}`}
            checked={selectedConditions.includes(option.id)}
            onCheckedChange={(checked) => handleCheckChange(option.id, checked as boolean)}
          />
          <Label
            htmlFor={`condition-${option.id}`}
            className="text-sm font-normal cursor-pointer flex-1"
          >
            {option.name}
          </Label>
        </div>
      ))}
    </div>
  );
};
