import { storage } from "../storage";
import { InsertPayment } from "@shared/schema";

class PaymentService {
  private readonly serviceName = "Payment Service";

  async getAllPayments() {
    try {
      const payments = await storage.getPayments();
      await this.updateMetrics(true);
      return payments;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getPaymentById(id: number) {
    try {
      const payment = await storage.getPayment(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      await this.updateMetrics(true);
      return payment;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId: number) {
    try {
      const payment = await storage.getPaymentByOrderId(orderId);
      if (!payment) {
        throw new Error(`Payment for order ID ${orderId} not found`);
      }
      
      await this.updateMetrics(true);
      return payment;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async createPayment(paymentData: InsertPayment) {
    try {
      // Simulate some payment processing logic
      // This is where you would integrate with a payment gateway

      // For demo purposes, introduce a random delay to simulate the high latency
      // issue shown in the design reference
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
      
      const payment = await storage.createPayment(paymentData);
      
      // Update the order status
      await storage.updateOrderStatus(payment.orderId, "paid");
      
      await this.updateMetrics(true);
      return payment;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string) {
    try {
      const updatedPayment = await storage.updatePaymentStatus(id, status, transactionId);
      if (!updatedPayment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      // If payment is successful, update the order status
      if (status === "completed") {
        await storage.updateOrderStatus(updatedPayment.orderId, "processing");
      } else if (status === "failed") {
        await storage.updateOrderStatus(updatedPayment.orderId, "payment_failed");
      }
      
      await this.updateMetrics(true);
      return updatedPayment;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async deletePayment(id: number) {
    try {
      const payment = await storage.getPayment(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      // In a real system, you'd have a soft delete mechanism
      // For this demo, we're just updating the status
      const updatedPayment = await storage.updatePaymentStatus(id, "cancelled");
      
      await this.updateMetrics(true);
      return updatedPayment;
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
        
        // Simulate the high latency issue shown in the design reference
        const averageLatency = 230;
        
        await storage.updateServiceMetric(metrics.id, {
          requestCount,
          errorRate,
          averageLatency,
          status: 'warning' // Always in warning state due to high latency
        });
      }
    } catch (error) {
      console.error("Failed to update metrics:", error);
    }
  }
}

export const paymentService = new PaymentService();
