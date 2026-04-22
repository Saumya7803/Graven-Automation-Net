import { format } from "date-fns";
import { Truck, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCarrierTrackingUrl } from "@/lib/orderTracking";
import { useState } from "react";

interface TrackingInfoCardProps {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string | null;
}

export default function TrackingInfoCard({
  trackingNumber,
  carrier,
  estimatedDelivery,
}: TrackingInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const trackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    toast.success("Tracking number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Shipment Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
          <div className="flex items-center gap-2">
            <code className="bg-background px-3 py-2 rounded text-sm font-mono flex-1">
              {trackingNumber}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyTrackingNumber}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Carrier</p>
          <p className="font-semibold capitalize">{carrier}</p>
        </div>

        {estimatedDelivery && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
            <p className="font-semibold">{format(new Date(estimatedDelivery), "PPP")}</p>
          </div>
        )}

        {trackingUrl && (
          <Button asChild className="w-full">
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
              Track Your Shipment
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Not received yet?{" "}
          <a href="/contact" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
