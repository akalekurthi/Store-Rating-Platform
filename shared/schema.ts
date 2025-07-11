import { pgTable, text, serial, integer, timestamp, varchar, decimal, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  address: text("address"),
  role: varchar("role", { length: 20 }).notNull().default("user"), // admin, user, store_owner
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stores table
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  address: text("address").notNull(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userStoreUnique: unique().on(table.userId, table.storeId),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ratings: many(ratings),
  ownedStores: many(stores),
}));

export const storesRelations = relations(stores, ({ many, one }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
  store: one(stores, { fields: [ratings.storeId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/, "Password must contain at least one uppercase letter and one special character"),
  address: z.string().max(400, "Address must not exceed 400 characters").optional(),
  role: z.enum(["admin", "user", "store_owner"]).default("user"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertStoreSchema = createInsertSchema(stores, {
  name: z.string().min(1, "Store name is required").max(255, "Store name must not exceed 255 characters"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(1, "Address is required").max(400, "Address must not exceed 400 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true, averageRating: true, totalRatings: true });

export const insertRatingSchema = createInsertSchema(ratings, {
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
  review: z.string().max(1000, "Review must not exceed 1000 characters").optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters")
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/, "Password must contain at least one uppercase letter and one special character"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
