import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye } from "lucide-react";

interface AlertBannerProps {
  alertCount: number;
  onViewDetails: () => void;
}

export const AlertBanner = ({ alertCount, onViewDetails }: AlertBannerProps) => {
  if (alertCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Active Search Alerts</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {alertCount} {alertCount === 1 ? 'query needs' : 'queries need'} attention - zero results detected
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewDetails}
          className="ml-4"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </AlertDescription>
    </Alert>
  );
};