import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Kitchens (locations for delivery)
export const kitchens = pgTable("kitchens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  city: text("city").notNull(),
  openTime: text("open_time").default("10:00 AM"),
  closeTime: text("close_time").default("10:00 PM"),
  isActive: boolean("is_active").default(true),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

// Categories for products
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// Products
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
});

// Delivery time slots
export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity"),
  bookedCount: integer("booked_count").default(0),
  kitchenId: integer("kitchen_id").references(() => kitchens.id),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  kitchenId: integer("kitchen_id").references(() => kitchens.id),
  orderMode: text("order_mode").notNull(), // 'delivery', 'takeaway', 'dine_in'
  orderStatus: text("order_status").default("pending"), // 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
  deliverySlotId: integer("delivery_slot_id").references(() => deliverySlots.id),
  deliveryAddress: text("delivery_address"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

// User OTP verification
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  kitchen: one(kitchens, {
    fields: [products.kitchenId],
    references: [kitchens.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const kitchensRelations = relations(kitchens, ({ many }) => ({
  products: many(products),
  deliverySlots: many(deliverySlots),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  kitchen: one(kitchens, {
    fields: [orders.kitchenId],
    references: [kitchens.id],
  }),
  deliverySlot: one(deliverySlots, {
    fields: [orders.deliverySlotId],
    references: [deliverySlots.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const deliverySlotsRelations = relations(deliverySlots, ({ one, many }) => ({
  kitchen: one(kitchens, {
    fields: [deliverySlots.kitchenId],
    references: [kitchens.id],
  }),
  orders: many(orders),
}));

// Zod schemas
export const kitchenInsertSchema = createInsertSchema(kitchens);
export const kitchenSelectSchema = createSelectSchema(kitchens);
export type Kitchen = z.infer<typeof kitchenSelectSchema>;

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);
export type Category = z.infer<typeof categorySelectSchema>;

export const productInsertSchema = createInsertSchema(products);
export const productSelectSchema = createSelectSchema(products);
export type Product = z.infer<typeof productSelectSchema>;

export const deliverySlotInsertSchema = createInsertSchema(deliverySlots);
export const deliverySlotSelectSchema = createSelectSchema(deliverySlots);
export type DeliverySlot = z.infer<typeof deliverySlotSelectSchema>;

export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;

export const orderInsertSchema = createInsertSchema(orders);
export const orderSelectSchema = createSelectSchema(orders);
export type Order = z.infer<typeof orderSelectSchema>;

export const orderItemInsertSchema = createInsertSchema(orderItems);
export const orderItemSelectSchema = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof orderItemSelectSchema>;

export const otpVerificationInsertSchema = createInsertSchema(otpVerifications);
export const otpVerificationSelectSchema = createSelectSchema(otpVerifications);
export type OtpVerification = z.infer<typeof otpVerificationSelectSchema>;

// Request validation schemas
export const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const createOrderSchema = z.object({
  kitchenId: z.number(),
  orderMode: z.enum(["delivery", "takeaway", "dine_in"]),
  deliverySlotId: z.number().optional(),
  deliveryAddress: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      notes: z.string().optional(),
    })
  ),
});
