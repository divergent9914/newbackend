import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Services table
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'order', 'inventory', 'payment', 'delivery'
  endpoint: text('endpoint').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id),
  key: text('key').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at')
});

// Metrics table
export const metrics = pgTable('metrics', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id),
  requestCount: integer('request_count').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  averageResponseTime: integer('average_response_time').notNull().default(0),
  timestamp: timestamp('timestamp').defaultNow()
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  service: one(services, {
    fields: [apiKeys.serviceId],
    references: [services.id]
  })
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  service: one(services, {
    fields: [metrics.serviceId],
    references: [services.id]
  })
}));

// Schemas
export const serviceInsertSchema = createInsertSchema(services);
export const serviceSelectSchema = createSelectSchema(services);
export type Service = z.infer<typeof serviceSelectSchema>;
export type InsertService = z.infer<typeof serviceInsertSchema>;

export const apiKeyInsertSchema = createInsertSchema(apiKeys);
export const apiKeySelectSchema = createSelectSchema(apiKeys);
export type ApiKey = z.infer<typeof apiKeySelectSchema>;
export type InsertApiKey = z.infer<typeof apiKeyInsertSchema>;

export const metricInsertSchema = createInsertSchema(metrics);
export const metricSelectSchema = createSelectSchema(metrics);
export type Metric = z.infer<typeof metricSelectSchema>;
export type InsertMetric = z.infer<typeof metricInsertSchema>;

export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});