import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/, "Password must contain at least one uppercase letter and one special character"),
  address: z.string().max(400, "Address must not exceed 400 characters").optional(),
  role: z.enum(["user", "store_owner"]).default("user"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/, "Password must contain at least one uppercase letter and one special character"),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Store name is required").max(255, "Store name must not exceed 255 characters"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(1, "Address is required").max(400, "Address must not exceed 400 characters"),
  ownerId: z.number().min(1, "Owner is required"),
});

export const ratingSchema = z.object({
  storeId: z.number().min(1, "Store is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
  review: z.string().max(1000, "Review must not exceed 1000 characters").optional(),
});
