import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  User, InsertUser, users,
  Product, InsertProduct, products,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  Payment, InsertPayment, payments,
  Delivery, InsertDelivery, deliveries,
  OndcIntegration, InsertOndcIntegration, ondcIntegration,
  ServiceMetric, InsertServiceMetric, serviceMetrics,
  ApiRoute, InsertApiRoute, apiRoutes
} from "@shared/schema";

// Storage Interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: number, stock: number): Promise<Product | undefined>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Payment operations
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByOrderId(orderId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined>;

  // Delivery operations
  getDeliveries(): Promise<Delivery[]>;
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveryByOrderId(orderId: number): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDeliveryStatus(id: number, status: string, trackingNumber?: string): Promise<Delivery | undefined>;

  // ONDC operations
  getOndcIntegrations(): Promise<OndcIntegration[]>;
  getOndcIntegration(id: number): Promise<OndcIntegration | undefined>;
  createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration>;
  updateOndcIntegrationStatus(id: number, status: string): Promise<OndcIntegration | undefined>;

  // Service metrics operations
  getServiceMetrics(): Promise<ServiceMetric[]>;
  getServiceMetric(id: number): Promise<ServiceMetric | undefined>;
  getServiceMetricsByName(serviceName: string): Promise<ServiceMetric[]>;
  createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric>;
  updateServiceMetric(id: number, metric: Partial<InsertServiceMetric>): Promise<ServiceMetric | undefined>;

  // API Gateway routes operations
  getApiRoutes(): Promise<ApiRoute[]>;
  getApiRoute(id: number): Promise<ApiRoute | undefined>;
  createApiRoute(route: InsertApiRoute): Promise<ApiRoute>;
  updateApiRoute(id: number, active: boolean): Promise<ApiRoute | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private payments: Map<number, Payment>;
  private deliveries: Map<number, Delivery>;
  private ondcIntegrations: Map<number, OndcIntegration>;
  private serviceMetrics: Map<number, ServiceMetric>;
  private apiRoutes: Map<number, ApiRoute>;

  private userCurrentId: number;
  private productCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private paymentCurrentId: number;
  private deliveryCurrentId: number;
  private ondcIntegrationCurrentId: number;
  private serviceMetricCurrentId: number;
  private apiRouteCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.payments = new Map();
    this.deliveries = new Map();
    this.ondcIntegrations = new Map();
    this.serviceMetrics = new Map();
    this.apiRoutes = new Map();

    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.paymentCurrentId = 1;
    this.deliveryCurrentId = 1;
    this.ondcIntegrationCurrentId = 1;
    this.serviceMetricCurrentId = 1;
    this.apiRouteCurrentId = 1;

    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize API routes
    const defaultRoutes: InsertApiRoute[] = [
      { path: '/api/v1/orders', method: 'GET', service: 'Order Service', active: true },
      { path: '/api/v1/orders', method: 'POST', service: 'Order Service', active: true },
      { path: '/api/v1/orders/{id}', method: 'GET', service: 'Order Service', active: true },
      { path: '/api/v1/orders/{id}', method: 'PUT', service: 'Order Service', active: true },
      { path: '/api/v1/inventory', method: 'GET', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/{id}', method: 'GET', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/{id}', method: 'PUT', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/batch', method: 'POST', service: 'Inventory Service', active: true },
      { path: '/api/v1/payments', method: 'POST', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/{id}', method: 'GET', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/{id}', method: 'DELETE', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/status/{id}', method: 'GET', service: 'Payment Service', active: true },
      { path: '/api/v1/delivery', method: 'POST', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/{id}', method: 'GET', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/{id}/status', method: 'PUT', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/tracking/{id}', method: 'GET', service: 'Delivery Service', active: true },
    ];

    defaultRoutes.forEach(route => {
      this.createApiRoute(route);
    });

    // Initialize ONDC integrations
    const defaultOndcIntegrations: InsertOndcIntegration[] = [
      { endpoint: '/search', type: 'Buyer', mappedService: 'Inventory', status: 'active', complianceScore: 100 },
      { endpoint: '/select', type: 'Buyer', mappedService: 'Order', status: 'active', complianceScore: 100 },
      { endpoint: '/init', type: 'Buyer', mappedService: 'Order', status: 'active', complianceScore: 100 },
      { endpoint: '/confirm', type: 'Buyer', mappedService: 'Payment', status: 'slow', complianceScore: 86 },
      { endpoint: '/status', type: 'Buyer/Seller', mappedService: 'Delivery', status: 'active', complianceScore: 100 },
    ];

    defaultOndcIntegrations.forEach(integration => {
      this.createOndcIntegration(integration);
    });

    // Initialize service metrics
    const defaultServiceMetrics: InsertServiceMetric[] = [
      { serviceName: 'API Gateway', status: 'healthy', uptime: 100, requestCount: 324, errorRate: 0, averageLatency: 20 },
      { serviceName: 'Order Service', status: 'healthy', uptime: 100, requestCount: 156, errorRate: 0, averageLatency: 45 },
      { serviceName: 'Inventory Service', status: 'healthy', uptime: 100, requestCount: 89, errorRate: 0, averageLatency: 38 },
      { serviceName: 'Payment Service', status: 'warning', uptime: 97.5, requestCount: 67, errorRate: 2.5, averageLatency: 230 },
      { serviceName: 'Delivery Service', status: 'healthy', uptime: 100, requestCount: 42, errorRate: 0, averageLatency: 52 },
    ];

    defaultServiceMetrics.forEach(metric => {
      this.createServiceMetric(metric);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser = { ...user, id, role: user.role || 'user' };
    this.users.set(id, newUser);
    return newUser;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const newProduct = { 
      ...product, 
      id,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, stock };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const now = new Date();
    const newOrder = { 
      ...order, 
      id, 
      status: order.status || 'pending',
      createdAt: now, 
      updatedAt: now,
      ondcOrderId: order.ondcOrderId || null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { 
        ...order, 
        status, 
        updatedAt: new Date() 
      };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  // Order Items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const newOrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.orderId === orderId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const newPayment = { 
      ...payment, 
      id, 
      status: payment.status || 'pending',
      createdAt: new Date(),
      transactionId: payment.transactionId || null
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (payment) {
      const updatedPayment = { 
        ...payment, 
        status,
        transactionId: transactionId || payment.transactionId
      };
      this.payments.set(id, updatedPayment);
      return updatedPayment;
    }
    return undefined;
  }

  // Delivery operations
  async getDeliveries(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values());
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveryByOrderId(orderId: number): Promise<Delivery | undefined> {
    return Array.from(this.deliveries.values()).find(delivery => delivery.orderId === orderId);
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const id = this.deliveryCurrentId++;
    const newDelivery = { 
      ...delivery, 
      id, 
      status: delivery.status || 'pending',
      updatedAt: new Date(),
      trackingNumber: delivery.trackingNumber || null,
      carrier: delivery.carrier || null,
      estimatedDelivery: delivery.estimatedDelivery || null
    };
    this.deliveries.set(id, newDelivery);
    return newDelivery;
  }

  async updateDeliveryStatus(id: number, status: string, trackingNumber?: string): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (delivery) {
      const updatedDelivery = { 
        ...delivery, 
        status,
        trackingNumber: trackingNumber || delivery.trackingNumber,
        updatedAt: new Date()
      };
      this.deliveries.set(id, updatedDelivery);
      return updatedDelivery;
    }
    return undefined;
  }

  // ONDC operations
  async getOndcIntegrations(): Promise<OndcIntegration[]> {
    return Array.from(this.ondcIntegrations.values());
  }

  async getOndcIntegration(id: number): Promise<OndcIntegration | undefined> {
    return this.ondcIntegrations.get(id);
  }

  async createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration> {
    const id = this.ondcIntegrationCurrentId++;
    const newIntegration = { 
      ...integration, 
      id, 
      status: integration.status || 'active',
      complianceScore: integration.complianceScore || 100,
      lastSync: new Date() 
    };
    this.ondcIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateOndcIntegrationStatus(id: number, status: string): Promise<OndcIntegration | undefined> {
    const integration = this.ondcIntegrations.get(id);
    if (integration) {
      const updatedIntegration = { 
        ...integration, 
        status,
        lastSync: new Date()
      };
      this.ondcIntegrations.set(id, updatedIntegration);
      return updatedIntegration;
    }
    return undefined;
  }

  // Service metrics operations
  async getServiceMetrics(): Promise<ServiceMetric[]> {
    return Array.from(this.serviceMetrics.values());
  }

  async getServiceMetric(id: number): Promise<ServiceMetric | undefined> {
    return this.serviceMetrics.get(id);
  }

  async getServiceMetricsByName(serviceName: string): Promise<ServiceMetric[]> {
    return Array.from(this.serviceMetrics.values())
      .filter(metric => metric.serviceName === serviceName);
  }

  async createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric> {
    const id = this.serviceMetricCurrentId++;
    const newMetric = { 
      ...metric, 
      id,
      status: metric.status || 'healthy',
      uptime: metric.uptime !== undefined ? metric.uptime : 100,
      requestCount: metric.requestCount || 0,
      errorRate: metric.errorRate || 0,
      averageLatency: metric.averageLatency || 0,
      timestamp: new Date() 
    };
    this.serviceMetrics.set(id, newMetric);
    return newMetric;
  }

  async updateServiceMetric(id: number, updates: Partial<InsertServiceMetric>): Promise<ServiceMetric | undefined> {
    const metric = this.serviceMetrics.get(id);
    if (metric) {
      const updatedMetric = { 
        ...metric, 
        ...updates,
        timestamp: new Date()
      };
      this.serviceMetrics.set(id, updatedMetric);
      return updatedMetric;
    }
    return undefined;
  }

  // API Gateway routes operations
  async getApiRoutes(): Promise<ApiRoute[]> {
    return Array.from(this.apiRoutes.values());
  }

  async getApiRoute(id: number): Promise<ApiRoute | undefined> {
    return this.apiRoutes.get(id);
  }

  async createApiRoute(route: InsertApiRoute): Promise<ApiRoute> {
    const id = this.apiRouteCurrentId++;
    const newRoute = { 
      ...route, 
      id,
      active: route.active !== undefined ? route.active : true
    };
    this.apiRoutes.set(id, newRoute);
    return newRoute;
  }

  async updateApiRoute(id: number, active: boolean): Promise<ApiRoute | undefined> {
    const route = this.apiRoutes.get(id);
    if (route) {
      const updatedRoute = { ...route, active };
      this.apiRoutes.set(id, updatedRoute);
      return updatedRoute;
    }
    return undefined;
  }
}

// Database Storage implementation
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const userToInsert = {
      ...insertUser,
      role: insertUser.role || 'user'
    };
    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const productToInsert = {
      ...product,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || null
    };
    const [newProduct] = await db
      .insert(products)
      .values(productToInsert)
      .returning();
    return newProduct;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ stock })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const orderToInsert = {
      ...order,
      status: order.status || 'pending',
      createdAt: now,
      updatedAt: now,
      ondcOrderId: order.ondcOrderId || null
    };
    const [newOrder] = await db
      .insert(orders)
      .values(orderToInsert)
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Order Items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return payment || undefined;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const paymentToInsert = {
      ...payment,
      status: payment.status || 'pending',
      createdAt: new Date(),
      transactionId: payment.transactionId || null
    };
    const [newPayment] = await db
      .insert(payments)
      .values(paymentToInsert)
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    let updateData: Partial<Payment> = { status };
    
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    const [updatedPayment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }

  // Delivery operations
  async getDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries);
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async getDeliveryByOrderId(orderId: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId));
    return delivery || undefined;
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const deliveryToInsert = {
      ...delivery,
      status: delivery.status || 'pending',
      updatedAt: new Date(),
      trackingNumber: delivery.trackingNumber || null,
      carrier: delivery.carrier || null,
      estimatedDelivery: delivery.estimatedDelivery || null
    };
    const [newDelivery] = await db
      .insert(deliveries)
      .values(deliveryToInsert)
      .returning();
    return newDelivery;
  }

  async updateDeliveryStatus(id: number, status: string, trackingNumber?: string): Promise<Delivery | undefined> {
    let updateData: Partial<Delivery> = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery || undefined;
  }

  // ONDC operations
  async getOndcIntegrations(): Promise<OndcIntegration[]> {
    return await db.select().from(ondcIntegration);
  }

  async getOndcIntegration(id: number): Promise<OndcIntegration | undefined> {
    const [integration] = await db.select().from(ondcIntegration).where(eq(ondcIntegration.id, id));
    return integration || undefined;
  }

  async createOndcIntegration(integration: InsertOndcIntegration): Promise<OndcIntegration> {
    const integrationToInsert = {
      ...integration,
      status: integration.status || 'active',
      complianceScore: integration.complianceScore || 100,
      lastSync: new Date()
    };
    const [newIntegration] = await db
      .insert(ondcIntegration)
      .values(integrationToInsert)
      .returning();
    return newIntegration;
  }

  async updateOndcIntegrationStatus(id: number, status: string): Promise<OndcIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(ondcIntegration)
      .set({ 
        status, 
        lastSync: new Date() 
      })
      .where(eq(ondcIntegration.id, id))
      .returning();
    return updatedIntegration || undefined;
  }

  // Service metrics operations
  async getServiceMetrics(): Promise<ServiceMetric[]> {
    return await db.select().from(serviceMetrics);
  }

  async getServiceMetric(id: number): Promise<ServiceMetric | undefined> {
    const [metric] = await db.select().from(serviceMetrics).where(eq(serviceMetrics.id, id));
    return metric || undefined;
  }

  async getServiceMetricsByName(serviceName: string): Promise<ServiceMetric[]> {
    return await db.select().from(serviceMetrics).where(eq(serviceMetrics.serviceName, serviceName));
  }

  async createServiceMetric(metric: InsertServiceMetric): Promise<ServiceMetric> {
    const metricToInsert = {
      ...metric,
      status: metric.status || 'healthy',
      uptime: metric.uptime !== undefined ? metric.uptime : 100,
      requestCount: metric.requestCount || 0,
      errorRate: metric.errorRate || 0,
      averageLatency: metric.averageLatency || 0,
      timestamp: new Date()
    };
    const [newMetric] = await db
      .insert(serviceMetrics)
      .values(metricToInsert)
      .returning();
    return newMetric;
  }

  async updateServiceMetric(id: number, updates: Partial<InsertServiceMetric>): Promise<ServiceMetric | undefined> {
    const [updatedMetric] = await db
      .update(serviceMetrics)
      .set({ 
        ...updates, 
        timestamp: new Date() 
      })
      .where(eq(serviceMetrics.id, id))
      .returning();
    return updatedMetric || undefined;
  }

  // API Gateway routes operations
  async getApiRoutes(): Promise<ApiRoute[]> {
    return await db.select().from(apiRoutes);
  }

  async getApiRoute(id: number): Promise<ApiRoute | undefined> {
    const [route] = await db.select().from(apiRoutes).where(eq(apiRoutes.id, id));
    return route || undefined;
  }

  async createApiRoute(route: InsertApiRoute): Promise<ApiRoute> {
    const routeToInsert = {
      ...route,
      active: route.active !== undefined ? route.active : true
    };
    const [newRoute] = await db
      .insert(apiRoutes)
      .values(routeToInsert)
      .returning();
    return newRoute;
  }

  async updateApiRoute(id: number, active: boolean): Promise<ApiRoute | undefined> {
    const [updatedRoute] = await db
      .update(apiRoutes)
      .set({ active })
      .where(eq(apiRoutes.id, id))
      .returning();
    return updatedRoute || undefined;
  }
}

// Initialize the database with default data
async function initializeDefaultData() {
  const dbStorage = new DatabaseStorage();
  
  // Initialize API routes
  const routes = await dbStorage.getApiRoutes();
  if (routes.length === 0) {
    const defaultRoutes: InsertApiRoute[] = [
      { path: '/api/v1/orders', method: 'GET', service: 'Order Service', active: true },
      { path: '/api/v1/orders', method: 'POST', service: 'Order Service', active: true },
      { path: '/api/v1/orders/{id}', method: 'GET', service: 'Order Service', active: true },
      { path: '/api/v1/orders/{id}', method: 'PUT', service: 'Order Service', active: true },
      { path: '/api/v1/inventory', method: 'GET', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/{id}', method: 'GET', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/{id}', method: 'PUT', service: 'Inventory Service', active: true },
      { path: '/api/v1/inventory/batch', method: 'POST', service: 'Inventory Service', active: true },
      { path: '/api/v1/payments', method: 'POST', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/{id}', method: 'GET', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/{id}', method: 'DELETE', service: 'Payment Service', active: true },
      { path: '/api/v1/payments/status/{id}', method: 'GET', service: 'Payment Service', active: true },
      { path: '/api/v1/delivery', method: 'POST', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/{id}', method: 'GET', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/{id}/status', method: 'PUT', service: 'Delivery Service', active: true },
      { path: '/api/v1/delivery/tracking/{id}', method: 'GET', service: 'Delivery Service', active: true },
    ];

    for (const route of defaultRoutes) {
      await dbStorage.createApiRoute(route);
    }
  }

  // Initialize ONDC integrations
  const integrations = await dbStorage.getOndcIntegrations();
  if (integrations.length === 0) {
    const defaultOndcIntegrations: InsertOndcIntegration[] = [
      { endpoint: '/search', type: 'Buyer', mappedService: 'Inventory', status: 'active', complianceScore: 100 },
      { endpoint: '/select', type: 'Buyer', mappedService: 'Order', status: 'active', complianceScore: 100 },
      { endpoint: '/init', type: 'Buyer', mappedService: 'Order', status: 'active', complianceScore: 100 },
      { endpoint: '/confirm', type: 'Buyer', mappedService: 'Payment', status: 'slow', complianceScore: 86 },
      { endpoint: '/status', type: 'Buyer/Seller', mappedService: 'Delivery', status: 'active', complianceScore: 100 },
    ];

    for (const integration of defaultOndcIntegrations) {
      await dbStorage.createOndcIntegration(integration);
    }
  }

  // Initialize service metrics
  const metrics = await dbStorage.getServiceMetrics();
  if (metrics.length === 0) {
    const defaultServiceMetrics: InsertServiceMetric[] = [
      { serviceName: 'API Gateway', status: 'healthy', uptime: 100, requestCount: 324, errorRate: 0, averageLatency: 20 },
      { serviceName: 'Order Service', status: 'healthy', uptime: 100, requestCount: 156, errorRate: 0, averageLatency: 45 },
      { serviceName: 'Inventory Service', status: 'healthy', uptime: 100, requestCount: 89, errorRate: 0, averageLatency: 38 },
      { serviceName: 'Payment Service', status: 'warning', uptime: 97.5, requestCount: 67, errorRate: 2.5, averageLatency: 230 },
      { serviceName: 'Delivery Service', status: 'healthy', uptime: 100, requestCount: 42, errorRate: 0, averageLatency: 52 },
    ];

    for (const metric of defaultServiceMetrics) {
      await dbStorage.createServiceMetric(metric);
    }
  }
}

// Initialize the database and create a storage instance
export const storage = new DatabaseStorage();
// Run initialization in the background
initializeDefaultData().catch(console.error);