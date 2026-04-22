import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  phone: z.string()
    .regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits")
    .optional()
    .or(z.literal("")),
  companyName: z.string()
    .max(200, "Company name must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .trim(),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
