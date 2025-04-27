import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  Category, 
  InsertCategory, 
  Order, 
  InsertOrder, 
  OrderItem, 
  InsertOrderItem, 
  Payment, 
  InsertPayment, 
  Delivery, 
  InsertDelivery, 
  DeliveryLocationHistory, 
  InsertDeliveryLocationHistory,
  OndcIntegration,
  InsertOndcIntegration,
  ApiRoute,
  InsertApiRoute,
  ServiceMetric,
  InsertServiceMetric
} from './schema';

/**
 * User storage interface
 */
export interface IUserStorage {
  getById(id: number): Promise<User | undefined>;
  getByUsername(username: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  getAll(): Promise<User[]>;
  create(data: InsertUser): Promise<User>;
  update(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Product storage interface
 */
export interface IProductStorage {
  getById(id: number): Promise<Product | undefined>;
  getBySlug(slug: string): Promise<Product | undefined>;
  getAll(): Promise<Product[]>;
  getAllByCategory(categoryId: number): Promise<Product[]>;
  create(data: InsertProduct): Promise<Product>;
  update(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Category storage interface
 */
export interface ICategoryStorage {
  getById(id: number): Promise<Category | undefined>;
  getBySlug(slug: string): Promise<Category | undefined>;
  getAll(): Promise<Category[]>;
  create(data: InsertCategory): Promise<Category>;
  update(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Order storage interface
 */
export interface IOrderStorage {
  getById(id: number): Promise<Order | undefined>;
  getAll(): Promise<Order[]>;
  getByUserId(userId: number): Promise<Order[]>;
  getByStatus(status: string): Promise<Order[]>;
  create(data: InsertOrder): Promise<Order>;
  update(id: number, data: Partial<InsertOrder>): Promise<Order | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Order item storage interface
 */
export interface IOrderItemStorage {
  getById(id: number): Promise<OrderItem | undefined>;
  getAll(): Promise<OrderItem[]>;
  getByOrderId(orderId: number): Promise<OrderItem[]>;
  create(data: InsertOrderItem): Promise<OrderItem>;
  update(id: number, data: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Payment storage interface
 */
export interface IPaymentStorage {
  getById(id: number): Promise<Payment | undefined>;
  getAll(): Promise<Payment[]>;
  getByOrderId(orderId: number): Promise<Payment[]>;
  create(data: InsertPayment): Promise<Payment>;
  update(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Delivery storage interface
 */
export interface IDeliveryStorage {
  getById(id: number): Promise<Delivery | undefined>;
  getAll(): Promise<Delivery[]>;
  getByOrderId(orderId: number): Promise<Delivery[]>;
  getActiveDeliveries(): Promise<Delivery[]>;
  create(data: InsertDelivery): Promise<Delivery>;
  update(id: number, data: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Delivery location history storage interface
 */
export interface IDeliveryLocationHistoryStorage {
  getById(id: number): Promise<DeliveryLocationHistory | undefined>;
  getAll(): Promise<DeliveryLocationHistory[]>;
  getByDeliveryId(deliveryId: number): Promise<DeliveryLocationHistory[]>;
  getLatestByDeliveryId(deliveryId: number): Promise<DeliveryLocationHistory | undefined>;
  create(data: InsertDeliveryLocationHistory): Promise<DeliveryLocationHistory>;
  delete(id: number): Promise<boolean>;
}

/**
 * ONDC integration storage interface
 */
export interface IOndcIntegrationStorage {
  getById(id: number): Promise<OndcIntegration | undefined>;
  getAll(): Promise<OndcIntegration[]>;
  create(data: InsertOndcIntegration): Promise<OndcIntegration>;
  update(id: number, data: Partial<InsertOndcIntegration>): Promise<OndcIntegration | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * API route storage interface
 */
export interface IApiRouteStorage {
  getById(id: number): Promise<ApiRoute | undefined>;
  getAll(): Promise<ApiRoute[]>;
  create(data: InsertApiRoute): Promise<ApiRoute>;
  update(id: number, data: Partial<InsertApiRoute>): Promise<ApiRoute | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Service metric storage interface
 */
export interface IServiceMetricStorage {
  getById(id: number): Promise<ServiceMetric | undefined>;
  getAll(): Promise<ServiceMetric[]>;
  getByServiceName(serviceName: string): Promise<ServiceMetric[]>;
  create(data: InsertServiceMetric): Promise<ServiceMetric>;
  update(id: number, data: Partial<InsertServiceMetric>): Promise<ServiceMetric | undefined>;
  delete(id: number): Promise<boolean>;
}

// Re-export the types from schema
export {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Category,
  InsertCategory,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Payment,
  InsertPayment,
  Delivery,
  InsertDelivery,
  DeliveryLocationHistory,
  InsertDeliveryLocationHistory,
  OndcIntegration,
  InsertOndcIntegration,
  ApiRoute,
  InsertApiRoute,
  ServiceMetric,
  InsertServiceMetric
};