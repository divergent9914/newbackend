import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { orderService } from "./services/orderService";
import { inventoryService } from "./services/inventoryService";
import { paymentService } from "./services/paymentService";
import { deliveryService } from "./services/deliveryService";
import { apiGateway } from "./gateway/apiGateway";
import { ondcAdapter } from "./gateway/ondcAdapter";
import { z } from "zod";
import { 
  insertOrderSchema, 
  insertProductSchema, 
  insertPaymentSchema, 
  insertDeliverySchema,
  insertOrderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to parse the request ID from URL path parameters
  const parseIdParam = (req: Request, res: Response, next: Function) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID parameter" });
    }
    req.params.id = id.toString();
    next();
  };

  // API Gateway routes
  app.get('/api/gateway/routes', async (req, res) => {
    try {
      const routes = await apiGateway.getRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/gateway/routes', async (req, res) => {
    try {
      const routeSchema = z.object({
        path: z.string(),
        method: z.string(),
        service: z.string(),
        active: z.boolean()
      });
      
      const validatedData = routeSchema.parse(req.body);
      const route = await apiGateway.addRoute(validatedData);
      res.status(201).json(route);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/gateway/routes/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: "Active must be a boolean" });
      }
      
      const route = await apiGateway.updateRouteStatus(id, active);
      res.json(route);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/gateway/refresh', async (req, res) => {
    try {
      const routes = await apiGateway.refreshRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ONDC Integration routes
  app.get('/api/ondc/integrations', async (req, res) => {
    try {
      const integrations = await ondcAdapter.getIntegrations();
      res.json(integrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/ondc/integrations/:id/status', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (typeof status !== 'string') {
        return res.status(400).json({ message: "Status must be a string" });
      }
      
      const integration = await ondcAdapter.updateIntegrationStatus(id, status);
      res.json(integration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ONDC protocol endpoints
  app.post('/api/ondc/search', async (req, res) => {
    try {
      const result = await ondcAdapter.search(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ondc/select', async (req, res) => {
    try {
      const result = await ondcAdapter.select(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ondc/init', async (req, res) => {
    try {
      const result = await ondcAdapter.init(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ondc/confirm', async (req, res) => {
    try {
      const result = await ondcAdapter.confirm(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ondc/status', async (req, res) => {
    try {
      const result = await ondcAdapter.status(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service Metrics routes
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await storage.getServiceMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/metrics/:service', async (req, res) => {
    try {
      const serviceName = req.params.service;
      const metrics = await storage.getServiceMetricsByName(serviceName);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order Service routes
  app.get('/api/v1/orders', async (req, res) => {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/v1/orders/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await orderService.getOrderById(id);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post('/api/v1/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body.order);
      
      // Validate array of order items
      const itemsSchema = z.array(insertOrderItemSchema.omit({ orderId: true }));
      const orderItems = itemsSchema.parse(req.body.items);
      
      const order = await orderService.createOrder(orderData, orderItems);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/v1/orders/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (typeof status !== 'string') {
        return res.status(400).json({ message: "Status must be a string" });
      }
      
      const order = await orderService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Inventory Service routes
  app.get('/api/v1/inventory', async (req, res) => {
    try {
      const products = await inventoryService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/v1/inventory/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await inventoryService.getProductById(id);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post('/api/v1/inventory', async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await inventoryService.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/v1/inventory/batch', async (req, res) => {
    try {
      const productsSchema = z.array(insertProductSchema);
      const productsData = productsSchema.parse(req.body);
      
      const products = await inventoryService.createBatchProducts(productsData);
      res.status(201).json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/v1/inventory/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { stock } = req.body;
      
      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ message: "Stock must be a non-negative number" });
      }
      
      const product = await inventoryService.updateProductStock(id, stock);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment Service routes
  app.get('/api/v1/payments/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await paymentService.getPaymentById(id);
      res.json(payment);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.get('/api/v1/payments/status/:orderId', parseIdParam, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const payment = await paymentService.getPaymentByOrderId(orderId);
      res.json(payment);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post('/api/v1/payments', async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await paymentService.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/v1/payments/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await paymentService.deletePayment(id);
      res.json(payment);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  // Delivery Service routes
  app.get('/api/v1/delivery/:id', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const delivery = await deliveryService.getDeliveryById(id);
      res.json(delivery);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post('/api/v1/delivery', async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await deliveryService.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/v1/delivery/:id/status', parseIdParam, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (typeof status !== 'string') {
        return res.status(400).json({ message: "Status must be a string" });
      }
      
      const delivery = await deliveryService.updateDeliveryStatus(id, status);
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/v1/delivery/tracking/:trackingNumber', async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const tracking = await deliveryService.getTrackingInfo(trackingNumber);
      res.json(tracking);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
