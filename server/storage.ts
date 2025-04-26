import { 
  Service, InsertService, 
  ApiKey, InsertApiKey,
  Metric, InsertMetric,
  User, InsertUser
} from '../shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { 
  services, 
  apiKeys, 
  metrics, 
  users 
} from '../shared/schema';

// Storage Interface
export interface IStorage {
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // API Key operations
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeysByService(serviceId: number): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;

  // Metrics operations
  getMetric(id: number): Promise<Metric | undefined>;
  getMetricsByService(serviceId: number): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set({ ...serviceData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();
    return !!deletedService;
  }

  // API Key operations
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return key || undefined;
  }

  async getApiKeysByService(serviceId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.serviceId, serviceId));
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [newKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newKey;
  }

  async updateApiKey(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const [updatedKey] = await db
      .update(apiKeys)
      .set({ ...apiKeyData, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return updatedKey || undefined;
  }

  async deleteApiKey(id: number): Promise<boolean> {
    const [deletedKey] = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id))
      .returning();
    return !!deletedKey;
  }

  // Metrics operations
  async getMetric(id: number): Promise<Metric | undefined> {
    const [metric] = await db.select().from(metrics).where(eq(metrics.id, id));
    return metric || undefined;
  }

  async getMetricsByService(serviceId: number): Promise<Metric[]> {
    return await db.select().from(metrics).where(eq(metrics.serviceId, serviceId));
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [newMetric] = await db.insert(metrics).values(metric).returning();
    return newMetric;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }
}

// Memory Storage Implementation for Development/Testing
export class MemStorage implements IStorage {
  private services: Service[] = [];
  private apiKeys: ApiKey[] = [];
  private metrics: Metric[] = [];
  private users: User[] = [];
  private nextIds = {
    service: 1,
    apiKey: 1,
    metric: 1,
    user: 1
  };

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.find(s => s.id === id);
  }

  async getServices(): Promise<Service[]> {
    return [...this.services];
  }

  async createService(service: InsertService): Promise<Service> {
    const now = new Date();
    const newService: Service = {
      ...service,
      id: this.nextIds.service++,
      createdAt: now,
      updatedAt: now,
      status: service.status || 'active'
    };
    this.services.push(newService);
    return newService;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    this.services[index] = {
      ...this.services[index],
      ...serviceData,
      updatedAt: now
    };
    
    return this.services[index];
  }

  async deleteService(id: number): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.services.splice(index, 1);
    return true;
  }

  // API Key operations
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.find(k => k.id === id);
  }

  async getApiKeysByService(serviceId: number): Promise<ApiKey[]> {
    return this.apiKeys.filter(k => k.serviceId === serviceId);
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const now = new Date();
    const newKey: ApiKey = {
      ...apiKey,
      id: this.nextIds.apiKey++,
      createdAt: now,
      updatedAt: now,
      isActive: apiKey.isActive ?? true,
      expiresAt: apiKey.expiresAt ?? null
    };
    this.apiKeys.push(newKey);
    return newKey;
  }

  async updateApiKey(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const index = this.apiKeys.findIndex(k => k.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    this.apiKeys[index] = {
      ...this.apiKeys[index],
      ...apiKeyData,
      updatedAt: now
    };
    
    return this.apiKeys[index];
  }

  async deleteApiKey(id: number): Promise<boolean> {
    const index = this.apiKeys.findIndex(k => k.id === id);
    if (index === -1) return false;
    
    this.apiKeys.splice(index, 1);
    return true;
  }

  // Metrics operations
  async getMetric(id: number): Promise<Metric | undefined> {
    return this.metrics.find(m => m.id === id);
  }

  async getMetricsByService(serviceId: number): Promise<Metric[]> {
    return this.metrics.filter(m => m.serviceId === serviceId);
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const now = new Date();
    const newMetric: Metric = {
      ...metric,
      id: this.nextIds.metric++,
      timestamp: now,
      requestCount: metric.requestCount ?? 0,
      errorCount: metric.errorCount ?? 0,
      averageResponseTime: metric.averageResponseTime ?? 0
    };
    this.metrics.push(newMetric);
    return newMetric;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...user,
      id: this.nextIds.user++,
      createdAt: now,
      updatedAt: now,
      role: user.role || 'user'
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: now
    };
    
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
}

// Export the appropriate storage implementation
// Use environment variable to determine which storage to use
// if process.env.USE_DATABASE is true, use DatabaseStorage, otherwise use MemStorage
export const storage = process.env.USE_DATABASE === 'true' 
  ? new DatabaseStorage() 
  : new MemStorage();