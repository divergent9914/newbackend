import { pgTable, serial, text, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// API Routes table for managing service endpoints
export const apiRoutes = pgTable('api_routes', {
  id: serial('id').primaryKey(),
  path: text('path').notNull(),
  method: text('method').notNull(),
  service: text('service').notNull(),
  active: boolean('active').notNull().default(true)
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
  updatedAt: timestamp('updated_at')
});

// ONDC Integration table
export const ondcIntegration = pgTable('ondc_integration', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull(),
  type: text('type').notNull(),
  mappedService: text('mapped_service').notNull(),
  status: text('status').notNull(),
  lastSync: timestamp('last_sync'),
  complianceScore: real('compliance_score')
});

// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull()
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  status: text('status').notNull(),
  totalAmount: real('total_amount').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  ondcOrderId: text('ondc_order_id')
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull(),
  method: text('method').notNull(),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at')
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  categoryId: integer('category_id'),
  sku: text('sku'),
  stock: integer('stock').default(0),
  imageUrl: text('image_url')
});

// Service Metrics table
export const serviceMetrics = pgTable('service_metrics', {
  id: serial('id').primaryKey(),
  serviceName: text('service_name').notNull(),
  status: text('status').notNull(),
  uptime: real('uptime'),
  requestCount: integer('request_count'),
  errorRate: real('error_rate'),
  averageLatency: real('average_latency'),
  timestamp: timestamp('timestamp')
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user')
});

// Relations
export const orderDeliveriesRelation = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id]
  })
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

export const ordersRelation = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems),
  delivery: many(deliveries),
  payment: many(payments)
}));

export const paymentsRelation = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  })
}));

// Schemas
export const apiRouteInsertSchema = createInsertSchema(apiRoutes);
export const apiRouteSelectSchema = createSelectSchema(apiRoutes);
export type ApiRoute = z.infer<typeof apiRouteSelectSchema>;
export type InsertApiRoute = z.infer<typeof apiRouteInsertSchema>;

export const deliveryInsertSchema = createInsertSchema(deliveries);
export const deliverySelectSchema = createSelectSchema(deliveries);
export type Delivery = z.infer<typeof deliverySelectSchema>;
export type InsertDelivery = z.infer<typeof deliveryInsertSchema>;

export const ondcIntegrationInsertSchema = createInsertSchema(ondcIntegration);
export const ondcIntegrationSelectSchema = createSelectSchema(ondcIntegration);
export type OndcIntegration = z.infer<typeof ondcIntegrationSelectSchema>;
export type InsertOndcIntegration = z.infer<typeof ondcIntegrationInsertSchema>;

export const orderItemInsertSchema = createInsertSchema(orderItems);
export const orderItemSelectSchema = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof orderItemSelectSchema>;
export type InsertOrderItem = z.infer<typeof orderItemInsertSchema>;

export const orderInsertSchema = createInsertSchema(orders);
export const orderSelectSchema = createSelectSchema(orders);
export type Order = z.infer<typeof orderSelectSchema>;
export type InsertOrder = z.infer<typeof orderInsertSchema>;

export const paymentInsertSchema = createInsertSchema(payments);
export const paymentSelectSchema = createSelectSchema(payments);
export type Payment = z.infer<typeof paymentSelectSchema>;
export type InsertPayment = z.infer<typeof paymentInsertSchema>;

export const productInsertSchema = createInsertSchema(products);
export const productSelectSchema = createSelectSchema(products);
export type Product = z.infer<typeof productSelectSchema>;
export type InsertProduct = z.infer<typeof productInsertSchema>;

export const serviceMetricInsertSchema = createInsertSchema(serviceMetrics);
export const serviceMetricSelectSchema = createSelectSchema(serviceMetrics);
export type ServiceMetric = z.infer<typeof serviceMetricSelectSchema>;
export type InsertServiceMetric = z.infer<typeof serviceMetricInsertSchema>;

export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});