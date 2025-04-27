/**
 * Database Schema for ONDC E-commerce Platform
 * 
 * This file defines the database schema using Drizzle ORM.
 * It is shared across all microservices to ensure data consistency.
 */

import { pgTable, serial, text, integer, timestamp, boolean, doublePrecision, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Useful type alias for JSON data
export type Json = Record<string, any> | any[];

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number'),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id')
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: doublePrecision('price').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
  categorySlug: text('category_slug'),
  slug: text('slug').notNull().unique(),
  inStock: boolean('in_stock').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stockQuantity: integer('stock_quantity'),
  vendorId: integer('vendor_id'),
  metadata: json('metadata')
});

// Product relations
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems)
}));

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'),
  total: doublePrecision('total').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  shippingAddress: text('shipping_address'),
  billingAddress: text('billing_address'),
  notes: text('notes'),
  ondcOrderId: text('ondc_order_id'),
  metadata: json('metadata')
});

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
  deliveries: many(deliveries)
}));

// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: doublePrecision('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  notes: text('notes'),
  metadata: json('metadata')
});

// Order items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  })
}));

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  amount: doublePrecision('amount').notNull(),
  status: text('status').notNull().default('pending'),
  provider: text('provider').notNull().default('stripe'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: json('metadata')
});

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  })
}));

// Deliveries table
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  status: text('status').notNull().default('pending'),
  assignedTo: text('assigned_to'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  trackingId: text('tracking_id'),
  startLatitude: text('start_latitude'),
  startLongitude: text('start_longitude'),
  destinationLatitude: text('destination_latitude'),
  destinationLongitude: text('destination_longitude'),
  metadata: json('metadata')
});

// Deliveries relations
export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  locationHistory: many(deliveryLocationHistory)
}));

// Delivery location history table
export const deliveryLocationHistory = pgTable('delivery_location_history', {
  id: serial('id').primaryKey(),
  deliveryId: integer('delivery_id').notNull().references(() => deliveries.id),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  speed: doublePrecision('speed'),
  heading: doublePrecision('heading'),
  accuracy: doublePrecision('accuracy'),
  batteryLevel: doublePrecision('battery_level'),
  metadata: json('metadata')
});

// Delivery location history relations
export const deliveryLocationHistoryRelations = relations(deliveryLocationHistory, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryLocationHistory.deliveryId],
    references: [deliveries.id],
  })
}));

// ONDC Integration table
export const ondcIntegrations = pgTable('ondc_integrations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  subscriberId: text('subscriber_id').notNull(),
  subscriberUrl: text('subscriber_url').notNull(),
  apiKey: text('api_key'),
  status: text('status').notNull().default('inactive'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: json('metadata')
});

// API Routes table (for API Gateway configuration)
export const apiRoutes = pgTable('api_routes', {
  id: serial('id').primaryKey(),
  path: text('path').notNull().unique(),
  method: text('method').notNull(),
  service: text('service').notNull(),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: json('metadata')
});

// Service Metrics table (for monitoring)
export const serviceMetrics = pgTable('service_metrics', {
  id: serial('id').primaryKey(),
  service: text('service').notNull(),
  endpoint: text('endpoint').notNull(),
  requestCount: integer('request_count').notNull().default(0),
  averageResponseTime: doublePrecision('average_response_time'),
  errorCount: integer('error_count').notNull().default(0),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: json('metadata')
});

// Zod insertion schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliveryLocationHistorySchema = createInsertSchema(deliveryLocationHistory).omit({ id: true, timestamp: true });
export const insertOndcIntegrationSchema = createInsertSchema(ondcIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiRouteSchema = createInsertSchema(apiRoutes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceMetricSchema = createInsertSchema(serviceMetrics).omit({ id: true, timestamp: true });

// TypeScript types for database operations
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;
export type DeliveryLocationHistory = typeof deliveryLocationHistory.$inferSelect;
export type OndcIntegration = typeof ondcIntegrations.$inferSelect;
export type ApiRoute = typeof apiRoutes.$inferSelect;
export type ServiceMetric = typeof serviceMetrics.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type InsertDeliveryLocationHistory = z.infer<typeof insertDeliveryLocationHistorySchema>;
export type InsertOndcIntegration = z.infer<typeof insertOndcIntegrationSchema>;
export type InsertApiRoute = z.infer<typeof insertApiRouteSchema>;
export type InsertServiceMetric = z.infer<typeof insertServiceMetricSchema>;