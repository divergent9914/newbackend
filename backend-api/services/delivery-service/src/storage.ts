import { db } from '../../shared/db';
import { deliveries, deliveryLocationHistory } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { 
  Delivery, 
  InsertDelivery, 
  DeliveryLocationHistory,
  InsertDeliveryLocationHistory,
  IDeliveryStorage,
  IDeliveryLocationHistoryStorage
} from '../../shared/storage';

/**
 * Delivery Storage implementation using database
 * Implements the IDeliveryStorage interface
 */
export class DeliveryStorage implements IDeliveryStorage {
  /**
   * Get a delivery by ID
   * @param id Delivery ID
   */
  async getById(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }
  
  /**
   * Get all deliveries
   */
  async getAll(): Promise<Delivery[]> {
    return await db.select().from(deliveries);
  }
  
  /**
   * Create a new delivery
   * @param data Delivery data
   */
  async create(data: InsertDelivery): Promise<Delivery> {
    const [newDelivery] = await db.insert(deliveries).values(data).returning();
    return newDelivery;
  }
  
  /**
   * Update a delivery
   * @param id Delivery ID
   * @param data Delivery data
   */
  async update(id: number, data: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(data)
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery || undefined;
  }
  
  /**
   * Delete a delivery
   * @param id Delivery ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedDelivery] = await db
      .delete(deliveries)
      .where(eq(deliveries.id, id))
      .returning();
    return !!deletedDelivery;
  }
  
  /**
   * Get deliveries by order ID
   * @param orderId Order ID
   */
  async getByOrderId(orderId: number): Promise<Delivery[]> {
    return await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.orderId, orderId));
  }
  
  /**
   * Get deliveries by status
   * @param status Delivery status
   */
  async getByStatus(status: string): Promise<Delivery[]> {
    return await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.status, status));
  }
}

/**
 * Delivery Location History Storage implementation using database
 * Implements the IDeliveryLocationHistoryStorage interface
 */
export class DeliveryLocationHistoryStorage implements IDeliveryLocationHistoryStorage {
  /**
   * Get a location history record by ID
   * @param id Location history ID
   */
  async getById(id: number): Promise<DeliveryLocationHistory | undefined> {
    const [history] = await db
      .select()
      .from(deliveryLocationHistory)
      .where(eq(deliveryLocationHistory.id, id));
    return history || undefined;
  }
  
  /**
   * Get all location history records
   */
  async getAll(): Promise<DeliveryLocationHistory[]> {
    return await db.select().from(deliveryLocationHistory);
  }
  
  /**
   * Create a new location history record
   * @param data Location history data
   */
  async create(data: InsertDeliveryLocationHistory): Promise<DeliveryLocationHistory> {
    const [newHistory] = await db
      .insert(deliveryLocationHistory)
      .values(data)
      .returning();
    return newHistory;
  }
  
  /**
   * Update a location history record
   * @param id Location history ID
   * @param data Location history data
   */
  async update(id: number, data: Partial<InsertDeliveryLocationHistory>): Promise<DeliveryLocationHistory | undefined> {
    const [updatedHistory] = await db
      .update(deliveryLocationHistory)
      .set(data)
      .where(eq(deliveryLocationHistory.id, id))
      .returning();
    return updatedHistory || undefined;
  }
  
  /**
   * Delete a location history record
   * @param id Location history ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedHistory] = await db
      .delete(deliveryLocationHistory)
      .where(eq(deliveryLocationHistory.id, id))
      .returning();
    return !!deletedHistory;
  }
  
  /**
   * Get location history records by delivery ID
   * @param deliveryId Delivery ID
   */
  async getByDeliveryId(deliveryId: number): Promise<DeliveryLocationHistory[]> {
    return await db
      .select()
      .from(deliveryLocationHistory)
      .where(eq(deliveryLocationHistory.deliveryId, deliveryId));
  }
}

// Export singleton instances
export const deliveryStorage = new DeliveryStorage();
export const deliveryLocationHistoryStorage = new DeliveryLocationHistoryStorage();