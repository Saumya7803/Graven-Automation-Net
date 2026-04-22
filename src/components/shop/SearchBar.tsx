import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Search by product name, model number, or brand"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-4 pr-10 text-sm border border-border focus:border-primary"
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
};
