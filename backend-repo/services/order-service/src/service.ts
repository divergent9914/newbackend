import { orderStorage, orderItemStorage } from './storage';
import { 
  ServiceClient, 
  ServiceName 
} from '../../shared/service-client';
import { 
  eventBroker, 
  EventType 
} from '../../shared/event-broker';
import { 
  Order, 
  InsertOrder, 
  OrderItem, 
  InsertOrderItem,
  Product
} from '../../shared/schema';

/**
 * Order Service
 * Contains business logic for order management
 */
export class OrderService {
  private serviceClient: ServiceClient;
  
  constructor() {
    this.serviceClient = new ServiceClient();
  }
  
  /**
   * Create a new order with items
   * @param orderData Order data
   * @param items Order items (with product ID and quantity)
   */
  async createOrder(
    orderData: InsertOrder, 
    items: Array<{ productId: number; quantity: number }>
  ): Promise<Order> {
    // Calculate total amount from items
    const totalAmount = await this.calculateTotalAmount(items);
    
    // Create the order
    const newOrder = await orderStorage.create({
      ...orderData,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create order items
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      await orderItemStorage.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price
      });
    }
    
    // Publish order created event
    eventBroker.publish(EventType.ORDER_CREATED, newOrder);
    
    return newOrder;
  }
  
  /**
   * Update order status
   * @param orderId Order ID
   * @param status New status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = await orderStorage.getById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const updatedOrder = await orderStorage.update(orderId, {
      status,
      updatedAt: new Date()
    });
    
    if (updatedOrder) {
      // Publish order updated event
      eventBroker.publish(EventType.ORDER_UPDATED, updatedOrder);
      
      // Publish specific status events
      if (status === 'paid') {
        eventBroker.publish(EventType.ORDER_PAID, updatedOrder);
      } else if (status === 'cancelled') {
        eventBroker.publish(EventType.ORDER_CANCELLED, updatedOrder);
      } else if (status === 'completed') {
        eventBroker.publish(EventType.ORDER_COMPLETED, updatedOrder);
      }
    }
    
    return updatedOrder;
  }
  
  /**
   * Get order with items
   * @param orderId Order ID
   */
  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await orderStorage.getById(orderId);
    if (!order) {
      return undefined;
    }
    
    const items = await orderItemStorage.getByOrderId(orderId);
    
    return { order, items };
  }
  
  /**
   * Cancel an order
   * @param orderId Order ID
   */
  async cancelOrder(orderId: number): Promise<Order | undefined> {
    const order = await orderStorage.getById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }
    
    return await this.updateOrderStatus(orderId, 'cancelled');
  }
  
  /**
   * Calculate the total amount of an order
   * @param items Order items
   */
  private async calculateTotalAmount(
    items: Array<{ productId: number; quantity: number }>
  ): Promise<number> {
    let total = 0;
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      total += product.price * item.quantity;
    }
    
    return total;
  }
  
  /**
   * Get a product by ID
   * @param productId Product ID
   */
  private async getProduct(productId: number): Promise<Product | undefined> {
    try {
      const response = await this.serviceClient.get<Product>(
        ServiceName.PRODUCT,
        `/${productId}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      return undefined;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();