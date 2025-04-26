import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name"),
  email: text("email"),
  address: text("address"),
  supabaseUserId: text("supabase_user_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Kitchens Table
export const kitchens = pgTable("kitchens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  city: text("city").notNull(),
  openTime: text("open_time"),
  closeTime: text("close_time"),
  isActive: boolean("is_active").default(true),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  categorySlug: text("category_slug"),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  kitchenId: integer("kitchen_id").references(() => kitchens.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery Slots Table
export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").default(10),
  bookedCount: integer("booked_count").default(0),
  kitchenId: integer("kitchen_id").references(() => kitchens.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  kitchenId: integer("kitchen_id").notNull().references(() => kitchens.id),
  orderMode: text("order_mode").notNull(),
  orderStatus: text("order_status").notNull().default("pending"),
  deliverySlotId: integer("delivery_slot_id").references(() => deliverySlots.id),
  deliveryAddress: text("delivery_address"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema definitions for input validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertKitchenSchema = createInsertSchema(kitchens).omit({
  id: true,
  createdAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});

export const insertDeliverySlotSchema = createInsertSchema(deliverySlots).omit({
  id: true,
  createdAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true
});

// Types for database operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertKitchen = z.infer<typeof insertKitchenSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertDeliverySlot = z.infer<typeof insertDeliverySlotSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type User = typeof users.$inferSelect;
export type Kitchen = typeof kitchens.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type DeliverySlot = typeof deliverySlots.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
