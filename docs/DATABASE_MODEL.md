# Database Model Documentation

This document provides detailed information about the database schema used in the ONDC E-commerce System.

## Overview

The database schema is defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL. The schema includes tables for users, products, orders, payments, deliveries, and ONDC integration.

## Schema Diagram

```
+---------------+     +----------------+     +---------------+
|     Users     |     |    Products    |     |    Orders     |
+---------------+     +----------------+     +---------------+
| id            |     | id             |     | id            |
| username      |     | name           |     | userId        |
| password      |     | description    |     | status        |
| name          |     | price          |     | totalAmount   |
| email         |     | imageUrl       |     | createdAt     |
| phone         |     | category       |     | updatedAt     |
| role          |     | stock          |     +---------------+
| createdAt     |     | createdAt      |           |
| updatedAt     |     | updatedAt      |           |
+---------------+     +----------------+           |
                             |                     |
                             |                     |
                     +----------------+     +---------------+
                     |  Order Items   |     |   Payments    |
                     +----------------+     +---------------+
                     | id             |     | id            |
                     | orderId        |     | orderId       |
                     | productId      |     | amount        |
                     | quantity       |     | method        |
                     | price          |     | status        |
                     +----------------+     | transactionId |
                                            | createdAt     |
                                            +---------------+
                                                   |
                                                   |
+---------------------+                    +---------------+
| ONDC Integration    |                    |  Deliveries   |
+---------------------+                    +---------------+
| id                  |                    | id            |
| name                |                    | orderId       |
| subscriberId        |                    | address       |
| subscriberUrl       |                    | status        |
| type                |                    | trackingId    |
| domain              |                    | carrier       |
| city                |                    | estimatedTime |
| country             |                    | actualTime    |
| signingPublicKey    |                    | createdAt     |
| signingPrivateKey   |                    | updatedAt     |
| encryptionPublicKey |                    +---------------+
| encryptionPrivateKey|
| active              |            +---------------+
| createdAt           |            | API Routes    |
| updatedAt           |            +---------------+
+---------------------+            | id            |
                                   | path          |
                                   | method        |
                                   | description   |
                                   | active        |
                                   | createdAt     |
                                   | updatedAt     |
                                   +---------------+

                                   +---------------+
                                   |Service Metrics|
                                   +---------------+
                                   | id            |
                                   | serviceName   |
                                   | metricName    |
                                   | metricValue   |
                                   | timestamp     |
                                   +---------------+
```

## Table Definitions

### Users Table

The users table stores authentication and profile information for all users.

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  role: text('role').default('customer'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Products Table

The products table stores information about items available for purchase.

```typescript
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
  stock: integer('stock').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Orders Table

The orders table stores customer purchase information.

```typescript
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('created'),
  totalAmount: numeric('total_amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Order Items Table

The order_items table stores individual products in an order.

```typescript
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: numeric('price').notNull(),
});
```

### Payments Table

The payments table stores payment information for orders.

```typescript
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  amount: numeric('amount').notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Deliveries Table

The deliveries table stores shipping and delivery information.

```typescript
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  address: text('address').notNull(),
  status: text('status').notNull().default('pending'),
  trackingId: text('tracking_id'),
  carrier: text('carrier'),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### ONDC Integration Table

The ondc_integration table stores ONDC protocol integration settings.

```typescript
export const ondcIntegration = pgTable('ondc_integration', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  subscriberId: text('subscriber_id').notNull(),
  subscriberUrl: text('subscriber_url').notNull(),
  type: text('type').notNull(), // 'buyer' or 'seller'
  domain: text('domain').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  signingPublicKey: text('signing_public_key'),
  signingPrivateKey: text('signing_private_key'),
  encryptionPublicKey: text('encryption_public_key'),
  encryptionPrivateKey: text('encryption_private_key'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### API Routes Table

The api_routes table stores information about available API endpoints.

```typescript
export const apiRoutes = pgTable('api_routes', {
  id: serial('id').primaryKey(),
  path: text('path').notNull(),
  method: text('method').notNull(),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Service Metrics Table

The service_metrics table stores performance and monitoring metrics.

```typescript
export const serviceMetrics = pgTable('service_metrics', {
  id: serial('id').primaryKey(),
  serviceName: text('service_name').notNull(),
  metricName: text('metric_name').notNull(),
  metricValue: numeric('metric_value').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
```

## Relations

Tables are connected through relations defined in the schema:

```typescript
export const orderDeliveriesRelation = relations(deliveries, ({ one }) => ({
  order: one(orders, { fields: [deliveries.orderId], references: [orders.id] }),
}));

export const orderItemsRelation = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const ordersRelation = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  orderItems: many(orderItems),
  payments: many(payments),
  deliveries: many(deliveries),
}));

export const paymentsRelation = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
```

## Schema Type Definitions

For each table, the schema exports:
- Insert schema using `createInsertSchema` from `drizzle-zod`
- Select schema using `createSelectSchema` from `drizzle-zod`
- TypeScript types for entities and insert operations

Example:

```typescript
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;
```

## Using the Database

The application supports two storage implementations:

1. **DatabaseStorage**: Uses the PostgreSQL database with Drizzle ORM
2. **MemStorage**: In-memory storage for development/testing

The active storage implementation is determined by the `USE_DATABASE` environment variable. When set to `'true'`, the application uses DatabaseStorage; otherwise, it defaults to MemStorage.

```typescript
export const storage = process.env.USE_DATABASE === 'true' 
  ? new DatabaseStorage() 
  : new MemStorage();
```

## Database Migrations

Database migrations are handled using Drizzle Kit. The configuration is in `drizzle.config.ts`. 

To push schema changes to the database:

```bash
npx drizzle-kit push
```