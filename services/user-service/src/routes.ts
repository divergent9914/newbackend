import express, { Request, Response } from 'express';
import { userStorage } from './storage';
import { 
  userInsertSchema, 
  loginSchema, 
  createUserSchema 
} from '../../shared/schema';
import { 
  asyncHandler, 
  createSuccessResponse, 
  createErrorResponse, 
  validateId 
} from '../../shared/utils';
import { eventBroker, EventType } from '../../shared/event-broker';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import config from '../../shared/config';

// Create router
const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const users = await userStorage.getAll();
  res.json(createSuccessResponse(users));
}));

/**
 * @route GET /api/users/:id
 * @desc Get a user by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const user = await userStorage.getById(id);
  
  if (!user) {
    return res.status(404).json(createErrorResponse('User not found', undefined, 404));
  }
  
  res.json(createSuccessResponse(user));
}));

/**
 * @route POST /api/users
 * @desc Create a new user
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const userData = createUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await userStorage.getByUsername(userData.username);
    if (existingUser) {
      return res.status(409).json(
        createErrorResponse('Username already exists', undefined, 409)
      );
    }
    
    // Create user (excluding confirmPassword which is only for validation)
    const { confirmPassword, ...userInsertData } = userData;
    const newUser = await userStorage.create(userInsertData);
    
    // Publish user created event
    eventBroker.publish(EventType.USER_CREATED, newUser);
    
    res.status(201).json(createSuccessResponse(newUser));
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
 * @route PUT /api/users/:id
 * @desc Update a user
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const userData = userInsertSchema.partial().parse(req.body);
    
    const updatedUser = await userStorage.update(id, userData);
    
    if (!updatedUser) {
      return res.status(404).json(
        createErrorResponse('User not found', undefined, 404)
      );
    }
    
    // Publish user updated event
    eventBroker.publish(EventType.USER_UPDATED, updatedUser);
    
    res.json(createSuccessResponse(updatedUser));
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
 * @route DELETE /api/users/:id
 * @desc Delete a user
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Get the user before deletion for the event
  const user = await userStorage.getById(id);
  if (!user) {
    return res.status(404).json(
      createErrorResponse('User not found', undefined, 404)
    );
  }
  
  const success = await userStorage.delete(id);
  
  if (success) {
    // Publish user deleted event
    eventBroker.publish(EventType.USER_DELETED, user);
    
    return res.json(
      createSuccessResponse({ success: true }, 'User deleted successfully')
    );
  }
  
  res.status(500).json(
    createErrorResponse('Failed to delete user', undefined, 500)
  );
}));

/**
 * @route POST /api/users/login
 * @desc Authenticate a user and return a token
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const credentials = loginSchema.parse(req.body);
    
    const user = await userStorage.authenticate(
      credentials.username, 
      credentials.password
    );
    
    if (!user) {
      return res.status(401).json(
        createErrorResponse('Invalid credentials', undefined, 401)
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.auth.jwtSecret,
      { expiresIn: config.auth.expiresIn }
    );
    
    res.json(createSuccessResponse({ user, token }));
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