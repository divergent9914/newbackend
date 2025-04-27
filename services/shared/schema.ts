import { pgTable, serial, text, timestamp, integer, boolean, real, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { type Json } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('user')
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  categoryId: integer('category_id'),
  sku: text('sku'),
  stock: integer('stock'),
  imageUrl: text('image_url')
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description')
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  status: text('status').notNull(),
  userId: integer('user_id').notNull(),
  totalAmount: real('total_amount').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ondcOrderId: text('ondc_order_id')
});

// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull()
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  status: text('status').notNull(),
  orderId: integer('order_id').notNull(),
  amount: real('amount').notNull(),
  method: text('method').notNull(),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Deliveries table
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  status: text('status').notNull(),
  address: text('address').notNull(),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  estimatedDelivery: timestamp('estimated_delivery'),
  updatedAt: timestamp('updated_at'),
  currentLat: text('current_lat'),
  currentLng: text('current_lng'),
  destinationLat: text('destination_lat'),
  destinationLng: text('destination_lng'),
  deliveryAgentName: text('delivery_agent_name'),
  deliveryAgentPhone: text('delivery_agent_phone'),
  startTime: timestamp('start_time'),
  completedTime: timestamp('completed_time'),
  estimatedArrivalTime: timestamp('estimated_arrival_time'),
  lastLocationUpdateTime: timestamp('last_location_update_time')
});

// Delivery Location History table
export const deliveryLocationHistory = pgTable('delivery_location_history', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  deliveryId: integer('delivery_id').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  speed: real('speed'),
  heading: real('heading'),
  accuracy: real('accuracy'),
  batteryLevel: real('battery_level'),
  metadata: jsonb('metadata')
});

// ONDC Integration table
export const ondcIntegration = pgTable('ondc_integration', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull(),
  apiKey: text('api_key').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// API Routes table for managing service endpoints
export const apiRoutes = pgTable('api_routes', {
  id: serial('id').primaryKey(),
  path: text('path').notNull(),
  method: text('method').notNull(),
  service: text('service').notNull(),
  active: boolean('active').notNull().default(true)
});

// Service Metrics table
export const serviceMetrics = pgTable('service_metrics', {
  id: serial('id').primaryKey(),
  service: text('service').notNull(),
  metric: text('metric').notNull(),
  value: real('value').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow()
});

// Relations
export const productCategoriesRelation = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  })
}));

export const orderUserRelation = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems),
  delivery: many(deliveries),
  payment: many(payments)
}));

export const orderItemsRelation = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

export const paymentsRelation = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  })
}));

export const orderDeliveriesRelation = relations(deliveries, ({ one, many }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id]
  }),
  locationHistory: many(deliveryLocationHistory)
}));

export const deliveryLocationHistoryRelation = relations(deliveryLocationHistory, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryLocationHistory.deliveryId],
    references: [deliveries.id]
  })
}));

// Schemas
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;

export const productInsertSchema = createInsertSchema(products);
export const productSelectSchema = createSelectSchema(products);
export type Product = z.infer<typeof productSelectSchema>;
export type InsertProduct = z.infer<typeof productInsertSchema>;

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);
export type Category = z.infer<typeof categorySelectSchema>;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;

export const orderInsertSchema = createInsertSchema(orders);
export const orderSelectSchema = createSelectSchema(orders);
export type Order = z.infer<typeof orderSelectSchema>;
export type InsertOrder = z.infer<typeof orderInsertSchema>;

export const orderItemInsertSchema = createInsertSchema(orderItems);
export const orderItemSelectSchema = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof orderItemSelectSchema>;
export type InsertOrderItem = z.infer<typeof orderItemInsertSchema>;

export const paymentInsertSchema = createInsertSchema(payments);
export const paymentSelectSchema = createSelectSchema(payments);
export type Payment = z.infer<typeof paymentSelectSchema>;
export type InsertPayment = z.infer<typeof paymentInsertSchema>;

export const deliveryInsertSchema = createInsertSchema(deliveries);
export const deliverySelectSchema = createSelectSchema(deliveries);
export type Delivery = z.infer<typeof deliverySelectSchema>;
export type InsertDelivery = z.infer<typeof deliveryInsertSchema>;

export const deliveryLocationHistoryInsertSchema = createInsertSchema(deliveryLocationHistory);
export const deliveryLocationHistorySelectSchema = createSelectSchema(deliveryLocationHistory);
export type DeliveryLocationHistory = z.infer<typeof deliveryLocationHistorySelectSchema>;
export type InsertDeliveryLocationHistory = z.infer<typeof deliveryLocationHistoryInsertSchema>;

export const ondcIntegrationInsertSchema = createInsertSchema(ondcIntegration);
export const ondcIntegrationSelectSchema = createSelectSchema(ondcIntegration);
export type OndcIntegration = z.infer<typeof ondcIntegrationSelectSchema>;
export type InsertOndcIntegration = z.infer<typeof ondcIntegrationInsertSchema>;

export const apiRouteInsertSchema = createInsertSchema(apiRoutes);
export const apiRouteSelectSchema = createSelectSchema(apiRoutes);
export type ApiRoute = z.infer<typeof apiRouteSelectSchema>;
export type InsertApiRoute = z.infer<typeof apiRouteInsertSchema>;

export const serviceMetricInsertSchema = createInsertSchema(serviceMetrics);
export const serviceMetricSelectSchema = createSelectSchema(serviceMetrics);
export type ServiceMetric = z.infer<typeof serviceMetricSelectSchema>;
export type InsertServiceMetric = z.infer<typeof serviceMetricInsertSchema>;

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

// Extended schemas for validation
export const createUserSchema = userInsertSchema.extend({
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});