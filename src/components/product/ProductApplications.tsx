import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Factory } from "lucide-react";

interface ProductApplicationsProps {
  category?: string | null;
}

const defaultApplications = [
  "Conveyor systems",
  "Pumps and fans",
  "Packaging machines",
  "Material handling equipment",
  "Industrial machinery"
];

const defaultIndustries = [
  "Manufacturing",
  "Automotive",
  "Food & Beverage",
  "Pharmaceuticals",
  "Textiles",
  "Cement & Mining"
];

export const ProductApplications = ({ category }: ProductApplicationsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Typical Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {defaultApplications.map((app, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                {app}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Factory className="h-5 w-5 text-primary" />
            Industries Served
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {defaultIndustries.map((industry, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
              >
                {industry}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
