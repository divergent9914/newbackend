/**
 * API Gateway Routes
 * 
 * This module defines the routes for the API Gateway service.
 * It proxies requests to the appropriate microservices.
 */

import { Express, Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { asyncHandler } from '../../../shared/utils';
import {
  callUserService,
  callProductService,
  callOrderService,
  callDeliveryService,
  callOndcService,
  Service,
  serviceClient,
} from '../../../shared/service-client';
import config from '../../../shared/config';

// Authentication middleware
const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Validate token with user service
    const userData = await callUserService('POST', '/auth/verify', { token });
    
    // Attach user data to request
    req.user = userData;
    
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
});

// Setup all routes
export function setupRoutes(app: Express) {
  const router = app.route(config.service.apiPrefix);
  
  // API documentation
  app.get(config.service.apiPrefix, (req: Request, res: Response) => {
    res.json({
      name: 'ONDC E-commerce API Gateway',
      version: config.version,
      description: 'API Gateway for ONDC E-commerce microservices',
      endpoints: {
        auth: `${config.service.apiPrefix}/auth`,
        users: `${config.service.apiPrefix}/users`,
        products: `${config.service.apiPrefix}/products`,
        orders: `${config.service.apiPrefix}/orders`,
        deliveries: `${config.service.apiPrefix}/deliveries`,
        ondc: `${config.service.apiPrefix}/ondc`,
      },
    });
  });
  
  // Auth routes
  setupAuthRoutes(app);
  
  // User routes
  setupUserRoutes(app);
  
  // Product routes
  setupProductRoutes(app);
  
  // Order routes
  setupOrderRoutes(app);
  
  // Delivery routes
  setupDeliveryRoutes(app);
  
  // ONDC routes
  setupOndcRoutes(app);
  
  // Stripe webhook handler (no auth required)
  app.post(`${config.service.apiPrefix}/webhooks/stripe`, express.raw({ type: 'application/json' }), 
    asyncHandler(async (req: Request, res: Response) => {
      try {
        // Forward to the order service
        const response = await callOrderService('POST', '/webhooks/stripe', req.body);
        res.json(response);
      } catch (error: any) {
        console.error('Stripe webhook error:', error);
        res.status(500).json({ error: 'Webhook handling failed' });
      }
    })
  );
}

// Setup auth routes
function setupAuthRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/auth`;
  
  // Login
  app.post(`${prefix}/login`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('POST', '/auth/login', req.body);
    res.json(response);
  }));
  
  // Register
  app.post(`${prefix}/register`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('POST', '/auth/register', req.body);
    res.json(response);
  }));
  
  // Logout
  app.post(`${prefix}/logout`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('POST', '/auth/logout', { userId: req.user.id });
    res.json(response);
  }));
  
  // Change password
  app.post(`${prefix}/change-password`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('POST', '/auth/change-password', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
}

// Setup user routes
function setupUserRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/users`;
  
  // Get current user
  app.get(`${prefix}/me`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('GET', `/users/${req.user.id}`);
    res.json(response);
  }));
  
  // Update current user
  app.put(`${prefix}/me`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callUserService('PUT', `/users/${req.user.id}`, req.body);
    res.json(response);
  }));
  
  // Get user by ID (admin only)
  app.get(`${prefix}/:id`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callUserService('GET', `/users/${req.params.id}`);
    res.json(response);
  }));
}

// Setup product routes
function setupProductRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/products`;
  
  // Get all products
  app.get(prefix, asyncHandler(async (req: Request, res: Response) => {
    const response = await callProductService('GET', '/products', { params: req.query });
    res.json(response);
  }));
  
  // Get product by ID
  app.get(`${prefix}/:id`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callProductService('GET', `/products/${req.params.id}`);
    res.json(response);
  }));
  
  // Create product (admin only)
  app.post(prefix, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callProductService('POST', '/products', req.body);
    res.json(response);
  }));
  
  // Update product (admin only)
  app.put(`${prefix}/:id`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callProductService('PUT', `/products/${req.params.id}`, req.body);
    res.json(response);
  }));
  
  // Delete product (admin only)
  app.delete(`${prefix}/:id`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callProductService('DELETE', `/products/${req.params.id}`);
    res.json(response);
  }));
  
  // Get products by category
  app.get(`${prefix}/category/:slug`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callProductService('GET', `/products/category/${req.params.slug}`, { 
      params: req.query 
    });
    res.json(response);
  }));
  
  // Get all categories
  app.get(`${config.service.apiPrefix}/categories`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callProductService('GET', '/categories');
    res.json(response);
  }));
}

// Setup order routes
function setupOrderRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/orders`;
  
  // Get all orders for current user
  app.get(prefix, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOrderService('GET', '/orders', { 
      params: { ...req.query, userId: req.user.id } 
    });
    res.json(response);
  }));
  
  // Get order by ID
  app.get(`${prefix}/:id`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOrderService('GET', `/orders/${req.params.id}`);
    
    // Check if the order belongs to the current user or user is admin
    if (response.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    res.json(response);
  }));
  
  // Create order
  app.post(prefix, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOrderService('POST', '/orders', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
  
  // Update order status (admin only)
  app.put(`${prefix}/:id/status`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callOrderService('PUT', `/orders/${req.params.id}/status`, req.body);
    res.json(response);
  }));
  
  // Cancel order
  app.post(`${prefix}/:id/cancel`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const order = await callOrderService('GET', `/orders/${req.params.id}`);
    
    // Check if the order belongs to the current user or user is admin
    if (order.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callOrderService('POST', `/orders/${req.params.id}/cancel`, {
      userId: req.user.id,
      ...req.body,
    });
    res.json(response);
  }));
  
  // Create payment intent
  app.post(`${prefix}/payment-intent`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOrderService('POST', '/orders/payment-intent', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
}

// Setup delivery routes
function setupDeliveryRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/deliveries`;
  
  // Get delivery by ID
  app.get(`${prefix}/:id`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callDeliveryService('GET', `/deliveries/${req.params.id}`);
    
    // Check if the delivery is associated with the user's order or user is admin
    const order = await callOrderService('GET', `/orders/${response.orderId}`);
    if (order.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    res.json(response);
  }));
  
  // Get delivery status
  app.get(`${prefix}/:id/status`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callDeliveryService('GET', `/deliveries/${req.params.id}/status`);
    res.json(response);
  }));
  
  // Get delivery tracking
  app.get(`${prefix}/:id/tracking`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callDeliveryService('GET', `/deliveries/${req.params.id}/tracking`);
    res.json(response);
  }));
  
  // Update delivery location (for delivery personnel only)
  app.post(`${prefix}/:id/location`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isDeliveryPerson) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callDeliveryService('POST', `/deliveries/${req.params.id}/location`, {
      ...req.body,
      deliveryPersonId: req.user.id,
    });
    res.json(response);
  }));
  
  // Mark delivery as complete (for delivery personnel only)
  app.post(`${prefix}/:id/complete`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.isDeliveryPerson) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
      });
    }
    
    const response = await callDeliveryService('POST', `/deliveries/${req.params.id}/complete`, {
      ...req.body,
      deliveryPersonId: req.user.id,
    });
    res.json(response);
  }));
}

// Setup ONDC routes
function setupOndcRoutes(app: Express) {
  const prefix = `${config.service.apiPrefix}/ondc`;
  
  // ONDC search
  app.post(`${prefix}/search`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/search', req.body);
    res.json(response);
  }));
  
  // ONDC select
  app.post(`${prefix}/select`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/select', req.body);
    res.json(response);
  }));
  
  // ONDC init
  app.post(`${prefix}/init`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/init', req.body);
    res.json(response);
  }));
  
  // ONDC confirm
  app.post(`${prefix}/confirm`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/confirm', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
  
  // ONDC status
  app.post(`${prefix}/status`, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/status', req.body);
    res.json(response);
  }));
  
  // ONDC cancel
  app.post(`${prefix}/cancel`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/cancel', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
  
  // ONDC update
  app.post(`${prefix}/update`, authenticate, asyncHandler(async (req: Request, res: Response) => {
    const response = await callOndcService('POST', '/update', {
      ...req.body,
      userId: req.user.id,
    });
    res.json(response);
  }));
}