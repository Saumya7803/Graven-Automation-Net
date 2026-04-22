import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) {
    return 'Price on Request';
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type CustomerTier = 'vip' | 'regular' | 'new';

export function calculateCustomerTier(
  totalSpent: number,
  totalOrders: number,
  createdAt: string
): CustomerTier {
  // VIP: High-value customers
  if (totalSpent >= 100000 || totalOrders >= 10) {
    return 'vip';
  }
  
  // Regular: Active customers with moderate spending
  if (totalSpent >= 20000 || totalOrders >= 5) {
    return 'regular';
  }
  
  // New: Recently joined customers
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  if (accountAge < thirtyDaysInMs) {
    return 'new';
  }
  
  // Default to regular for established customers with low activity
  return 'regular';
}

export function getTierBadgeConfig(tier: CustomerTier) {
  switch (tier) {
    case 'vip':
      return {
        label: 'VIP',
        variant: 'vip' as const,
        icon: '👑'
      };
    case 'regular':
      return {
        label: 'Regular',
        variant: 'regular' as const,
        icon: '⭐'
      };
    case 'new':
      return {
        label: 'New',
        variant: 'new' as const,
        icon: '🆕'
      };
  }
}
