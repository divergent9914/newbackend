import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Mock data for demonstration purposes
const mockKitchens = [
  {
    id: 1,
    name: "Aamis Central Kitchen",
    area: "Ganeshguri",
    city: "Guwahati",
    openTime: "10:00 AM",
    closeTime: "10:00 PM",
    isActive: true,
    latitude: "26.1445",
    longitude: "91.7362"
  },
  {
    id: 2,
    name: "Aamis Downtown",
    area: "Zoo Road",
    city: "Guwahati",
    openTime: "9:00 AM",
    closeTime: "11:00 PM",
    isActive: true,
    latitude: "26.1429",
    longitude: "91.7414"
  },
  {
    id: 3,
    name: "Aamis Riverside",
    area: "Uzanbazar",
    city: "Guwahati",
    openTime: "9:30 AM",
    closeTime: "9:30 PM",
    isActive: true,
    latitude: "26.1890",
    longitude: "91.7465"
  }
];

const mockCategories = [
  {
    id: 1,
    name: "Duck & Chicken",
    slug: "duck-chicken",
    description: "Traditional Assamese duck and chicken preparations"
  },
  {
    id: 2,
    name: "Fish Specialties",
    slug: "fish",
    description: "Fresh fish dishes prepared in authentic Assamese style"
  },
  {
    id: 3,
    name: "Pork Dishes",
    slug: "pork",
    description: "Flavorful pork dishes from Assam"
  },
  {
    id: 4,
    name: "Vegetarian",
    slug: "vegetarian",
    description: "Authentic vegetarian options from Assamese cuisine"
  },
  {
    id: 5,
    name: "Rice & Breads",
    slug: "rice-breads",
    description: "Traditional rice and bread selections"
  },
  {
    id: 6,
    name: "Bestseller",
    slug: "bestseller",
    description: "Our most popular dishes"
  },
  {
    id: 7,
    name: "Chef's Special",
    slug: "chef-special",
    description: "Special dishes prepared by our master chef"
  }
];

const mockProducts = [
  {
    id: 1,
    name: "Assamese Duck Curry",
    description: "Traditional duck curry with bamboo shoot and spices",
    price: "320.00",
    categoryId: 1,
    categorySlug: "bestseller",
    imageUrl: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  },
  {
    id: 2,
    name: "Bamboo Shoot Pork",
    description: "Pork cooked with fermented bamboo shoot",
    price: "280.00",
    categoryId: 3,
    categorySlug: "pork",
    imageUrl: "https://images.unsplash.com/photo-1589647363574-f53ef5e5744d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  },
  {
    id: 3,
    name: "Masor Tenga",
    description: "Traditional sour fish curry with tomato and lemon",
    price: "250.00",
    categoryId: 2,
    categorySlug: "chef-special",
    imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  },
  {
    id: 4,
    name: "Khar",
    description: "Traditional starter made with raw papaya and lentils",
    price: "180.00",
    categoryId: 4,
    categorySlug: "vegetarian",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  },
  {
    id: 5,
    name: "Chicken with Ash Gourd",
    description: "Tender chicken pieces cooked with ash gourd",
    price: "260.00",
    categoryId: 1,
    categorySlug: "duck-chicken",
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  },
  {
    id: 6,
    name: "Pabda Fish Curry",
    description: "Delicate pabda fish in a light mustard curry",
    price: "290.00",
    categoryId: 2,
    categorySlug: "fish",
    imageUrl: "https://images.unsplash.com/photo-1518732751612-2c0787ff5684?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    inStock: true,
    kitchenId: 1
  }
];

const mockDeliverySlots = [
  {
    id: 1,
    startTime: new Date().setHours(12, 30, 0),
    endTime: new Date().setHours(13, 0, 0),
    capacity: 10,
    bookedCount: 3,
    kitchenId: 1
  },
  {
    id: 2,
    startTime: new Date().setHours(13, 0, 0),
    endTime: new Date().setHours(13, 30, 0),
    capacity: 10,
    bookedCount: 1,
    kitchenId: 1
  },
  {
    id: 3,
    startTime: new Date().setHours(13, 30, 0),
    endTime: new Date().setHours(14, 0, 0),
    capacity: 10,
    bookedCount: 2,
    kitchenId: 1
  },
  {
    id: 4,
    startTime: new Date().setHours(14, 0, 0),
    endTime: new Date().setHours(14, 30, 0),
    capacity: 10,
    bookedCount: 0,
    kitchenId: 1
  }
];

// Group products by category
const mockProductsByCategory = mockProducts.reduce<Record<number, typeof mockProducts>>((acc, product) => {
  if (product.categoryId) {
    if (!acc[product.categoryId]) {
      acc[product.categoryId] = [];
    }
    acc[product.categoryId].push(product);
  }
  return acc;
}, {});

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const data = req.body;
      
      // Validate input
      const schema = z.object({
        phone: z.string().min(10, "Phone number is required"),
        supabaseUserId: z.string().min(1, "Supabase user ID is required")
      });
      
      const { phone, supabaseUserId } = schema.parse(data);
      
      // Check if user exists
      const existingUser = await storage.getUserByPhone(phone);
      
      if (existingUser) {
        return res.status(200).json({
          user: existingUser,
          token: "mock-token-for-existing-user",
          message: "User logged in successfully"
        });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        phone,
        supabaseUserId,
        name: null,
        email: null,
        address: null
      });
      
      return res.status(201).json({
        user: newUser,
        token: "mock-token-for-new-user",
        message: "User created successfully"
      });
    } catch (error: any) {
      console.error("Auth error:", error);
      return res.status(400).json({ message: error.message || "Authentication failed" });
    }
  });

  // Kitchen routes
  app.get("/api/kitchens", async (req, res) => {
    try {
      const kitchens = await storage.getKitchens();
      res.json(kitchens);
    } catch (error: any) {
      console.error("Error fetching kitchens:", error);
      res.status(500).json({ message: "Error fetching kitchens" });
    }
  });

  app.get("/api/kitchens/:id", async (req, res) => {
    try {
      const kitchenId = parseInt(req.params.id);
      const kitchen = await storage.getKitchen(kitchenId);
      
      if (!kitchen) {
        return res.status(404).json({ message: "Kitchen not found" });
      }
      
      res.json(kitchen);
    } catch (error: any) {
      console.error("Error fetching kitchen:", error);
      res.status(500).json({ message: "Error fetching kitchen" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categorySlug } = req.query;
      
      if (categorySlug && typeof categorySlug === 'string') {
        const filtered = await storage.getProductsByCategorySlug(categorySlug);
        return res.json(filtered);
      }
      
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const featured = products.filter(p => 
        p.categorySlug === "bestseller" || p.categorySlug === "chef-special"
      );
      res.json(featured);
    } catch (error: any) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Error fetching featured products" });
    }
  });

  app.get("/api/products/by-category", async (req, res) => {
    try {
      // Get all products
      const products = await storage.getProducts();
      
      // Get all categories
      const categories = await storage.getCategories();
      
      // Group products by category
      const productsByCategory = categories.reduce<Record<number, typeof products>>((acc, category) => {
        const categoryProducts = products.filter(product => product.categoryId === category.id);
        if (categoryProducts.length > 0) {
          acc[category.id] = categoryProducts;
        }
        return acc;
      }, {});
      
      res.json(productsByCategory);
    } catch (error: any) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Error fetching products by category" });
    }
  });

  app.get("/api/products/related/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get products from the same category
      if (product.categoryId) {
        const categoryProducts = await storage.getProductsByCategory(product.categoryId);
        const related = categoryProducts.filter(p => p.id !== productId);
        return res.json(related);
      }
      
      // If no category, return empty array
      res.json([]);
    } catch (error: any) {
      console.error("Error fetching related products:", error);
      res.status(500).json({ message: "Error fetching related products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Delivery slot routes
  app.get("/api/delivery-slots", async (req, res) => {
    try {
      const { date, kitchenId } = req.query;
      
      // If kitchen ID is provided, get slots for that kitchen
      if (kitchenId && typeof kitchenId === 'string') {
        const kitchenIdNum = parseInt(kitchenId);
        const slots = await storage.getDeliverySlotsByKitchen(kitchenIdNum);
        return res.json(slots);
      }
      
      // Otherwise get all slots
      const slots = await storage.getDeliverySlots();
      res.json(slots);
    } catch (error: any) {
      console.error("Error fetching delivery slots:", error);
      res.status(500).json({ message: "Error fetching delivery slots" });
    }
  });

  // Delivery fee calculation
  app.post("/api/delivery-fee", (req, res) => {
    try {
      // Validate input
      const schema = z.object({
        distance: z.number().min(0),
        orderValue: z.number().min(0),
        hasSubscription: z.boolean().optional().default(false)
      });

      const { distance, orderValue, hasSubscription } = schema.parse(req.body);

      // Constants for fee calculation
      const baseFreeRadius = 1;
      const platformFee = 2;
      const zones = [
        { max: 3, fee: 25 },
        { max: 5, fee: 40 },
        { max: 8, fee: 60 },
        { max: 12, fee: 75 },
        { max: Infinity, fee: 75 },
      ];

      // Calculate delivery fee
      let fee = 0;
      if (distance > baseFreeRadius) {
        if (hasSubscription && distance <= 5) {
          fee = 0;
        } else if (orderValue >= 500) {
          fee = distance <= 5 ? 0 : 45;
        } else if (orderValue >= 300) {
          fee = distance <= 5 ? 15 : 50;
        } else {
          const zone = zones.find(z => distance <= z.max);
          fee = zone ? zone.fee : zones[zones.length - 1].fee;
        }
      }

      const deliveryFee = fee + platformFee;
      
      res.status(200).json({ deliveryFee });
    } catch (error: any) {
      console.error("Delivery fee calculation error:", error);
      res.status(400).json({ message: error.message || "Failed to calculate delivery fee" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      
      // Validate order data
      const orderSchema = z.object({
        kitchenId: z.number(),
        orderMode: z.string(),
        deliverySlotId: z.number().nullable(),
        deliveryAddress: z.string().nullable(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          notes: z.string().optional()
        })),
        subtotal: z.string(),
        deliveryFee: z.string(),
        serviceFee: z.string(),
        total: z.string()
      });
      
      const validatedData = orderSchema.parse(orderData);
      
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
  
  // Admin API Routes
  
  // Admin Dashboard Stats
  app.get("/api/admin/dashboard/orders", (req, res) => {
    // Mock dashboard stats for orders
    const orderStats = {
      total: 245,
      pending: 18,
      delivered: 203,
      cancelled: 24,
      percentChange: 12.5
    };
    res.json(orderStats);
  });
  
  app.get("/api/admin/dashboard/revenue", (req, res) => {
    // Mock dashboard stats for revenue
    const revenueStats = {
      total: "₹86,400",
      today: "₹4,350",
      thisWeek: "₹28,760",
      percentChange: 8.2
    };
    res.json(revenueStats);
  });
  
  app.get("/api/admin/dashboard/products", async (req, res) => {
    try {
      // Get real product data from database
      const products = await storage.getProducts();
      
      const productStats = {
        total: products.length,
        inStock: products.filter(p => p.inStock).length,
        lowStock: 4, // This would ideally be determined by some inventory logic
        outOfStock: products.filter(p => !p.inStock).length,
        percentChange: -2.4 // This would be calculated based on historical data
      };
      
      res.json(productStats);
    } catch (error: any) {
      console.error("Error fetching product stats:", error);
      res.status(500).json({ message: "Error fetching product stats" });
    }
  });
  
  app.get("/api/admin/dashboard/customers", (req, res) => {
    // Mock dashboard stats for customers
    const customerStats = {
      total: 476,
      newToday: 12,
      newThisWeek: 54,
      percentChange: 14.3
    };
    res.json(customerStats);
  });
  
  // Admin Orders API
  app.get("/api/admin/orders", (req, res) => {
    // Mock orders list for admin
    const orders = [
      {
        id: 1,
        userId: 123,
        kitchenId: 1,
        orderMode: "delivery",
        orderStatus: "pending",
        deliverySlotId: 1,
        deliveryAddress: "123 Main St, Guwahati, Assam 781005",
        subtotal: "560.00",
        deliveryFee: "40.00",
        serviceFee: "20.00",
        total: "620.00",
        createdAt: "2023-04-25T14:30:00Z",
        kitchen: mockKitchens.find(k => k.id === 1),
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            quantity: 1,
            price: "320.00",
            product: mockProducts.find(p => p.id === 1)
          },
          {
            id: 2,
            orderId: 1,
            productId: 4,
            quantity: 2,
            price: "180.00",
            product: mockProducts.find(p => p.id === 4)
          }
        ]
      },
      {
        id: 2,
        userId: 124,
        kitchenId: 1,
        orderMode: "takeaway",
        orderStatus: "confirmed",
        subtotal: "280.00",
        deliveryFee: "0.00",
        serviceFee: "10.00",
        total: "290.00",
        createdAt: "2023-04-25T14:30:00Z",
        kitchen: mockKitchens.find(k => k.id === 1),
        items: [
          {
            id: 3,
            orderId: 2,
            productId: 2,
            quantity: 1,
            price: "280.00",
            product: mockProducts.find(p => p.id === 2)
          }
        ]
      },
      {
        id: 3,
        userId: 125,
        kitchenId: 2,
        orderMode: "delivery",
        orderStatus: "cooking",
        deliverySlotId: 2,
        deliveryAddress: "456 Park Ave, Guwahati, Assam 781006",
        subtotal: "760.00",
        deliveryFee: "50.00",
        serviceFee: "30.00",
        total: "840.00",
        createdAt: "2023-04-25T15:15:00Z",
        kitchen: mockKitchens.find(k => k.id === 2),
        items: [
          {
            id: 4,
            orderId: 3,
            productId: 1,
            quantity: 2,
            price: "320.00",
            product: mockProducts.find(p => p.id === 1)
          },
          {
            id: 5,
            orderId: 3,
            productId: 2,
            quantity: 1,
            price: "280.00",
            product: mockProducts.find(p => p.id === 2)
          }
        ]
      }
    ];
    
    res.json({ orders });
  });
  
  app.get("/api/admin/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    
    // Mock order detail
    const order = {
      id: orderId,
      userId: 123,
      kitchenId: 1,
      orderMode: "delivery",
      orderStatus: "confirmed",
      deliverySlotId: 1,
      deliveryAddress: "123 Main St, Ganeshguri, Guwahati, Assam 781005",
      subtotal: "560.00",
      deliveryFee: "40.00",
      serviceFee: "20.00",
      total: "620.00",
      createdAt: "2023-04-25T14:30:00Z",
      user: {
        id: 123,
        name: "Rahul Sharma",
        phone: "+91 9876543210",
        email: "rahul.sharma@example.com"
      },
      kitchen: mockKitchens.find(k => k.id === 1),
      deliverySlot: mockDeliverySlots.find(slot => slot.id === 1),
      items: [
        {
          id: 1,
          orderId: orderId,
          productId: 1,
          quantity: 1,
          price: "320.00",
          notes: "Extra spicy",
          product: mockProducts.find(p => p.id === 1)
        },
        {
          id: 2,
          orderId: orderId,
          productId: 4,
          quantity: 2,
          price: "180.00",
          product: mockProducts.find(p => p.id === 4)
        }
      ],
      timeline: [
        { status: "pending", timestamp: "2023-04-25T14:30:00Z" },
        { status: "confirmed", timestamp: "2023-04-25T14:35:00Z" }
      ]
    };
    
    res.json(order);
  });

  const httpServer = createServer(app);

  return httpServer;
}
