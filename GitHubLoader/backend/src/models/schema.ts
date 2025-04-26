import { pgTable, text, integer, serial, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  phone: text("phone").unique(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow()
});

// Kitchens Table
export const kitchens = pgTable("kitchens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  city: text("city").notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  isActive: boolean("is_active").default(true),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow()
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  categorySlug: text("category_slug").notNull(),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  kitchenId: integer("kitchen_id").references(() => kitchens.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Delivery Slots Table
export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  bookedCount: integer("booked_count").default(0),
  kitchenId: integer("kitchen_id").references(() => kitchens.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  kitchenId: integer("kitchen_id").references(() => kitchens.id).notNull(),
  orderMode: text("order_mode").notNull(), // delivery, takeaway
  orderStatus: text("order_status").notNull(), // pending, confirmed, cooking, ready, out-for-delivery, delivered, cancelled
  deliverySlotId: integer("delivery_slot_id").references(() => deliverySlots.id),
  deliveryAddress: text("delivery_address"),
  subtotal: text("subtotal").notNull(),
  deliveryFee: text("delivery_fee").notNull(),
  serviceFee: text("service_fee").notNull(),
  total: text("total").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// OTP Verifications Table
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Define the relationships
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  kitchen: one(kitchens, {
    fields: [products.kitchenId],
    references: [kitchens.id]
  })
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const kitchensRelations = relations(kitchens, ({ many }) => ({
  products: many(products),
  deliverySlots: many(deliverySlots),
  orders: many(orders)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  kitchen: one(kitchens, {
    fields: [orders.kitchenId],
    references: [kitchens.id]
  }),
  deliverySlot: one(deliverySlots, {
    fields: [orders.deliverySlotId],
    references: [deliverySlots.id]
  }),
  items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

export const deliverySlotsRelations = relations(deliverySlots, ({ one, many }) => ({
  kitchen: one(kitchens, {
    fields: [deliverySlots.kitchenId],
    references: [kitchens.id]
  }),
  orders: many(orders)
}));

// Create Zod Schemas for validation
export const kitchenInsertSchema = createInsertSchema(kitchens);
export const kitchenSelectSchema = createSelectSchema(kitchens);
export type Kitchen = z.infer<typeof kitchenSelectSchema>;
export type InsertKitchen = z.infer<typeof kitchenInsertSchema>;

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);
export type Category = z.infer<typeof categorySelectSchema>;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;

export const productInsertSchema = createInsertSchema(products);
export const productSelectSchema = createSelectSchema(products);
export type Product = z.infer<typeof productSelectSchema>;
export type InsertProduct = z.infer<typeof productInsertSchema>;

export const deliverySlotInsertSchema = createInsertSchema(deliverySlots);
export const deliverySlotSelectSchema = createSelectSchema(deliverySlots);
export type DeliverySlot = z.infer<typeof deliverySlotSelectSchema>;
export type InsertDeliverySlot = z.infer<typeof deliverySlotInsertSchema>;

export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;

export const orderInsertSchema = createInsertSchema(orders);
export const orderSelectSchema = createSelectSchema(orders);
export type Order = z.infer<typeof orderSelectSchema>;
export type InsertOrder = z.infer<typeof orderInsertSchema>;

export const orderItemInsertSchema = createInsertSchema(orderItems);
export const orderItemSelectSchema = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof orderItemSelectSchema>;
export type InsertOrderItem = z.infer<typeof orderItemInsertSchema>;

export const otpVerificationInsertSchema = createInsertSchema(otpVerifications);
export const otpVerificationSelectSchema = createSelectSchema(otpVerifications);
export type OtpVerification = z.infer<typeof otpVerificationSelectSchema>;
export type InsertOtpVerification = z.infer<typeof otpVerificationInsertSchema>;

// Custom schemas for API endpoints
export const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,12}$/, "Invalid phone number format")
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,12}$/, "Invalid phone number format"),
  otp: z.string().min(4, "OTP must be at least 4 characters").max(6, "OTP must be at most 6 characters")
});

export const createOrderSchema = z.object({
  kitchenId: z.number(),
  orderMode: z.string(),
  deliverySlotId: z.number().nullable(),
  deliveryAddress: z.string().nullable(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    notes: z.string().optional()
  })),
  subtotal: z.string(),
  deliveryFee: z.string(),
  serviceFee: z.string(),
  total: z.string()
});