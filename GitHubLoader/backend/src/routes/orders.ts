import { Router } from 'express';
import { storage } from '../storage';
import { createOrderSchema } from '../models/schema';
import { z } from 'zod';

const router = Router();

// Get all orders (admin route)
router.get('/', async (req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get orders by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const orders = await storage.getOrdersByUser(userId);
    res.json({ orders });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching user orders" });
  }
});

// Get orders by kitchen ID (admin route)
router.get('/kitchen/:kitchenId', async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.kitchenId);
    const orders = await storage.getOrdersByKitchen(kitchenId);
    res.json({ orders });
  } catch (error: any) {
    console.error("Error fetching kitchen orders:", error);
    res.status(500).json({ message: "Error fetching kitchen orders" });
  }
});

// Get orders by status (admin route)
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const orders = await storage.getOrdersByStatus(status);
    res.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Error fetching orders by status" });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    // Get kitchen information
    const kitchen = await storage.getKitchen(order.kitchenId);
    
    // Get delivery slot if available
    let deliverySlot = null;
    if (order.deliverySlotId) {
      deliverySlot = await storage.getDeliverySlot(order.deliverySlotId);
    }
    
    // Get user information if available
    let user = null;
    if (order.userId) {
      user = await storage.getUser(order.userId);
    }
    
    // Create combined response with all order details
    const orderDetails = {
      ...order,
      items: await Promise.all(orderItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      })),
      kitchen,
      deliverySlot,
      user
    };
    
    res.json(orderDetails);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate order data
    const validatedData = createOrderSchema.parse(orderData);
    
    // Set default values for database insert
    const orderInsertData = {
      kitchenId: validatedData.kitchenId,
      orderMode: validatedData.orderMode,
      deliverySlotId: validatedData.deliverySlotId,
      deliveryAddress: validatedData.deliveryAddress,
      orderStatus: "pending",
      subtotal: validatedData.subtotal,
      deliveryFee: validatedData.deliveryFee,
      serviceFee: validatedData.serviceFee,
      total: validatedData.total,
      // Use a placeholder user ID for now since we don't have user authentication yet
      userId: 1
    };
    
    // Insert order into database
    const order = await storage.createOrder(orderInsertData);
    
    // Insert order items
    const orderItems = await Promise.all(
      validatedData.items.map(async (item) => {
        const orderItem = {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null,
          // Get the price from the product
          price: (await storage.getProduct(item.productId))?.price || "0.00"
        };
        return await storage.createOrderItem(orderItem);
      })
    );
    
    // Return the created order with items
    res.status(201).json({
      ...order,
      items: orderItems
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(400).json({ message: error.message || "Failed to create order" });
  }
});

// Update order status (admin route)
router.patch('/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Validate request body
    const schema = z.object({
      status: z.string()
    });
    
    const { status } = schema.parse(req.body);
    
    // Verify order exists
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    res.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(400).json({ message: error.message || "Error updating order status" });
  }
});

export default router;