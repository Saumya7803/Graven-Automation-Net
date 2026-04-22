import { useEffect, useState } from "react";
import { Package, CheckCircle, Clock, Truck, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface OrderStatusAnimationProps {
  status: string;
  previousStatus?: string;
}

export default function OrderStatusAnimation({ 
  status, 
  previousStatus 
}: OrderStatusAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousStatus && previousStatus !== status) {
      setIsAnimating(true);
      
      // Trigger confetti for delivered status
      if (status === 'delivered') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [status, previousStatus]);

  const getIcon = () => {
    const icons = {
      pending: Package,
      confirmed: CheckCircle,
      processing: Clock,
      shipped: Truck,
      delivered: Home,
    };
    return icons[status as keyof typeof icons] || Package;
  };

  const Icon = getIcon();

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border transition-all duration-500",
      isAnimating && "scale-105 shadow-lg",
      status === 'delivered' && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
      status === 'shipped' && "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
      status === 'processing' && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
      status === 'confirmed' && "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
      status === 'pending' && "bg-muted border-border"
    )}>
      <div className={cn(
        "p-3 rounded-full transition-transform duration-500",
        isAnimating && "rotate-[360deg]",
        status === 'delivered' && "bg-green-100 dark:bg-green-900",
        status === 'shipped' && "bg-blue-100 dark:bg-blue-900",
        status === 'processing' && "bg-yellow-100 dark:bg-yellow-900",
        status === 'confirmed' && "bg-purple-100 dark:bg-purple-900",
        status === 'pending' && "bg-background"
      )}>
        <Icon className={cn(
          "h-6 w-6 transition-colors",
          status === 'delivered' && "text-green-600 dark:text-green-400",
          status === 'shipped' && "text-blue-600 dark:text-blue-400",
          status === 'processing' && "text-yellow-600 dark:text-yellow-400",
          status === 'confirmed' && "text-purple-600 dark:text-purple-400",
          status === 'pending' && "text-muted-foreground"
        )} />
      </div>
      
      <div className="flex-1">
        <h3 className={cn(
          "font-semibold capitalize transition-colors",
          isAnimating && "text-primary"
        )}>
          {status}
        </h3>
        <p className="text-sm text-muted-foreground">
          {status === 'delivered' && "Your order has been delivered!"}
          {status === 'shipped' && "Your order is on the way"}
          {status === 'processing' && "We're preparing your order"}
          {status === 'confirmed' && "Order confirmed"}
          {status === 'pending' && "Order received"}
        </p>
      </div>
    </div>
  );
}
