import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  supabase_id: text("supabase_id").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  full_name: true,
  avatar_url: true,
  supabase_id: true,
});

// Categories model
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image_url: text("image_url"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  image_url: true,
});

// Products model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  original_price: numeric("original_price"),
  image_url: text("image_url").notNull(),
  category_id: integer("category_id").notNull(),
  stock: integer("stock").notNull().default(0),
  brand: text("brand"),
  featured: boolean("featured").default(false),
  new_arrival: boolean("new_arrival").default(false),
  on_sale: boolean("on_sale").default(false),
  rating: numeric("rating").default("0"),
  review_count: integer("review_count").default(0),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  original_price: true,
  image_url: true,
  category_id: true,
  stock: true,
  brand: true,
  featured: true,
  new_arrival: true,
  on_sale: true,
  rating: true,
  review_count: true,
});

// Cart items model
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  product_id: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  user_id: true,
  product_id: true,
  quantity: true,
});

// Orders model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  total: numeric("total").notNull(),
  shipping_address: text("shipping_address").notNull(),
  payment_method: text("payment_method").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  user_id: true,
  status: true,
  total: true,
  shipping_address: true,
  payment_method: true,
});

// Order items model
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  product_id: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  order_id: true,
  product_id: true,
  quantity: true,
  price: true,
});

// Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  product_id: integer("product_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  user_id: true,
  product_id: true,
  rating: true,
  comment: true,
});

// Wishlists model
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  product_id: integer("product_id").notNull(),
});

export const insertWishlistSchema = createInsertSchema(wishlists).pick({
  user_id: true,
  product_id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
