import { storage } from "../storage";
import { InsertDelivery } from "@shared/schema";

class DeliveryService {
  private readonly serviceName = "Delivery Service";

  async getAllDeliveries() {
    try {
      const deliveries = await storage.getDeliveries();
      await this.updateMetrics(true);
      return deliveries;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getDeliveryById(id: number) {
    try {
      const delivery = await storage.getDelivery(id);
      if (!delivery) {
        throw new Error(`Delivery with ID ${id} not found`);
      }
      
      await this.updateMetrics(true);
      return delivery;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getDeliveryByOrderId(orderId: number) {
    try {
      const delivery = await storage.getDeliveryByOrderId(orderId);
      if (!delivery) {
        throw new Error(`Delivery for order ID ${orderId} not found`);
      }
      
      await this.updateMetrics(true);
      return delivery;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async createDelivery(deliveryData: InsertDelivery) {
    try {
      // Generate a tracking number
      const trackingNumber = this.generateTrackingNumber();
      
      // Set an estimated delivery date (5 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
      
      const delivery = await storage.createDelivery({
        ...deliveryData,
        trackingNumber,
        estimatedDelivery
      });
      
      // Update the order status
      await storage.updateOrderStatus(delivery.orderId, "shipped");
      
      await this.updateMetrics(true);
      return delivery;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async updateDeliveryStatus(id: number, status: string) {
    try {
      const updatedDelivery = await storage.updateDeliveryStatus(id, status);
      if (!updatedDelivery) {
        throw new Error(`Delivery with ID ${id} not found`);
      }
      
      // If delivery is completed, update the order status
      if (status === "delivered") {
        await storage.updateOrderStatus(updatedDelivery.orderId, "completed");
      }
      
      await this.updateMetrics(true);
      return updatedDelivery;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getTrackingInfo(trackingNumber: string) {
    try {
      // Find the delivery by tracking number
      const deliveries = await storage.getDeliveries();
      const delivery = deliveries.find(d => d.trackingNumber === trackingNumber);
      
      if (!delivery) {
        throw new Error(`Delivery with tracking number ${trackingNumber} not found`);
      }
      
      // Get associated order
      const order = await storage.getOrder(delivery.orderId);
      
      await this.updateMetrics(true);
      return {
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        carrier: delivery.carrier,
        estimatedDelivery: delivery.estimatedDelivery,
        address: delivery.address,
        orderReference: order?.id || 'Unknown'
      };
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  private generateTrackingNumber(): string {
    // Generate a random tracking number
    const prefix = "DLVR";
    const randomPart = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${prefix}${randomPart}`;
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

export const deliveryService = new DeliveryService();
