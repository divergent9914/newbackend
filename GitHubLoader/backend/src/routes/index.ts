import { Express, Request, Response, NextFunction } from 'express';
import kitchenRoutes from './kitchens';
import categoryRoutes from './categories';
import productRoutes from './products';
import deliverySlotRoutes from './deliverySlots';
import orderRoutes from './orders';
import authRoutes from './auth';

export function registerRoutes(app: Express) {
  // API Routes
  app.use('/api/kitchens', kitchenRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/delivery-slots', deliverySlotRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/auth', authRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Admin route to calculate daily fee
  app.post('/api/delivery-fee', (req, res) => {
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
  
  // Admin API Routes - these would need authentication middleware in production
  // For dashboard statistics
  // Mock stats for demonstration purposes - in production this would query the database
  
  app.get('/api/admin/dashboard/products', async (req, res) => {
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
  
  // Catch-all error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: err.message || 'Internal server error',
      status: 'error'
    });
  });
}