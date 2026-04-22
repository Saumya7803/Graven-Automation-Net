import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const AVAILABILITY_OPTIONS = [
  { id: "in-stock", name: "In Stock" },
  { id: "fast-sourcing", name: "Fast Sourcing" },
  { id: "on-request", name: "On Request" },
];

interface AvailabilityFilterProps {
  selectedAvailability: string[];
  onChange: (availability: string[]) => void;
}

export const AvailabilityFilter = ({ selectedAvailability, onChange }: AvailabilityFilterProps) => {
  const handleCheckChange = (availabilityId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedAvailability, availabilityId]);
    } else {
      onChange(selectedAvailability.filter((id) => id !== availabilityId));
    }
  };

  return (
    <div className="space-y-3">
      {AVAILABILITY_OPTIONS.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`availability-${option.id}`}
            checked={selectedAvailability.includes(option.id)}
            onCheckedChange={(checked) => handleCheckChange(option.id, checked as boolean)}
          />
          <Label
            htmlFor={`availability-${option.id}`}
            className="text-sm font-normal cursor-pointer flex-1"
          >
            {option.name}
          </Label>
        </div>
      ))}
    </div>
  );
};
