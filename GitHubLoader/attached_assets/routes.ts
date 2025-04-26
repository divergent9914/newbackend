import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { 
  users, 
  kitchens, 
  categories, 
  products, 
  deliverySlots, 
  orders, 
  orderItems,
  otpVerifications,
  phoneSchema,
  verifyOtpSchema,
  createOrderSchema
} from "@shared/schema";
import { eq, gte, and, desc } from "drizzle-orm";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createClient } from "@supabase/supabase-js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create Supabase client for auth
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // API prefix
  const apiPrefix = "/api";

  // Helper function to generate OTP
  function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper function to send OTP (in a real application, use a real SMS service)
  async function sendOTP(phone: string, otp: string): Promise<boolean> {
    // In a real application, this would send an SMS
    console.log(`Sending OTP ${otp} to ${phone}`);
    return true;
  }

  // Authentication endpoints
  app.post(`${apiPrefix}/auth/send-otp`, async (req, res) => {
    try {
      const { phone } = phoneSchema.parse(req.body);
      
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
      
      // Store OTP in database
      await db.delete(otpVerifications).where(eq(otpVerifications.phone, phone));
      await db.insert(otpVerifications).values({
        phone,
        otp,
        expiresAt,
      });
      
      // Send OTP to user
      await sendOTP(phone, otp);
      
      return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error sending OTP:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/auth/verify-otp`, async (req, res) => {
    try {
      const { phone, otp } = verifyOtpSchema.parse(req.body);
      
      // Find OTP in database
      const verification = await db.query.otpVerifications.findFirst({
        where: and(
          eq(otpVerifications.phone, phone),
          eq(otpVerifications.otp, otp),
          gte(otpVerifications.expiresAt, new Date())
        ),
      });
      
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      
      // Delete used OTP
      await db.delete(otpVerifications).where(eq(otpVerifications.id, verification.id));
      
      // Check if user exists, create if not
      let user = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      });
      
      if (!user) {
        const [newUser] = await db.insert(users).values({ phone }).returning();
        user = newUser;
      }
      
      // Create session with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${phone}@aamis.app`,
        password: phone, // In a real app, use a secure method
      });
      
      if (error) {
        // If user doesn't exist in Supabase, create one
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${phone}@aamis.app`,
          password: phone,
          options: {
            data: {
              phone,
              userId: user.id,
            },
          },
        });
        
        if (signUpError) {
          return res.status(500).json({ error: "Authentication failed" });
        }
        
        return res.status(200).json({ 
          user, 
          token: signUpData.session?.access_token,
          message: "Account created and authenticated" 
        });
      }
      
      return res.status(200).json({ 
        user, 
        token: data.session?.access_token,
        message: "Authentication successful" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Kitchen endpoints
  app.get(`${apiPrefix}/kitchens`, async (req, res) => {
    try {
      const allKitchens = await db.query.kitchens.findMany({
        where: eq(kitchens.isActive, true),
      });
      return res.status(200).json(allKitchens);
    } catch (error) {
      console.error("Error fetching kitchens:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Categories endpoints
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const allCategories = await db.query.categories.findMany();
      return res.status(200).json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Products endpoints
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const { kitchenId, categorySlug } = req.query;
      
      let query = db.select().from(products);
      
      if (kitchenId) {
        query = query.where(eq(products.kitchenId, Number(kitchenId)));
      }
      
      if (categorySlug) {
        query = query.where(eq(products.categorySlug, String(categorySlug)));
      }
      
      const allProducts = await query;
      return res.status(200).json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delivery slots endpoints
  app.get(`${apiPrefix}/delivery-slots`, async (req, res) => {
    try {
      const { kitchenId } = req.query;
      
      const now = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
      
      let query = db.select().from(deliverySlots)
        .where(and(
          gte(deliverySlots.startTime, now)
        ))
        .orderBy(deliverySlots.startTime);
      
      if (kitchenId) {
        query = query.where(eq(deliverySlots.kitchenId, Number(kitchenId)));
      }
      
      const slots = await query;
      return res.status(200).json(slots);
    } catch (error) {
      console.error("Error fetching delivery slots:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Orders endpoints
  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const orderData = createOrderSchema.parse(req.body);
      
      // Get auth token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Get user ID from metadata
      const userId = user.user_metadata.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Calculate order totals
      let subtotal = 0;
      const productIds = orderData.items.map(item => item.productId);
      
      // Fetch products to get their prices
      const productsData = await db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, productIds)
      });
      
      // Create a map for easy lookup
      const productMap = new Map(productsData.map(p => [p.id, p]));
      
      // Calculate subtotal
      for (const item of orderData.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
        }
        subtotal += Number(product.price) * item.quantity;
      }
      
      // Add fees
      const deliveryFee = orderData.orderMode === "delivery" ? 49 : 0;
      const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
      const total = subtotal + deliveryFee + serviceFee;
      
      // Start a transaction
      const orderResult = await db.transaction(async (tx) => {
        // Create order
        const [order] = await tx.insert(orders).values({
          userId: userId as unknown as number,
          kitchenId: orderData.kitchenId,
          orderMode: orderData.orderMode,
          deliverySlotId: orderData.deliverySlotId,
          deliveryAddress: orderData.deliveryAddress,
          subtotal: subtotal.toString(),
          deliveryFee: deliveryFee.toString(),
          serviceFee: serviceFee.toString(),
          total: total.toString(),
        }).returning();
        
        // Create order items
        const orderItemsData = orderData.items.map(item => {
          const product = productMap.get(item.productId)!;
          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price.toString(),
            notes: item.notes || null,
          };
        });
        
        await tx.insert(orderItems).values(orderItemsData);
        
        // If there's a delivery slot, update its booked count
        if (orderData.deliverySlotId) {
          await tx.update(deliverySlots)
            .set({ 
              bookedCount: (slot) => `${slot.bookedCount} + 1` 
            })
            .where(eq(deliverySlots.id, orderData.deliverySlotId));
        }
        
        return order;
      });
      
      return res.status(201).json({
        success: true,
        order: orderResult,
        message: "Order placed successfully"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get(`${apiPrefix}/orders`, async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Get user ID from metadata
      const userId = user.user_metadata.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Fetch user's orders
      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId as unknown as number),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: {
            with: {
              product: true
            }
          },
          kitchen: true,
          deliverySlot: true
        }
      });
      
      return res.status(200).json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
