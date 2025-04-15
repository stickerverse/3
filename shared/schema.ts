import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const vinylSizes = pgTable("vinyl_sizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  width: integer("width").notNull(), // in mm
  height: integer("height").notNull(), // in mm
  description: text("description"),
  recommendedFor: text("recommended_for"),
  default: boolean("default").default(false),
});

export const vinylMaterials = pgTable("vinyl_materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // indoor, outdoor, specialty
  color: text("color"), // base color
  durability: text("durability"), // low, medium, high
  description: text("description"),
  default: boolean("default").default(false),
});

export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
  userId: integer("user_id").references(() => users.id),
  sizeId: integer("size_id").references(() => vinylSizes.id),
  materialId: integer("material_id").references(() => vinylMaterials.id),
  dimensions: json("dimensions").$type<{ width: number, height: number }>(),
  createdAt: text("created_at").notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVinylSizeSchema = createInsertSchema(vinylSizes).pick({
  name: true,
  width: true,
  height: true,
  description: true,
  recommendedFor: true,
  default: true,
});

export const insertVinylMaterialSchema = createInsertSchema(vinylMaterials).pick({
  name: true,
  type: true,
  color: true,
  durability: true,
  description: true,
  default: true,
});

export const insertDesignSchema = createInsertSchema(designs).pick({
  name: true,
  data: true,
  userId: true,
  sizeId: true,
  materialId: true,
  dimensions: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVinylSize = z.infer<typeof insertVinylSizeSchema>;
export type VinylSize = typeof vinylSizes.$inferSelect;

export type InsertVinylMaterial = z.infer<typeof insertVinylMaterialSchema>;
export type VinylMaterial = typeof vinylMaterials.$inferSelect;

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = typeof designs.$inferSelect;
