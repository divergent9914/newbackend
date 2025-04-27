import { db } from '../../shared/db';
import { orders, orderItems } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { 
  Order, 
  InsertOrder, 
  OrderItem,
  InsertOrderItem,
  IOrderStorage,
  IOrderItemStorage 
} from '../../shared/storage';

/**
 * Order Storage implementation using database
 * Implements the IOrderStorage interface
 */
export class OrderStorage implements IOrderStorage {
  /**
   * Get an order by ID
   * @param id Order ID
   */
  async getById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  /**
   * Get all orders
   */
  async getAll(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  /**
   * Create a new order
   * @param data Order data
   */
  async create(data: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(data).returning();
    return newOrder;
  }
  
  /**
   * Update an order
   * @param id Order ID
   * @param data Order data
   */
  async update(id: number, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(data)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  /**
   * Delete an order
   * @param id Order ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedOrder] = await db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();
    return !!deletedOrder;
  }
  
  /**
   * Get orders by user ID
   * @param userId User ID
   */
  async getByUserId(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));
  }
  
  /**
   * Get orders by status
   * @param status Order status
   */
  async getByStatus(status: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, status));
  }
}

/**
 * Order Item Storage implementation using database
 * Implements the IOrderItemStorage interface
 */
export class OrderItemStorage implements IOrderItemStorage {
  /**
   * Get an order item by ID
   * @param id Order item ID
   */
  async getById(id: number): Promise<OrderItem | undefined> {
    const [orderItem] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return orderItem || undefined;
  }
  
  /**
   * Get all order items
   */
  async getAll(): Promise<OrderItem[]> {
    return await db.select().from(orderItems);
  }
  
  /**
   * Create a new order item
   * @param data Order item data
   */
  async create(data: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(data).returning();
    return newOrderItem;
  }
  
  /**
   * Update an order item
   * @param id Order item ID
   * @param data Order item data
   */
  async update(id: number, data: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const [updatedOrderItem] = await db
      .update(orderItems)
      .set(data)
      .where(eq(orderItems.id, id))
      .returning();
    return updatedOrderItem || undefined;
  }
  
  /**
   * Delete an order item
   * @param id Order item ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedOrderItem] = await db
      .delete(orderItems)
      .where(eq(orderItems.id, id))
      .returning();
    return !!deletedOrderItem;
  }
  
  /**
   * Get order items by order ID
   * @param orderId Order ID
   */
  async getByOrderId(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
}

// Export singleton instances
export const orderStorage = new OrderStorage();
export const orderItemStorage = new OrderItemStorage();