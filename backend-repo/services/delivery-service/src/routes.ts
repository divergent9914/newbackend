import express, { Request, Response } from 'express';
import { deliveryStorage, deliveryLocationHistoryStorage } from './storage';
import { deliveryService } from './service';
import { 
  deliveryInsertSchema, 
  deliveryLocationHistoryInsertSchema 
} from '../../shared/schema';
import { 
  asyncHandler, 
  createSuccessResponse, 
  createErrorResponse, 
  validateId 
} from '../../shared/utils';
import { eventBroker, EventType } from '../../shared/event-broker';
import { z } from 'zod';

// Create router
const router = express.Router();

/**
 * @route GET /api/deliveries
 * @desc Get all deliveries or filter by status
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, orderId } = req.query;
  
  if (status && typeof status === 'string') {
    const deliveries = await deliveryStorage.getByStatus(status);
    return res.json(createSuccessResponse(deliveries));
  }
  
  if (orderId && typeof orderId === 'string') {
    const id = parseInt(orderId);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('Invalid order ID', undefined, 400)
      );
    }
    
    const deliveries = await deliveryStorage.getByOrderId(id);
    return res.json(createSuccessResponse(deliveries));
  }
  
  const deliveries = await deliveryStorage.getAll();
  res.json(createSuccessResponse(deliveries));
}));

/**
 * @route GET /api/deliveries/:id
 * @desc Get a delivery by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const delivery = await deliveryStorage.getById(id);
  
  if (!delivery) {
    return res.status(404).json(
      createErrorResponse('Delivery not found', undefined, 404)
    );
  }
  
  res.json(createSuccessResponse(delivery));
}));

/**
 * @route POST /api/deliveries
 * @desc Create a new delivery
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const deliveryData = deliveryInsertSchema.parse(req.body);
    
    const newDelivery = await deliveryStorage.create(deliveryData);
    
    // Publish delivery created event
    eventBroker.publish(EventType.DELIVERY_CREATED, newDelivery);
    
    res.status(201).json(createSuccessResponse(newDelivery));
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
 * @route PUT /api/deliveries/:id
 * @desc Update a delivery
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const deliveryData = deliveryInsertSchema.partial().parse(req.body);
    
    const updatedDelivery = await deliveryStorage.update(id, deliveryData);
    
    if (!updatedDelivery) {
      return res.status(404).json(
        createErrorResponse('Delivery not found', undefined, 404)
      );
    }
    
    // Publish delivery updated event
    eventBroker.publish(EventType.DELIVERY_UPDATED, updatedDelivery);
    
    res.json(createSuccessResponse(updatedDelivery));
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
 * @route POST /api/deliveries/:id/start
 * @desc Start a delivery
 */
router.post('/:id/start', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  try {
    const updatedDelivery = await deliveryService.startDelivery(id);
    res.json(createSuccessResponse(updatedDelivery));
  } catch (error: any) {
    res.status(404).json(
      createErrorResponse(error.message, undefined, 404)
    );
  }
}));

/**
 * @route POST /api/deliveries/:id/complete
 * @desc Complete a delivery
 */
router.post('/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  try {
    const updatedDelivery = await deliveryService.completeDelivery(id);
    res.json(createSuccessResponse(updatedDelivery));
  } catch (error: any) {
    res.status(404).json(
      createErrorResponse(error.message, undefined, 404)
    );
  }
}));

/**
 * @route POST /api/deliveries/:id/location
 * @desc Update delivery location
 */
router.post('/:id/location', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  try {
    const { latitude, longitude, speed, heading, accuracy, batteryLevel, metadata } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json(
        createErrorResponse('Latitude and longitude are required', undefined, 400)
      );
    }
    
    const updatedDelivery = await deliveryService.updateDeliveryLocation(
      id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      batteryLevel,
      metadata
    );
    
    res.json(createSuccessResponse(updatedDelivery));
  } catch (error: any) {
    res.status(404).json(
      createErrorResponse(error.message, undefined, 404)
    );
  }
}));

/**
 * @route GET /api/deliveries/:id/location-history
 * @desc Get delivery location history
 */
router.get('/:id/location-history', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Check if delivery exists
  const delivery = await deliveryStorage.getById(id);
  if (!delivery) {
    return res.status(404).json(
      createErrorResponse('Delivery not found', undefined, 404)
    );
  }
  
  const locationHistory = await deliveryLocationHistoryStorage.getByDeliveryId(id);
  res.json(createSuccessResponse(locationHistory));
}));

/**
 * @route POST /api/deliveries/:id/simulate
 * @desc Simulate a delivery for testing purposes
 */
router.post('/:id/simulate', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Check if delivery exists
  const delivery = await deliveryStorage.getById(id);
  if (!delivery) {
    return res.status(404).json(
      createErrorResponse('Delivery not found', undefined, 404)
    );
  }
  
  // Start the simulation in the background
  deliveryService.simulateDelivery(id).catch(err => {
    console.error(`Error simulating delivery ${id}:`, err);
  });
  
  res.json(createSuccessResponse({ 
    message: 'Delivery simulation started',
    deliveryId: id
  }));
}));

export default router;