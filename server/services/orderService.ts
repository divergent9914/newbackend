import { storage } from "../storage";
import { InsertOrder, InsertOrderItem } from "@shared/schema";

class OrderService {
  private readonly serviceName = "Order Service";

  async getAllOrders() {
    try {
      const orders = await storage.getOrders();
      await this.updateMetrics(true);
      return orders;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getOrderById(id: number) {
    try {
      const order = await storage.getOrder(id);
      if (!order) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const orderItems = await storage.getOrderItems(id);
      await this.updateMetrics(true);
      
      return { ...order, items: orderItems };
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getOrdersByUserId(userId: number) {
    try {
      const orders = await storage.getOrdersByUserId(userId);
      await this.updateMetrics(true);
      return orders;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]) {
    try {
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const orderItemPromises = items.map(item => 
        storage.createOrderItem({ ...item, orderId: order.id })
      );
      
      await Promise.all(orderItemPromises);
      
      // Update inventory for each item
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          await storage.updateProductStock(item.productId, newStock);
        }
      }
      
      await this.updateMetrics(true);
      return order;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string) {
    try {
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      await this.updateMetrics(true);
      return updatedOrder;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  private async updateMetrics(success: boolean) {
    try {
      const metrics = (await storage.getServiceMetricsByName(this.serviceName))[0];
      
      if (metrics) {
        const requestCount = metrics.requestCount + 1;
        const errorCount = success ? metrics.errorRate * metrics.requestCount : (metrics.errorRate * metrics.requestCount) + 1;
        const errorRate = errorCount / requestCount;
        
        await storage.updateServiceMetric(metrics.id, {
          requestCount,
          errorRate,
          status: errorRate > 0.05 ? 'warning' : 'healthy'
        });
      }
    } catch (error) {
      console.error("Failed to update metrics:", error);
    }
  }
}

export const orderService = new OrderService();
