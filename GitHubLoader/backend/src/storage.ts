import {
  users, 
  kitchens, 
  categories, 
  products, 
  deliverySlots, 
  orders, 
  orderItems,
  type User, 
  type InsertUser,
  type Kitchen,
  type InsertKitchen,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type DeliverySlot,
  type InsertDeliverySlot,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem
} from "./models/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Kitchen operations
  getKitchen(id: number): Promise<Kitchen | undefined>;
  getKitchens(): Promise<Kitchen[]>;
  createKitchen(kitchen: InsertKitchen): Promise<Kitchen>;
  updateKitchen(id: number, kitchen: Partial<InsertKitchen>): Promise<Kitchen | undefined>;
  deleteKitchen(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Delivery slot operations
  getDeliverySlot(id: number): Promise<DeliverySlot | undefined>;
  getDeliverySlots(): Promise<DeliverySlot[]>;
  getDeliverySlotsByKitchen(kitchenId: number): Promise<DeliverySlot[]>;
  createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot>;
  updateDeliverySlot(id: number, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot | undefined>;
  deleteDeliverySlot(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByKitchen(kitchenId: number): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Kitchen operations
  async getKitchen(id: number): Promise<Kitchen | undefined> {
    const [kitchen] = await db.select().from(kitchens).where(eq(kitchens.id, id));
    return kitchen;
  }
  
  async getKitchens(): Promise<Kitchen[]> {
    return await db.select().from(kitchens);
  }
  
  async createKitchen(kitchen: InsertKitchen): Promise<Kitchen> {
    const [newKitchen] = await db.insert(kitchens).values(kitchen).returning();
    return newKitchen;
  }
  
  async updateKitchen(id: number, kitchen: Partial<InsertKitchen>): Promise<Kitchen | undefined> {
    const [updatedKitchen] = await db.update(kitchens)
      .set(kitchen)
      .where(eq(kitchens.id, id))
      .returning();
    return updatedKitchen;
  }
  
  async deleteKitchen(id: number): Promise<boolean> {
    const result = await db.delete(kitchens).where(eq(kitchens.id, id));
    return true; // In Drizzle, no rows affected doesn't throw an error
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db.update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categorySlug, slug));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
  }
  
  // Delivery slot operations
  async getDeliverySlot(id: number): Promise<DeliverySlot | undefined> {
    const [slot] = await db.select().from(deliverySlots).where(eq(deliverySlots.id, id));
    return slot;
  }
  
  async getDeliverySlots(): Promise<DeliverySlot[]> {
    return await db.select().from(deliverySlots);
  }
  
  async getDeliverySlotsByKitchen(kitchenId: number): Promise<DeliverySlot[]> {
    return await db.select().from(deliverySlots).where(eq(deliverySlots.kitchenId, kitchenId));
  }
  
  async createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot> {
    const [newSlot] = await db.insert(deliverySlots).values(slot).returning();
    return newSlot;
  }
  
  async updateDeliverySlot(id: number, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot | undefined> {
    const [updatedSlot] = await db.update(deliverySlots)
      .set(slot)
      .where(eq(deliverySlots.id, id))
      .returning();
    return updatedSlot;
  }
  
  async deleteDeliverySlot(id: number): Promise<boolean> {
    const result = await db.delete(deliverySlots).where(eq(deliverySlots.id, id));
    return true;
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async getOrdersByKitchen(kitchenId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.kitchenId, kitchenId));
  }
  
  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.orderStatus, status));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ orderStatus: status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }
}

export const storage = new DatabaseStorage();