
# Display Product Prices on Shop Page Cards

## Problem

The `ProductCard` component has access to `product.price` but never displays it. All products show only the "Request Price" button, even when prices are available in the database.

## Solution

Update `ProductCard.tsx` to show the price when available, and only show "Request Price" when the price is null or the product is quote-only.

### Changes to `src/components/shop/ProductCard.tsx`

**1. Import `formatCurrency` utility (line 7)**

Add import:
```tsx
import { cn, formatCurrency } from "@/lib/utils";
```

**2. Add price display in CardContent (after line 168, before closing `</CardContent>`)**

Add a price section:
```tsx
{/* Price */}
{product.price && !product.is_quote_only ? (
  <p className="text-lg font-bold text-primary mt-2">
    {formatCurrency(product.price)}
  </p>
) : (
  <p className="text-sm text-muted-foreground mt-2 italic">
    Price on Request
  </p>
)}
```

**3. Update the primary CTA button (lines 172-178)**

Change the button text dynamically based on price availability:
```tsx
<Button asChild className="w-full bg-primary hover:bg-primary/90">
  <Link to={`/product/${product.id}`}>
    <FileText className="mr-2 h-4 w-4" />
    {product.price && !product.is_quote_only ? "Buy Now" : "Request Price"}
  </Link>
</Button>
```

## Summary

| Scenario | Price Display | Button Text |
|----------|--------------|-------------|
| Price exists, not quote-only | Shows formatted price (e.g., "₹40,000.00") | "Buy Now" |
| No price or quote-only | Shows "Price on Request" | "Request Price" |

## File Modified

- `src/components/shop/ProductCard.tsx`
