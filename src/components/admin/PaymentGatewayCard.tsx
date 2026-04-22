import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, CreditCard } from "lucide-react";

interface PaymentGatewayCardProps {
  gateway: {
    id: string;
    gateway_name: string;
    gateway_type: string;
    display_name: string;
    description: string | null;
    is_active: boolean;
    is_test_mode: boolean;
    supported_currencies: string[];
  };
  onEdit: (gateway: any) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export function PaymentGatewayCard({
  gateway,
  onEdit,
  onDelete,
  onToggleActive,
}: PaymentGatewayCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{gateway.display_name}</CardTitle>
              <CardDescription className="text-sm">
                {gateway.gateway_type.charAt(0).toUpperCase() + gateway.gateway_type.slice(1)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {gateway.is_active ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {gateway.description && (
            <p className="text-sm text-muted-foreground">{gateway.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {gateway.is_test_mode ? "Test Mode" : "Live Mode"}
            </Badge>
            <Badge variant="outline">
              {gateway.supported_currencies.join(", ")}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Switch
                checked={gateway.is_active}
                onCheckedChange={() => onToggleActive(gateway.id, gateway.is_active)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(gateway)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(gateway.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
