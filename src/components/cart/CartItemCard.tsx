import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartItemCardProps {
  item: {
    id: string;
    product_id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      series: string;
      sku: string;
    };
  };
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateQuantity, removeFromCart, isLoading } = useCart();

  const itemTotal = (item.product?.price || 0) * item.quantity;

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold">{item.product?.name}</h4>
        <p className="text-sm text-muted-foreground">{item.product?.series}</p>
        <p className="text-sm text-muted-foreground">SKU: {item.product?.sku}</p>
        <p className="font-semibold mt-2">₹{item.product?.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(item.id)}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={isLoading || item.quantity <= 1}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={isLoading || item.quantity >= 99}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="font-semibold">₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};
