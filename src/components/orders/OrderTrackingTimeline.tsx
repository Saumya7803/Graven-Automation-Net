import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle, Package, Clock, Truck, Home, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusFlow, getStatusIndex } from "@/lib/orderTracking";

interface OrderTrackingTimelineProps {
  currentStatus: string;
  statusHistory: Array<{
    status: string;
    created_at: string;
  }>;
  estimatedDelivery?: string | null;
}

export default function OrderTrackingTimeline({
  currentStatus,
  statusHistory,
  estimatedDelivery,
}: OrderTrackingTimelineProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const getIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Package,
      confirmed: CheckCircle,
      processing: Clock,
      shipped: Truck,
      delivered: Home,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Package;
    return Icon;
  };

  const getStatusDate = (status: string) => {
    const history = statusHistory.find(h => h.status === status);
    return history ? new Date(history.created_at) : null;
  };

  if (isCancelled) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3">
          <XCircle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-destructive">Order Cancelled</h3>
            <p className="text-sm text-muted-foreground">
              This order was cancelled on {format(getStatusDate('cancelled') || new Date(), "PPP")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Order Status</h2>
        {estimatedDelivery && currentStatus !== 'delivered' && (
          <div className="text-sm">
            <span className="text-muted-foreground">Estimated delivery: </span>
            <span className="font-semibold">{format(new Date(estimatedDelivery), "PPP")}</span>
          </div>
        )}
      </div>

      {/* Desktop: Horizontal Progress */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentIndex / (statusFlow.length - 1)) * 100}%` }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex justify-between">
            {statusFlow.map((step, index) => {
              const Icon = getIcon(step.key);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const date = getStatusDate(step.key);

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden space-y-4">
        {statusFlow.map((step, index) => {
          const Icon = getIcon(step.key);
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const date = getStatusDate(step.key);

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {index < statusFlow.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-12 mt-1",
                      index < currentIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p
                  className={cn(
                    "font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {date && (
                  <p className="text-sm text-muted-foreground">
                    {format(date, "PPp")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
