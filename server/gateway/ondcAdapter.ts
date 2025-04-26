import { storage } from "../storage";
import { orderService } from "../services/orderService";
import { inventoryService } from "../services/inventoryService";
import { paymentService } from "../services/paymentService";
import { deliveryService } from "../services/deliveryService";

class OndcAdapter {
  async getIntegrations() {
    try {
      return await storage.getOndcIntegrations();
    } catch (error) {
      console.error("Failed to get ONDC integrations:", error);
      throw error;
    }
  }

  async updateIntegrationStatus(id: number, status: string) {
    try {
      return await storage.updateOndcIntegrationStatus(id, status);
    } catch (error) {
      console.error("Failed to update ONDC integration status:", error);
      throw error;
    }
  }

  async search(criteria: any) {
    try {
      // Map to inventory service
      const products = await inventoryService.getAllProducts();
      
      // Transform to ONDC format
      const ondcResponse = {
        context: {
          domain: "retail",
          action: "search",
          timestamp: new Date().toISOString()
        },
        message: {
          catalog: {
            items: products.map(product => ({
              id: product.id.toString(),
              descriptor: {
                name: product.name,
                long_desc: product.description
              },
              price: {
                currency: "INR",
                value: product.price.toString()
              },
              quantity: {
                available: product.stock,
                maximum: {
                  count: product.stock
                }
              },
              category_id: product.categoryId.toString()
            }))
          }
        }
      };
      
      return ondcResponse;
    } catch (error) {
      console.error("ONDC search failed:", error);
      throw error;
    }
  }

  async select(payload: any) {
    try {
      // Map to order service (cart creation functionality)
      const orderData = {
        userId: payload.user_id || 1, // Default to user ID 1 if not provided
        status: "cart",
        totalAmount: payload.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      };
      
      const items = payload.items.map((item: any) => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
        unitPrice: item.price
      }));
      
      const order = await orderService.createOrder(orderData, items);
      
      // Transform to ONDC format
      const ondcResponse = {
        context: {
          domain: "retail",
          action: "select",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: order.id.toString(),
            state: "CREATED",
            items: items.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              price: {
                currency: "INR",
                value: item.unitPrice.toString()
              }
            })),
            billing: {
              name: "User Name", // This would come from user data
              address: "User Address", // This would come from user data
              phone: "User Phone" // This would come from user data
            },
            quote: {
              price: {
                currency: "INR",
                value: orderData.totalAmount.toString()
              }
            }
          }
        }
      };
      
      return ondcResponse;
    } catch (error) {
      console.error("ONDC select failed:", error);
      throw error;
    }
  }

  async init(payload: any) {
    try {
      // Map to order service (order initialization)
      const orderId = parseInt(payload.order.id);
      
      const order = await orderService.getOrderById(orderId);
      
      // Update the order status
      await orderService.updateOrderStatus(orderId, "initialized");
      
      // Transform to ONDC format
      const ondcResponse = {
        context: {
          domain: "retail",
          action: "init",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: order.id.toString(),
            state: "INITIALIZED",
            items: order.items.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              price: {
                currency: "INR",
                value: item.unitPrice.toString()
              }
            })),
            billing: payload.order.billing,
            fulfillment: payload.order.fulfillment,
            quote: {
              price: {
                currency: "INR",
                value: order.totalAmount.toString()
              }
            }
          }
        }
      };
      
      return ondcResponse;
    } catch (error) {
      console.error("ONDC init failed:", error);
      throw error;
    }
  }

  async confirm(payload: any) {
    try {
      // Map to payment service
      const orderId = parseInt(payload.order.id);
      
      // Get order details
      const order = await orderService.getOrderById(orderId);
      
      // Create payment
      const payment = await paymentService.createPayment({
        orderId,
        amount: order.totalAmount,
        status: "completed",
        method: payload.payment.type || "card",
        transactionId: payload.payment.transaction_id || `ONDC-${Date.now()}`
      });
      
      // Update order status
      await orderService.updateOrderStatus(orderId, "confirmed");
      
      // Transform to ONDC format
      const ondcResponse = {
        context: {
          domain: "retail",
          action: "confirm",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: order.id.toString(),
            state: "CONFIRMED",
            items: order.items.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              price: {
                currency: "INR",
                value: item.unitPrice.toString()
              }
            })),
            billing: payload.order.billing,
            fulfillment: payload.order.fulfillment,
            payment: {
              status: "PAID",
              type: payment.method,
              transaction_id: payment.transactionId
            },
            quote: {
              price: {
                currency: "INR",
                value: order.totalAmount.toString()
              }
            }
          }
        }
      };
      
      return ondcResponse;
    } catch (error) {
      console.error("ONDC confirm failed:", error);
      throw error;
    }
  }

  async status(payload: any) {
    try {
      // Map to delivery service
      const orderId = parseInt(payload.order_id);
      
      // Get order details
      const order = await orderService.getOrderById(orderId);
      
      // Get delivery details
      let delivery;
      try {
        delivery = await deliveryService.getDeliveryByOrderId(orderId);
      } catch (error) {
        // If delivery doesn't exist, create it
        if (order.status === "confirmed" || order.status === "processing" || order.status === "paid") {
          delivery = await deliveryService.createDelivery({
            orderId,
            status: "pending",
            address: payload.delivery_address || "Default Address",
            carrier: "Default Carrier"
          });
        }
      }
      
      // Transform to ONDC format
      const ondcResponse = {
        context: {
          domain: "retail",
          action: "status",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: order.id.toString(),
            state: this.mapOrderStateToOndc(order.status),
            items: order.items.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              price: {
                currency: "INR",
                value: item.unitPrice.toString()
              }
            })),
            fulfillment: delivery ? {
              state: {
                descriptor: {
                  name: this.mapDeliveryStateToOndc(delivery.status)
                }
              },
              tracking: delivery.trackingNumber ? {
                url: `https://example.com/track/${delivery.trackingNumber}`,
                status: delivery.status
              } : undefined
            } : undefined
          }
        }
      };
      
      return ondcResponse;
    } catch (error) {
      console.error("ONDC status failed:", error);
      throw error;
    }
  }

  private mapOrderStateToOndc(status: string): string {
    const statusMap: Record<string, string> = {
      "created": "CREATED",
      "initialized": "INITIALIZED",
      "confirmed": "CONFIRMED",
      "processing": "PROCESSING",
      "shipped": "SHIPPED",
      "delivered": "DELIVERED",
      "completed": "COMPLETED",
      "cancelled": "CANCELLED",
      "payment_failed": "PAYMENT_FAILED"
    };
    
    return statusMap[status] || "CREATED";
  }

  private mapDeliveryStateToOndc(status: string): string {
    const statusMap: Record<string, string> = {
      "pending": "Delivery Pending",
      "in_transit": "In Transit",
      "out_for_delivery": "Out for Delivery",
      "delivered": "Delivered",
      "failed": "Delivery Failed"
    };
    
    return statusMap[status] || "Pending";
  }
}

export const ondcAdapter = new OndcAdapter();
