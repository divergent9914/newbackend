import express, { Request, Response } from 'express';
import { orderStorage, orderItemStorage } from './storage';
import { orderService } from './service';
import { 
  orderInsertSchema, 
  orderItemInsertSchema 
} from '../../shared/schema';
import { 
  asyncHandler, 
  createSuccessResponse, 
  createErrorResponse, 
  validateId 
} from '../../shared/utils';
import { z } from 'zod';

// Create router
const router = express.Router();

/**
 * @route GET /api/orders
 * @desc Get all orders or filter by status or user
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, userId } = req.query;
  
  if (status && typeof status === 'string') {
    const orders = await orderStorage.getByStatus(status);
    return res.json(createSuccessResponse(orders));
  }
  
  if (userId && typeof userId === 'string') {
    const id = parseInt(userId);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('Invalid user ID', undefined, 400)
      );
    }
    
    const orders = await orderStorage.getByUserId(id);
    return res.json(createSuccessResponse(orders));
  }
  
  const orders = await orderStorage.getAll();
  res.json(createSuccessResponse(orders));
}));

/**
 * @route GET /api/orders/:id
 * @desc Get an order by ID with its items
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const orderWithItems = await orderService.getOrderWithItems(id);
  
  if (!orderWithItems) {
    return res.status(404).json(
      createErrorResponse('Order not found', undefined, 404)
    );
  }
  
  res.json(createSuccessResponse(orderWithItems));
}));

/**
 * @route POST /api/orders
 * @desc Create a new order with items
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { order, items } = req.body;
    
    if (!order || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(
        createErrorResponse('Order and items are required', undefined, 400)
      );
    }
    
    // Validate order data
    const orderData = orderInsertSchema.parse(order);
    
    // Create order with items
    const newOrder = await orderService.createOrder(orderData, items);
    
    res.status(201).json(createSuccessResponse(newOrder));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        createErrorResponse('Validation error', error.errors, 400)
      );
    }
    throw error;
  }
}));

/**
 * @route PUT /api/orders/:id
 * @desc Update an order
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const orderData = orderInsertSchema.partial().parse(req.body);
    
    const updatedOrder = await orderStorage.update(id, orderData);
    
    if (!updatedOrder) {
      return res.status(404).json(
        createErrorResponse('Order not found', undefined, 404)
      );
    }
    
    res.json(createSuccessResponse(updatedOrder));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        createErrorResponse('Validation error', error.errors, 400)
      );
    }
    throw error;
  }
}));

/**
 * @route PUT /api/orders/:id/status
 * @desc Update order status
 */
router.put('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json(
        createErrorResponse('Status is required', undefined, 400)
      );
    }
    
    const updatedOrder = await orderService.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json(
        createErrorResponse('Order not found', undefined, 404)
      );
    }
    
    res.json(createSuccessResponse(updatedOrder));
  } catch (error: any) {
    res.status(400).json(
      createErrorResponse(error.message, undefined, 400)
    );
  }
}));

/**
 * @route POST /api/orders/:id/cancel
 * @desc Cancel an order
 */
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    
    const updatedOrder = await orderService.cancelOrder(id);
    
    res.json(createSuccessResponse(updatedOrder));
  } catch (error: any) {
    res.status(400).json(
      createErrorResponse(error.message, undefined, 400)
    );
  }
}));

/**
 * @route GET /api/orders/:id/items
 * @desc Get order items
 */
router.get('/:id/items', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Check if order exists
  const order = await orderStorage.getById(id);
  if (!order) {
    return res.status(404).json(
      createErrorResponse('Order not found', undefined, 404)
    );
  }
  
  const items = await orderItemStorage.getByOrderId(id);
  res.json(createSuccessResponse(items));
}));

/**
 * @route POST /api/orders/:id/items
 * @desc Add an item to an order
 */
router.post('/:id/items', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    
    // Check if order exists
    const order = await orderStorage.getById(id);
    if (!order) {
      return res.status(404).json(
        createErrorResponse('Order not found', undefined, 404)
      );
    }
    
    // Only allow adding items to pending orders
    if (order.status !== 'pending') {
      return res.status(400).json(
        createErrorResponse(
          `Cannot add items to order with status: ${order.status}`,
          undefined,
          400
        )
      );
    }
    
    // Validate item data
    const itemData = orderItemInsertSchema.parse({
      ...req.body,
      orderId: id
    });
    
    const newItem = await orderItemStorage.create(itemData);
    
    // Recalculate order total
    const items = await orderItemStorage.getByOrderId(id);
    const total = items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    
    await orderStorage.update(id, {
      totalAmount: total,
      updatedAt: new Date()
    });
    
    res.status(201).json(createSuccessResponse(newItem));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        createErrorResponse('Validation error', error.errors, 400)
      );
    }
    throw error;
  }
}));

export default router;