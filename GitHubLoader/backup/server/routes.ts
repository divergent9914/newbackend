import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertCategorySchema,
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertReviewSchema, 
  insertWishlistSchema 
} from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Categories routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ category });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { featured, categoryId, limit, search } = req.query;
      
      const options: any = {};
      if (featured) options.featured = featured === "true";
      if (categoryId) options.categoryId = parseInt(categoryId as string, 10);
      if (limit) options.limit = parseInt(limit as string, 10);
      if (search) options.search = search as string;

      const products = await storage.getProducts(options);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const products = await storage.getFeaturedProducts(limit);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/new-arrivals", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const products = await storage.getNewArrivals(limit);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch new arrivals" });
    }
  });

  app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId, 10);
      const products = await storage.getProductsByCategoryId(categoryId);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ product });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const cartItems = await storage.getCartItemsByUserId(localUser.id);
      
      // Get product details for each cart item
      const cartWithProducts = await Promise.all(cartItems.map(async (item) => {
        const product = await storage.getProduct(item.product_id);
        return {
          ...item,
          product
        };
      }));

      res.json({ cartItems: cartWithProducts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      // Validate input
      const result = insertCartItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid cart item data" });
      }

      const cartItem = await storage.createCartItem(result.data);
      res.status(201).json({ cartItem });
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItemQuantity(id, quantity);
      res.json({ cartItem });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.clearCart(localUser.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const orders = await storage.getOrdersByUserId(localUser.id);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItemsByOrderId(order.id);
        
        // Get product details for each order item
        const itemsWithProducts = await Promise.all(items.map(async (item) => {
          const product = await storage.getProduct(item.product_id);
          return {
            ...item,
            product
          };
        }));
        
        return {
          ...order,
          items: itemsWithProducts
        };
      }));

      res.json({ orders: ordersWithItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const items = await storage.getOrderItemsByOrderId(orderId);
      
      // Get product details for each order item
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.product_id);
        return {
          ...item,
          product
        };
      }));
      
      res.json({ 
        order: {
          ...order,
          items: itemsWithProducts
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      // Validate input
      const result = insertOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid order data" });
      }

      const { items, ...orderData } = req.body;
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const orderItemResult = insertOrderItemSchema.safeParse({
            ...item,
            order_id: order.id
          });
          
          if (orderItemResult.success) {
            await storage.createOrderItem(orderItemResult.data);
          }
        }
      }
      
      // Clear cart after successful order
      await storage.clearCart(orderData.user_id);
      
      res.status(201).json({ order });
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // User routes - only for internal use, auth is handled by Supabase
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      // Validate input
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(result.data);
      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/me", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: localUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const reviews = await storage.getReviewsByProductId(productId);
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      // Validate input
      const result = insertReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid review data" });
      }

      const review = await storage.createReview(result.data);
      res.status(201).json({ review });
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const wishlistItems = await storage.getWishlistByUserId(localUser.id);
      
      // Get product details for each wishlist item
      const wishlistWithProducts = await Promise.all(wishlistItems.map(async (item) => {
        const product = await storage.getProduct(item.product_id);
        return {
          ...item,
          product
        };
      }));

      res.json({ wishlist: wishlistWithProducts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req: Request, res: Response) => {
    try {
      // Validate input
      const result = insertWishlistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid wishlist data" });
      }

      const wishlistItem = await storage.addToWishlist(result.data);
      res.status(201).json({ wishlistItem });
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", async (req: Request, res: Response) => {
    try {
      // Get user ID from Supabase auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from local storage using supabase ID
      const localUser = await storage.getUserBySupabaseId(user.id);
      if (!localUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const productId = parseInt(req.params.productId, 10);
      await storage.removeFromWishlist(localUser.id, productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from wishlist" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
