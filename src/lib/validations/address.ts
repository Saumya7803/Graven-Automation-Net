import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be less than 200 characters")
    .trim(),
  city: z.string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters")
    .trim(),
  state: z.string()
    .min(2, "State/Province must be at least 2 characters")
    .max(100, "State/Province must be less than 100 characters")
    .trim(),
  zip: z.string()
    .min(3, "ZIP/Postal code must be at least 3 characters")
    .max(20, "ZIP/Postal code must be less than 20 characters")
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid ZIP/Postal code format")
    .trim(),
  country: z.string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be less than 100 characters")
    .trim(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export interface AddressValidationResult {
  isValid: boolean;
  isDeliverable: boolean;
  confidence: 'high' | 'medium' | 'low';
  formattedAddress?: string;
  suggestions?: Array<{
    formattedAddress: string;
    components: Partial<AddressFormData>;
  }>;
  message?: string;
}
