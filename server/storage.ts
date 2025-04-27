import { 
  User, InsertUser,
  ApiRoute, InsertApiRoute,
  Delivery, InsertDelivery,
  OndcIntegration, InsertOndcIntegration,
  OrderItem, InsertOrderItem,
  Order, InsertOrder,
  Payment, InsertPayment,
  Product, InsertProduct,
  ServiceMetric, InsertServiceMetric,
  DeliveryLocationHistory, InsertDeliveryLocationHistory
} from '../shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { 
  users,
  apiRoutes,
  deliveries,
  ondcIntegration,
  orderItems,
  orders,
  payments,
  products,
  serviceMetrics,
  deliveryLocationHistory
} from '../shared/schema';

// Storage Interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByOrder(orderId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Delivery operations
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveriesByOrder(orderId: number): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: number, delivery: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  
  // ONDC Integration operations
  getOndcIntegrations(): Promise<OndcIntegration[]>;
  getOndcIntegration(id: number): Promise<OndcIntegration | undefined>;
  createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration>;
  updateOndcIntegration(id: number, integration: Partial<InsertOndcIntegration>): Promise<OndcIntegration | undefined>;
  
  // API Route operations
  getApiRoutes(): Promise<ApiRoute[]>;
  createApiRoute(route: InsertApiRoute): Promise<ApiRoute>;
  updateApiRoute(id: number, route: Partial<InsertApiRoute>): Promise<ApiRoute | undefined>;
  deleteApiRoute(id: number): Promise<boolean>;
  
  // Service Metrics operations
  getServiceMetrics(): Promise<ServiceMetric[]>;
  createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric>;
  
  // Delivery Location History operations
  getDeliveryLocationHistory(deliveryId: number): Promise<DeliveryLocationHistory[]>;
  createDeliveryLocationHistory(history: InsertDeliveryLocationHistory): Promise<DeliveryLocationHistory>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
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
      .set(userData)
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

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(orderData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.orderId, orderId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  // Delivery operations
  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async getDeliveriesByOrder(orderId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.orderId, orderId));
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const [newDelivery] = await db.insert(deliveries).values(delivery).returning();
    return newDelivery;
  }

  async updateDelivery(id: number, deliveryData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(deliveryData)
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery || undefined;
  }

  // ONDC Integration operations
  async getOndcIntegrations(): Promise<OndcIntegration[]> {
    return await db.select().from(ondcIntegration);
  }

  async getOndcIntegration(id: number): Promise<OndcIntegration | undefined> {
    const [integration] = await db.select().from(ondcIntegration).where(eq(ondcIntegration.id, id));
    return integration || undefined;
  }

  async createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration> {
    const [newIntegration] = await db.insert(ondcIntegration).values(integration).returning();
    return newIntegration;
  }

  async updateOndcIntegration(id: number, integrationData: Partial<InsertOndcIntegration>): Promise<OndcIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(ondcIntegration)
      .set(integrationData)
      .where(eq(ondcIntegration.id, id))
      .returning();
    return updatedIntegration || undefined;
  }

  // API Route operations
  async getApiRoutes(): Promise<ApiRoute[]> {
    return await db.select().from(apiRoutes);
  }

  async createApiRoute(route: InsertApiRoute): Promise<ApiRoute> {
    const [newRoute] = await db.insert(apiRoutes).values(route).returning();
    return newRoute;
  }

  async updateApiRoute(id: number, routeData: Partial<InsertApiRoute>): Promise<ApiRoute | undefined> {
    const [updatedRoute] = await db
      .update(apiRoutes)
      .set(routeData)
      .where(eq(apiRoutes.id, id))
      .returning();
    return updatedRoute || undefined;
  }

  async deleteApiRoute(id: number): Promise<boolean> {
    const [deletedRoute] = await db
      .delete(apiRoutes)
      .where(eq(apiRoutes.id, id))
      .returning();
    return !!deletedRoute;
  }

  // Service Metrics operations
  async getServiceMetrics(): Promise<ServiceMetric[]> {
    return await db.select().from(serviceMetrics);
  }

  async createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric> {
    const [newMetric] = await db.insert(serviceMetrics).values(metric).returning();
    return newMetric;
  }
  
  // Delivery Location History operations
  async getDeliveryLocationHistory(deliveryId: number): Promise<DeliveryLocationHistory[]> {
    return await db.select().from(deliveryLocationHistory).where(eq(deliveryLocationHistory.deliveryId, deliveryId));
  }
  
  async createDeliveryLocationHistory(history: InsertDeliveryLocationHistory): Promise<DeliveryLocationHistory> {
    const [newHistory] = await db.insert(deliveryLocationHistory).values(history).returning();
    return newHistory;
  }
}

// Memory Storage Implementation for Development/Testing
export class MemStorage implements IStorage {
  private users: User[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];
  private payments: Payment[] = [];
  private deliveries: Delivery[] = [];
  private ondcIntegrations: OndcIntegration[] = [];
  private apiRoutesData: ApiRoute[] = [];
  private serviceMetricsData: ServiceMetric[] = [];
  private deliveryLocationHistoryData: DeliveryLocationHistory[] = [];

  private nextIds = {
    user: 1,
    product: 1,
    order: 1,
    orderItem: 1,
    payment: 1,
    delivery: 1,
    ondcIntegration: 1,
    apiRoute: 1,
    serviceMetric: 1,
    deliveryLocationHistory: 1
  };

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextIds.user++,
      username: user.username,
      password: user.password,
      email: user.email,
      role: user.role || 'user'
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = {
      ...this.users[index],
      ...userData
    };
    
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.nextIds.product++,
      name: product.name,
      description: product.description || null,
      price: product.price,
      categoryId: product.categoryId || null,
      sku: product.sku || null,
      stock: product.stock || null,
      imageUrl: product.imageUrl || null
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = {
      ...this.products[index],
      ...productData
    };
    
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.find(o => o.id === id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.orders.filter(o => o.userId === userId);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const newOrder: Order = {
      id: this.nextIds.order++,
      status: order.status,
      userId: order.userId,
      totalAmount: order.totalAmount,
      createdAt: now,
      updatedAt: now,
      ondcOrderId: order.ondcOrderId || null
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    this.orders[index] = {
      ...this.orders[index],
      ...orderData,
      updatedAt: now
    };
    
    return this.orders[index];
  }
  
  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem: OrderItem = {
      id: this.nextIds.orderItem++,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice
    };
    this.orderItems.push(newOrderItem);
    return newOrderItem;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.find(p => p.id === id);
  }

  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    return this.payments.filter(p => p.orderId === orderId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const now = new Date();
    const newPayment: Payment = {
      id: this.nextIds.payment++,
      status: payment.status,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId || null,
      createdAt: now
    };
    this.payments.push(newPayment);
    return newPayment;
  }
  
  // Delivery operations
  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.find(d => d.id === id);
  }

  async getDeliveriesByOrder(orderId: number): Promise<Delivery[]> {
    return this.deliveries.filter(d => d.orderId === orderId);
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const now = new Date();
    const newDelivery: Delivery = {
      id: this.nextIds.delivery++,
      status: delivery.status,
      orderId: delivery.orderId,
      address: delivery.address,
      trackingNumber: delivery.trackingNumber || null,
      carrier: delivery.carrier || null,
      estimatedDelivery: delivery.estimatedDelivery || null,
      updatedAt: now,
      currentLat: delivery.currentLat || null,
      currentLng: delivery.currentLng || null,
      destinationLat: delivery.destinationLat || null,
      destinationLng: delivery.destinationLng || null,
      deliveryAgentName: delivery.deliveryAgentName || null,
      deliveryAgentPhone: delivery.deliveryAgentPhone || null,
      startTime: delivery.startTime || null,
      completedTime: delivery.completedTime || null,
      estimatedArrivalTime: delivery.estimatedArrivalTime || null,
      lastLocationUpdateTime: delivery.lastLocationUpdateTime || null
    };
    this.deliveries.push(newDelivery);
    return newDelivery;
  }

  async updateDelivery(id: number, deliveryData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const index = this.deliveries.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    this.deliveries[index] = {
      ...this.deliveries[index],
      ...deliveryData,
      updatedAt: now
    };
    
    return this.deliveries[index];
  }
  
  // ONDC Integration operations
  async getOndcIntegrations(): Promise<OndcIntegration[]> {
    return [...this.ondcIntegrations];
  }

  async getOndcIntegration(id: number): Promise<OndcIntegration | undefined> {
    return this.ondcIntegrations.find(i => i.id === id);
  }

  async createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration> {
    const now = new Date();
    const newIntegration: OndcIntegration = {
      id: this.nextIds.ondcIntegration++,
      type: integration.type,
      status: integration.status,
      endpoint: integration.endpoint,
      mappedService: integration.mappedService,
      lastSync: now,
      complianceScore: integration.complianceScore || null
    };
    this.ondcIntegrations.push(newIntegration);
    return newIntegration;
  }

  async updateOndcIntegration(id: number, integrationData: Partial<InsertOndcIntegration>): Promise<OndcIntegration | undefined> {
    const index = this.ondcIntegrations.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    
    this.ondcIntegrations[index] = {
      ...this.ondcIntegrations[index],
      ...integrationData
    };
    
    return this.ondcIntegrations[index];
  }
  
  // API Route operations
  async getApiRoutes(): Promise<ApiRoute[]> {
    return [...this.apiRoutesData];
  }

  async createApiRoute(route: InsertApiRoute): Promise<ApiRoute> {
    const newRoute: ApiRoute = {
      id: this.nextIds.apiRoute++,
      path: route.path,
      method: route.method,
      service: route.service,
      active: route.active !== undefined ? route.active : true
    };
    this.apiRoutesData.push(newRoute);
    return newRoute;
  }

  async updateApiRoute(id: number, routeData: Partial<InsertApiRoute>): Promise<ApiRoute | undefined> {
    const index = this.apiRoutesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    this.apiRoutesData[index] = {
      ...this.apiRoutesData[index],
      ...routeData
    };
    
    return this.apiRoutesData[index];
  }

  async deleteApiRoute(id: number): Promise<boolean> {
    const index = this.apiRoutesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.apiRoutesData.splice(index, 1);
    return true;
  }
  
  // Service Metrics operations
  async getServiceMetrics(): Promise<ServiceMetric[]> {
    return [...this.serviceMetricsData];
  }

  async createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric> {
    const now = new Date();
    const newMetric: ServiceMetric = {
      id: this.nextIds.serviceMetric++,
      status: metric.status,
      serviceName: metric.serviceName,
      uptime: metric.uptime || null,
      requestCount: metric.requestCount || null,
      errorRate: metric.errorRate || null,
      averageLatency: metric.averageLatency || null,
      timestamp: now
    };
    this.serviceMetricsData.push(newMetric);
    return newMetric;
  }
  
  // Delivery Location History operations
  async getDeliveryLocationHistory(deliveryId: number): Promise<DeliveryLocationHistory[]> {
    return this.deliveryLocationHistoryData.filter(h => h.deliveryId === deliveryId);
  }
  
  async createDeliveryLocationHistory(history: InsertDeliveryLocationHistory): Promise<DeliveryLocationHistory> {
    const now = new Date();
    const newHistory: DeliveryLocationHistory = {
      id: this.nextIds.deliveryLocationHistory++,
      deliveryId: history.deliveryId,
      latitude: history.latitude,
      longitude: history.longitude,
      timestamp: history.timestamp || now,
      speed: history.speed || null,
      heading: history.heading || null,
      accuracy: history.accuracy || null,
      batteryLevel: history.batteryLevel || null,
      metadata: history.metadata || null
    };
    this.deliveryLocationHistoryData.push(newHistory);
    return newHistory;
  }
}

// Export the appropriate storage implementation
// Use environment variable to determine which storage to use
// if process.env.USE_DATABASE is true, use DatabaseStorage, otherwise use MemStorage
export const storage = process.env.USE_DATABASE === 'true' 
  ? new DatabaseStorage() 
  : new MemStorage();