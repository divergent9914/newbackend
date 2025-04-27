import express, { Request, Response } from 'express';
import { productStorage, categoryStorage } from './storage';
import { 
  productInsertSchema, 
  categoryInsertSchema 
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

// Product routes
/**
 * @route GET /api/products
 * @desc Get all products or search by query
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { query, category } = req.query;
  
  // If query parameter is provided, search products
  if (query && typeof query === 'string') {
    const products = await productStorage.search(query);
    return res.json(createSuccessResponse(products));
  }
  
  // If category parameter is provided, filter by category
  if (category && typeof category === 'string') {
    // Check if category is a number (ID) or string (slug)
    const categoryId = parseInt(category);
    
    if (!isNaN(categoryId)) {
      const products = await productStorage.getByCategoryId(categoryId);
      return res.json(createSuccessResponse(products));
    } else {
      // Get category by slug
      const categoryObj = await categoryStorage.getBySlug(category);
      if (!categoryObj) {
        return res.status(404).json(
          createErrorResponse('Category not found', undefined, 404)
        );
      }
      
      const products = await productStorage.getByCategoryId(categoryObj.id);
      return res.json(createSuccessResponse(products));
    }
  }
  
  // Otherwise, get all products
  const products = await productStorage.getAll();
  res.json(createSuccessResponse(products));
}));

/**
 * @route GET /api/products/:id
 * @desc Get a product by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const product = await productStorage.getById(id);
  
  if (!product) {
    return res.status(404).json(
      createErrorResponse('Product not found', undefined, 404)
    );
  }
  
  res.json(createSuccessResponse(product));
}));

/**
 * @route POST /api/products
 * @desc Create a new product
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const productData = productInsertSchema.parse(req.body);
    
    // If categoryId is provided, check if it exists
    if (productData.categoryId) {
      const category = await categoryStorage.getById(productData.categoryId);
      if (!category) {
        return res.status(404).json(
          createErrorResponse('Category not found', undefined, 404)
        );
      }
    }
    
    const newProduct = await productStorage.create(productData);
    
    // Publish product created event
    eventBroker.publish(EventType.PRODUCT_CREATED, newProduct);
    
    res.status(201).json(createSuccessResponse(newProduct));
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
 * @route PUT /api/products/:id
 * @desc Update a product
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const productData = productInsertSchema.partial().parse(req.body);
    
    // If categoryId is provided, check if it exists
    if (productData.categoryId) {
      const category = await categoryStorage.getById(productData.categoryId);
      if (!category) {
        return res.status(404).json(
          createErrorResponse('Category not found', undefined, 404)
        );
      }
    }
    
    const updatedProduct = await productStorage.update(id, productData);
    
    if (!updatedProduct) {
      return res.status(404).json(
        createErrorResponse('Product not found', undefined, 404)
      );
    }
    
    // Publish product updated event
    eventBroker.publish(EventType.PRODUCT_UPDATED, updatedProduct);
    
    // If stock changed, publish stock changed event
    if (productData.stock !== undefined) {
      eventBroker.publish(EventType.PRODUCT_STOCK_CHANGED, {
        productId: updatedProduct.id,
        stock: updatedProduct.stock
      });
    }
    
    res.json(createSuccessResponse(updatedProduct));
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
 * @route DELETE /api/products/:id
 * @desc Delete a product
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Get the product before deletion for the event
  const product = await productStorage.getById(id);
  if (!product) {
    return res.status(404).json(
      createErrorResponse('Product not found', undefined, 404)
    );
  }
  
  const success = await productStorage.delete(id);
  
  if (success) {
    // Publish product deleted event
    eventBroker.publish(EventType.PRODUCT_DELETED, product);
    
    return res.json(
      createSuccessResponse({ success: true }, 'Product deleted successfully')
    );
  }
  
  res.status(500).json(
    createErrorResponse('Failed to delete product', undefined, 500)
  );
}));

// Category routes
/**
 * @route GET /api/categories
 * @desc Get all categories
 */
router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryStorage.getAll();
  res.json(createSuccessResponse(categories));
}));

/**
 * @route GET /api/categories/:id
 * @desc Get a category by ID
 */
router.get('/categories/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const category = await categoryStorage.getById(id);
  
  if (!category) {
    return res.status(404).json(
      createErrorResponse('Category not found', undefined, 404)
    );
  }
  
  res.json(createSuccessResponse(category));
}));

/**
 * @route GET /api/categories/slug/:slug
 * @desc Get a category by slug
 */
router.get('/categories/slug/:slug', asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const category = await categoryStorage.getBySlug(slug);
  
  if (!category) {
    return res.status(404).json(
      createErrorResponse('Category not found', undefined, 404)
    );
  }
  
  res.json(createSuccessResponse(category));
}));

/**
 * @route POST /api/categories
 * @desc Create a new category
 */
router.post('/categories', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const categoryData = categoryInsertSchema.parse(req.body);
    
    // Check if slug already exists
    const existingCategory = await categoryStorage.getBySlug(categoryData.slug);
    if (existingCategory) {
      return res.status(409).json(
        createErrorResponse('Category slug already exists', undefined, 409)
      );
    }
    
    const newCategory = await categoryStorage.create(categoryData);
    
    res.status(201).json(createSuccessResponse(newCategory));
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
 * @route PUT /api/categories/:id
 * @desc Update a category
 */
router.put('/categories/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = validateId(req.params.id);
    const categoryData = categoryInsertSchema.partial().parse(req.body);
    
    // If slug is provided, check if it already exists
    if (categoryData.slug) {
      const existingCategory = await categoryStorage.getBySlug(categoryData.slug);
      if (existingCategory && existingCategory.id !== id) {
        return res.status(409).json(
          createErrorResponse('Category slug already exists', undefined, 409)
        );
      }
    }
    
    const updatedCategory = await categoryStorage.update(id, categoryData);
    
    if (!updatedCategory) {
      return res.status(404).json(
        createErrorResponse('Category not found', undefined, 404)
      );
    }
    
    res.json(createSuccessResponse(updatedCategory));
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
 * @route DELETE /api/categories/:id
 * @desc Delete a category
 */
router.delete('/categories/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  
  // Check if the category has associated products
  const products = await productStorage.getByCategoryId(id);
  if (products.length > 0) {
    return res.status(409).json(
      createErrorResponse(
        'Cannot delete category because it has associated products', 
        { productCount: products.length },
        409
      )
    );
  }
  
  // Get the category before deletion
  const category = await categoryStorage.getById(id);
  if (!category) {
    return res.status(404).json(
      createErrorResponse('Category not found', undefined, 404)
    );
  }
  
  const success = await categoryStorage.delete(id);
  
  if (success) {
    return res.json(
      createSuccessResponse({ success: true }, 'Category deleted successfully')
    );
  }
  
  res.status(500).json(
    createErrorResponse('Failed to delete category', undefined, 500)
  );
}));

export default router;