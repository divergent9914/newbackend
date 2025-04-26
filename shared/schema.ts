import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Product model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  categoryId: integer("category_id").notNull(),
  sku: text("sku").notNull().unique(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("created"),
  totalAmount: real("total_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ondcOrderId: text("ondc_order_id"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order items model
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Payment model
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"),
  method: text("method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Delivery model
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: text("status").notNull().default("pending"),
  address: text("address").notNull(),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  estimatedDelivery: timestamp("estimated_delivery"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  updatedAt: true,
});

// ONDC Integration model
export const ondcIntegration = pgTable("ondc_integration", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  type: text("type").notNull(),
  mappedService: text("mapped_service").notNull(),
  status: text("status").notNull().default("active"),
  lastSync: timestamp("last_sync").notNull().defaultNow(),
  complianceScore: real("compliance_score").notNull().default(100),
});

export const insertOndcIntegrationSchema = createInsertSchema(ondcIntegration).omit({
  id: true,
  lastSync: true,
});

// Service metrics model
export const serviceMetrics = pgTable("service_metrics", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  status: text("status").notNull().default("healthy"),
  uptime: real("uptime").notNull().default(100),
  requestCount: integer("request_count").notNull().default(0),
  errorRate: real("error_rate").notNull().default(0),
  averageLatency: real("average_latency").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertServiceMetricsSchema = createInsertSchema(serviceMetrics).omit({
  id: true,
  timestamp: true,
});

// API Gateway Route model
export const apiRoutes = pgTable("api_routes", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  service: text("service").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertApiRouteSchema = createInsertSchema(apiRoutes).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

export type OndcIntegration = typeof ondcIntegration.$inferSelect;
export type InsertOndcIntegration = z.infer<typeof insertOndcIntegrationSchema>;

export type ServiceMetric = typeof serviceMetrics.$inferSelect;
export type InsertServiceMetric = z.infer<typeof insertServiceMetricsSchema>;

export type ApiRoute = typeof apiRoutes.$inferSelect;
export type InsertApiRoute = z.infer<typeof insertApiRouteSchema>;
