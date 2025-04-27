import express, { Router } from 'express';
// Define Request and Response types to avoid ESM compatibility issues
type Request = any;
type Response = any;
type NextFunction = any;
import { storage } from './storage';
import { supabase, testSupabaseConnection } from './supabase';
import { testConnection } from './db';
import { Server as SocketIOServer } from 'socket.io';
import { 
  loginSchema, 
  productInsertSchema, 
  orderInsertSchema, 
  orderItemInsertSchema,
  paymentInsertSchema,
  deliveryInsertSchema,
  apiRouteInsertSchema,
  ondcIntegrationInsertSchema,
  serviceMetricInsertSchema,
  deliveryLocationHistoryInsertSchema,
  Order
} from '../shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: any, io?: SocketIOServer) {
  const router = Router();
  
  // Set up WebSocket connection handlers if io is provided
  if (io) {
    io.on('connection', (socket) => {
      console.log('New client connected');
      
      // Join a delivery tracking room for a specific order
      socket.on('joinDeliveryTracking', (deliveryId: number) => {
        socket.join(`delivery:${deliveryId}`);
        console.log(`Client joined delivery tracking for delivery ID: ${deliveryId}`);
      });
      
      // Handle delivery agent location updates
      socket.on('updateDeliveryLocation', async (data: { 
        deliveryId: number, 
        latitude: string, 
        longitude: string,
        speed?: number,
        heading?: number,
        accuracy?: number,
        batteryLevel?: number,
        metadata?: any
      }) => {
        try {
          // Save location to history
          const locationHistory = await storage.createDeliveryLocationHistory({
            deliveryId: data.deliveryId,
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
            heading: data.heading,
            accuracy: data.accuracy,
            batteryLevel: data.batteryLevel,
            metadata: data.metadata
          });
          
          // Update current location in delivery
          await storage.updateDelivery(data.deliveryId, {
            currentLat: data.latitude,
            currentLng: data.longitude,
            lastLocationUpdateTime: new Date()
          });
          
          // Broadcast to all clients tracking this delivery
          io.to(`delivery:${data.deliveryId}`).emit('deliveryLocationUpdated', {
            deliveryId: data.deliveryId,
            location: {
              lat: data.latitude,
              lng: data.longitude
            },
            timestamp: locationHistory.timestamp,
            speed: data.speed,
            heading: data.heading
          });
          
        } catch (error) {
          console.error('Error updating delivery location:', error);
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  // Status endpoint
  router.get('/status', async (req: Request, res: Response) => {
    const dbStatus = await testConnection();
    const supabaseStatus = await testSupabaseConnection();
    
    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      dbConnected: dbStatus.connected,
      supabaseConnected: supabaseStatus.connected
    });
  });

  // Authentication routes
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // In a real app, you would use proper password hashing and JWT tokens
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        },
        token: 'sample-jwt-token' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Products API
  router.get('/products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  router.get('/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Get category slug from categoryId (in real application should use a category lookup)
      const categoryMap: Record<number, string> = {
        1: 'main-course',
        2: 'starters',
        3: 'desserts',
        4: 'beverages'
      };
      const categorySlug = product.categoryId ? categoryMap[product.categoryId] || 'uncategorized' : 'uncategorized';
      
      // Transform product for frontend with the needed fields
      const transformedProduct = {
        ...product,
        // Add placeholder image if none exists
        imageUrl: product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`,
        // Default to true if stock > 0, or if stock is null
        isAvailable: product.stock === null ? true : product.stock > 0,
        // Add category slug
        categorySlug,
        // Add additional fields needed by frontend
        isVeg: product.id % 2 === 0, // Just for demo purposes, alternate products
        weight: product.sku ? `${(product.id * 100) % 1000}g` : null, // Example weight based on id
        // Ensure price is a number
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        // Additional details for product page
        ingredients: "Water, Whole Grain Wheat Flour, Enriched Flour, Vegetable Oil, Cane Sugar, Leavening, Salt",
        nutritionInfo: "Calories: 120, Fat: 3g, Sodium: 160mg, Carbs: 22g, Protein: 3g"
      };
      
      res.json(transformedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  router.post('/products', async (req: Request, res: Response) => {
    try {
      const productData = productInsertSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  router.put('/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const productData = productInsertSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  router.delete('/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Orders API
  router.get('/orders', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const orders = await storage.getOrdersByUser(userId);
        return res.json(orders);
      } else {
        // For admin endpoints, you would return all orders
        return res.status(400).json({ error: 'userId parameter is required' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const items = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        items
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  router.post('/orders', async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const orderData = orderInsertSchema.parse(order);
      
      // Create the order
      const newOrder = await storage.createOrder(orderData);
      
      // Process order items if provided
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          });
        }
      }
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  router.put('/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = orderInsertSchema.partial().parse(req.body);
      
      const updatedOrder = await storage.updateOrder(id, orderData);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // API Routes management for ONDC integration
  router.get('/api-routes', async (req: Request, res: Response) => {
    try {
      const routes = await storage.getApiRoutes();
      res.json(routes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch API routes' });
    }
  });

  router.post('/api-routes', async (req: Request, res: Response) => {
    try {
      const routeData = apiRouteInsertSchema.parse(req.body);
      const newRoute = await storage.createApiRoute(routeData);
      res.status(201).json(newRoute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create API route' });
    }
  });

  // GitHub Loader routes
  router.post('/github/repos', async (req: Request, res: Response) => {
    try {
      const { owner, repo, path = '', branch = 'master' } = req.body;
      
      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }
      
      // Connect to GitHub API
      // This would typically use the GitHub API client with proper auth
      // For now, we'll just make a basic fetch request
      
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      
      // Check if we have a GitHub token for authentication
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `GitHub API error: ${response.statusText}` 
        });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('GitHub API error:', error);
      res.status(500).json({ error: 'Failed to fetch GitHub repository data' });
    }
  });

  // Supabase Import routes
  router.post('/supabase/import', async (req: Request, res: Response) => {
    try {
      const { table, data } = req.body;
      
      if (!table || !Array.isArray(data)) {
        return res.status(400).json({ 
          error: 'Table name and data array are required' 
        });
      }
      
      // Use Supabase client to import data
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        console.error('Supabase import error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({
        success: true,
        imported: data.length,
        result
      });
    } catch (error) {
      console.error('Supabase import error:', error);
      res.status(500).json({ error: 'Failed to import data to Supabase' });
    }
  });

  // ONDC Integration routes
  // Integration routes for ONDC protocol management
  router.get('/ondc/integrations', async (req: Request, res: Response) => {
    try {
      const integrations = await storage.getOndcIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch ONDC integrations' });
    }
  });

  router.get('/ondc/integrations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const integration = await storage.getOndcIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ error: 'ONDC integration not found' });
      }
      
      res.json(integration);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch ONDC integration' });
    }
  });

  router.post('/ondc/integrations', async (req: Request, res: Response) => {
    try {
      const integrationData = ondcIntegrationInsertSchema.parse(req.body);
      const newIntegration = await storage.createOndcIntegration(integrationData);
      res.status(201).json(newIntegration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create ONDC integration' });
    }
  });

  router.put('/ondc/integrations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const integrationData = ondcIntegrationInsertSchema.partial().parse(req.body);
      
      const updatedIntegration = await storage.updateOndcIntegration(id, integrationData);
      
      if (!updatedIntegration) {
        return res.status(404).json({ error: 'ONDC integration not found' });
      }
      
      res.json(updatedIntegration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to update ONDC integration' });
    }
  });

  // Service Metrics routes for monitoring
  router.get('/service-metrics', async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getServiceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch service metrics' });
    }
  });

  router.post('/service-metrics', async (req: Request, res: Response) => {
    try {
      const metricData = serviceMetricInsertSchema.parse(req.body);
      const newMetric = await storage.createServiceMetric(metricData);
      res.status(201).json(newMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create service metric' });
    }
  });
  
  // ONDC Protocol Implementation endpoints
  router.post('/ondc/search', (req: Request, res: Response) => {
    try {
      const { context, message } = req.body;

      // Validate required fields for search
      if (!context || !context.domain || !context.action) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'Required fields missing: context.domain and context.action are required'
        });
      }

      // Log the search request
      console.log('ONDC search request:', JSON.stringify(req.body, null, 2));

      // Sample response for search
      res.json({
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          message_id: `${Date.now()}-search`,
          transaction_id: `tr-${Date.now()}`
        },
        message: {
          catalog: {
            "bpp/descriptor": {
              name: "Sample Marketplace"
            },
            "bpp/providers": [
              {
                id: "provider-1",
                descriptor: {
                  name: "Sample Store"
                },
                items: [
                  {
                    id: "10001",
                    descriptor: {
                      name: "Organic Apples",
                      short_desc: "Fresh organic apples",
                      long_desc: "Freshly harvested organic apples from local farms"
                    },
                    price: {
                      currency: "INR",
                      value: "150.00"
                    },
                    quantity: {
                      available: {
                        count: 50
                      }
                    }
                  },
                  {
                    id: "10002",
                    descriptor: {
                      name: "Bananas",
                      short_desc: "Fresh bananas",
                      long_desc: "Freshly harvested bananas from local farms"
                    },
                    price: {
                      currency: "INR",
                      value: "40.00"
                    },
                    quantity: {
                      available: {
                        count: 100
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      });
    } catch (error) {
      console.error('ONDC search error:', error);
      res.status(500).json({ error: 'Internal server error processing ONDC search request' });
    }
  });

  router.post('/ondc/select', (req: Request, res: Response) => {
    try {
      const { context, message } = req.body;

      // Validate required fields for select
      if (!context || !message || !message.order || !message.order.items) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'Required fields missing: context, message.order.items'
        });
      }

      // Log the select request
      console.log('ONDC select request:', JSON.stringify(req.body, null, 2));

      // Sample response for select
      res.json({
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          message_id: `${Date.now()}-select`,
          transaction_id: `tr-${Date.now()}`
        },
        message: {
          order: {
            provider: {
              id: "provider-1",
              descriptor: {
                name: "Sample Store"
              }
            },
            items: message.order.items.map((item: any) => ({
              id: item.id,
              descriptor: {
                name: item.id === "10001" ? "Organic Apples" : "Bananas",
                short_desc: item.id === "10001" ? "Fresh organic apples" : "Fresh bananas"
              },
              price: {
                currency: "INR",
                value: item.id === "10001" ? "150.00" : "40.00"
              },
              quantity: {
                selected: {
                  count: item.quantity.count
                }
              }
            })),
            quote: {
              price: {
                currency: "INR",
                value: calculateTotal(message.order.items).toString()
              },
              breakup: [
                {
                  title: "Item Total",
                  price: {
                    currency: "INR",
                    value: calculateTotal(message.order.items).toString()
                  }
                },
                {
                  title: "Delivery Charges",
                  price: {
                    currency: "INR",
                    value: "40.00"
                  }
                }
              ],
              ttl: "P1D"
            }
          }
        }
      });
    } catch (error) {
      console.error('ONDC select error:', error);
      res.status(500).json({ error: 'Internal server error processing ONDC select request' });
    }
  });

  router.post('/ondc/init', (req: Request, res: Response) => {
    try {
      const { context, message } = req.body;

      // Validate required fields for init
      if (!context || !message || !message.order) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'Required fields missing: context, message.order'
        });
      }

      // Log the init request
      console.log('ONDC init request:', JSON.stringify(req.body, null, 2));

      // Sample response for init
      res.json({
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          message_id: `${Date.now()}-init`,
          transaction_id: `tr-${Date.now()}`
        },
        message: {
          order: {
            provider: {
              id: "provider-1",
              descriptor: {
                name: "Sample Store"
              }
            },
            items: message.order.items,
            billing: message.order.billing,
            fulfillment: {
              ...message.order.fulfillment,
              state: {
                descriptor: {
                  code: "Pending"
                }
              },
              tracking: true,
              start: {
                location: {
                  descriptor: {
                    name: "Sample Store Warehouse"
                  },
                  address: {
                    locality: "Sample Locality",
                    city: "Sample City",
                    country: "India"
                  }
                }
              },
              end: message.order.fulfillment.end
            },
            quote: {
              price: {
                currency: "INR",
                value: calculateTotal(message.order.items).toString()
              },
              breakup: [
                {
                  title: "Item Total",
                  price: {
                    currency: "INR",
                    value: calculateTotal(message.order.items).toString()
                  }
                },
                {
                  title: "Delivery Charges",
                  price: {
                    currency: "INR",
                    value: "40.00"
                  }
                }
              ],
              ttl: "P1D"
            },
            payment: {
              type: "ON-ORDER",
              status: "NOT-PAID"
            }
          }
        }
      });
    } catch (error) {
      console.error('ONDC init error:', error);
      res.status(500).json({ error: 'Internal server error processing ONDC init request' });
    }
  });

  router.post('/ondc/confirm', async (req: Request, res: Response) => {
    try {
      const { context, message } = req.body;

      // Validate required fields for confirm
      if (!context || !message || !message.order) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'Required fields missing: context, message.order'
        });
      }

      // Log the confirm request
      console.log('ONDC confirm request:', JSON.stringify(req.body, null, 2));
      
      // Extract order information
      const orderData = {
        userId: 1, // In a real implementation, this would come from a logged-in user
        address: message.order.billing?.address?.door || 'Default Address',
        paymentMethod: message.order.payment?.type || 'ON-ORDER'
      };
      
      // Extract items
      const items = message.order.items.map((item: any) => ({
        productId: parseInt(item.id),
        quantity: item.quantity?.selected?.count || 1,
        unitPrice: parseFloat(item.price?.value || "0")
      }));
      
      // Create order in our system using the ONDC helper
      const newOrder = await createOndcOrder(orderData, items);
      
      // Generate ONDC order ID
      const ondcOrderId = newOrder.ondcOrderId || `ondc-${Date.now()}`;

      // Sample response for confirm
      res.json({
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          message_id: `${Date.now()}-confirm`,
          transaction_id: `tr-${Date.now()}`
        },
        message: {
          order: {
            id: ondcOrderId,
            status: "CREATED",
            provider: {
              id: "provider-1",
              descriptor: {
                name: "Sample Store"
              }
            },
            items: message.order.items,
            billing: message.order.billing,
            fulfillment: {
              ...message.order.fulfillment,
              state: {
                descriptor: {
                  code: "Order-Placed"
                }
              },
              tracking: true,
              start: {
                location: {
                  descriptor: {
                    name: "Sample Store Warehouse"
                  },
                  address: {
                    locality: "Sample Locality",
                    city: "Sample City",
                    country: "India"
                  }
                }
              },
              end: message.order.fulfillment.end
            },
            quote: {
              price: {
                currency: "INR",
                value: calculateTotal(message.order.items).toString()
              },
              breakup: [
                {
                  title: "Item Total",
                  price: {
                    currency: "INR",
                    value: calculateTotal(message.order.items).toString()
                  }
                },
                {
                  title: "Delivery Charges",
                  price: {
                    currency: "INR",
                    value: "40.00"
                  }
                }
              ]
            },
            payment: message.order.payment || {
              type: "POST-FULFILLMENT",
              status: "NOT-PAID"
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('ONDC confirm error:', error);
      res.status(500).json({ error: 'Internal server error processing ONDC confirm request' });
    }
  });

  router.post('/ondc/status', (req: Request, res: Response) => {
    try {
      const { context, message } = req.body;

      // Validate required fields for status
      if (!context || !message || !message.order_id) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'Required fields missing: context, message.order_id'
        });
      }

      // Log the status request
      console.log('ONDC status request:', JSON.stringify(req.body, null, 2));

      // Sample response for status
      res.json({
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          message_id: `${Date.now()}-status`,
          transaction_id: `tr-${Date.now()}`
        },
        message: {
          order: {
            id: message.order_id,
            status: "PROCESSING",
            fulfillment: {
              state: {
                descriptor: {
                  code: "Order-Processing"
                }
              },
              tracking: true,
              start: {
                time: {
                  timestamp: new Date(Date.now() - 3600000).toISOString() // One hour ago
                }
              },
              end: {
                time: {
                  range: {
                    start: new Date(Date.now() + 7200000).toISOString(), // Two hours from now
                    end: new Date(Date.now() + 10800000).toISOString() // Three hours from now
                  }
                }
              }
            },
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('ONDC status error:', error);
      res.status(500).json({ error: 'Internal server error processing ONDC status request' });
    }
  });

  // Helper function for ONDC endpoints
  // Helper functions for ONDC protocol integration
  async function createOndcOrder(orderData: any, items: any[]): Promise<any> {
    try {
      // Create a new order in our system
      const newOrder = await storage.createOrder({
        status: 'CREATED',
        userId: orderData.userId,
        totalAmount: calculateTotal(items),
        ondcOrderId: `ondc-${Date.now()}`
      });
      
      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
      }
      
      // Create delivery record
      await storage.createDelivery({
        orderId: newOrder.id,
        status: 'PENDING',
        address: orderData.address
      });
      
      // Create payment record
      await storage.createPayment({
        orderId: newOrder.id,
        amount: newOrder.totalAmount,
        status: 'PENDING',
        method: orderData.paymentMethod || 'CASH_ON_DELIVERY'
      });
      
      // Log ONDC order creation
      const metric = await storage.createServiceMetric({
        serviceName: 'ondc-order-service',
        status: 'ACTIVE',
        requestCount: 1,
        errorRate: 0.0,
        averageLatency: 0.0
      });
      
      console.log(`ONDC Order created with ID: ${newOrder.id}, Metric ID: ${metric.id}`);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating ONDC order:', error);
      throw error;
    }
  }
  
  function calculateTotal(items: any[]): number {
    let total = 0;
    items.forEach(item => {
      const price = item.id === "10001" ? 150 : 40;
      const quantity = item.quantity?.count || 1;
      total += price * quantity;
    });
    return total;
  }
  
  // Customer Storefront API Routes
  
  // Categories API
  router.get('/categories', async (req: Request, res: Response) => {
    try {
      // Return default categories since our product schema doesn't have categorySlug
      // In a real implementation, we would retrieve these from the database
      const categories = [
        { name: 'Main Course', slug: 'main-course' },
        { name: 'Starters', slug: 'starters' },
        { name: 'Desserts', slug: 'desserts' },
        { name: 'Beverages', slug: 'beverages' }
      ];
      
      res.json(categories);
    } catch (error) {
      console.error('Categories API error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
  
  // Products API
  router.get('/products', async (req: Request, res: Response) => {
    try {
      // Get products from database
      const products = await storage.getProducts();
      
      // Transform products for frontend to match the expected format
      const transformedProducts = products.map(product => {
        // Get category slug from categoryId (in real application should use a category lookup)
        const categoryMap: Record<number, string> = {
          1: 'main-course',
          2: 'starters',
          3: 'desserts',
          4: 'beverages'
        };
        const categorySlug = product.categoryId ? categoryMap[product.categoryId] || 'uncategorized' : 'uncategorized';
        
        return {
          ...product,
          // Add placeholder image if none exists
          imageUrl: product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`,
          // Default to true if stock > 0, or if stock is null
          isAvailable: product.stock === null ? true : product.stock > 0,
          // Add category slug
          categorySlug,
          // Add additional fields needed by frontend
          isVeg: product.id % 2 === 0, // Just for demo purposes, alternate products
          weight: product.sku ? `${(product.id * 100) % 1000}g` : null, // Example weight based on id
          // Ensure price is a number
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        };
      });
      
      // Filter by category if provided
      const categorySlug = req.query.category as string | undefined;
      const filteredProducts = categorySlug 
        ? transformedProducts.filter(product => product.categorySlug === categorySlug)
        : transformedProducts;
      
      res.json(filteredProducts);
    } catch (error) {
      console.error('Products API error:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  
  // Kitchens API (delivery locations)
  router.get('/kitchens', (req: Request, res: Response) => {
    try {
      // Mock kitchens data (will be replaced with database access later)
      const kitchens = [
        {
          id: 1,
          name: 'Central Kitchen',
          area: 'Downtown',
          city: 'Bangalore',
          state: 'Karnataka',
          latitude: 12.9716,
          longitude: 77.5946,
          isOpen: true,
          openingTime: '08:00',
          closingTime: '22:00'
        },
        {
          id: 2,
          name: 'North Kitchen',
          area: 'Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          latitude: 12.9352,
          longitude: 77.6245,
          isOpen: true,
          openingTime: '09:00',
          closingTime: '23:00'
        }
      ];
      
      res.json(kitchens);
    } catch (error) {
      console.error('Kitchens API error:', error);
      res.status(500).json({ error: 'Failed to fetch kitchens' });
    }
  });
  
  // Orders API for customer storefront
  router.post('/orders', async (req: Request, res: Response) => {
    try {
      const { items, subtotal, deliveryFee, total } = req.body;
      
      if (!items || !items.length) {
        return res.status(400).json({
          error: 'Invalid request format',
          message: 'No items provided in order'
        });
      }
      
      // In a real implementation with authentication, we would get the userId from the session
      // For now, use a demo user ID
      const userId = 1; // Demo user ID
      
      // Create the order in the database
      const orderData = {
        userId: userId,
        status: 'CREATED',
        totalAmount: total || subtotal + (deliveryFee || 0),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        // Create the order
        const newOrder = await storage.createOrder(orderData);
        
        // Create order items
        for (const item of items) {
          await storage.createOrderItem({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price
          });
        }
        
        // Create mock delivery entry
        const deliveryData = {
          orderId: newOrder.id,
          status: 'PENDING',
          address: 'Demo Address, Customer Location',
          trackingNumber: `TR-${Date.now()}`,
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        };
        
        const delivery = await storage.createDelivery(deliveryData);
        
        // Create payment record
        const paymentData = {
          orderId: newOrder.id,
          amount: total || subtotal + (deliveryFee || 0),
          status: 'PENDING',
          method: 'CARD',
          transactionId: `TXN-${Date.now()}`,
          createdAt: new Date()
        };
        
        const payment = await storage.createPayment(paymentData);
        
        // Return the complete order with items, delivery and payment info
        res.status(201).json({
          ...newOrder,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          delivery,
          payment,
          subtotal,
          deliveryFee,
          total
        });
      } catch (error) {
        console.error('Order creation error:', error);
        throw new Error('Failed to store order in database');
      }
    } catch (error) {
      console.error('Orders API error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Delivery tracking endpoints
  router.get('/delivery/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const delivery = await storage.getDelivery(id);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      // Get associated order
      const order = await storage.getOrder(delivery.orderId);
      
      // Get delivery location history
      const locationHistory = await storage.getDeliveryLocationHistory(id);
      
      res.json({
        ...delivery,
        order,
        locationHistory
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch delivery tracking information' });
    }
  });
  
  router.post('/delivery/:id/location', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude, speed, heading, accuracy, batteryLevel, metadata } = req.body;
      
      // Validate required fields
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      
      // Save location to history
      const locationHistory = await storage.createDeliveryLocationHistory({
        deliveryId: id,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        batteryLevel,
        metadata
      });
      
      // Update current location in delivery
      const updatedDelivery = await storage.updateDelivery(id, {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationUpdateTime: new Date()
      });
      
      if (!updatedDelivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      // Broadcast location via WebSocket if available
      if (io) {
        io.to(`delivery:${id}`).emit('deliveryLocationUpdated', {
          deliveryId: id,
          location: {
            lat: latitude,
            lng: longitude
          },
          timestamp: locationHistory.timestamp,
          speed,
          heading
        });
      }
      
      res.status(200).json({ success: true, location: locationHistory });
    } catch (error) {
      console.error('Error updating delivery location:', error);
      res.status(500).json({ error: 'Failed to update delivery location' });
    }
  });
  
  // Simulate delivery route for testing
  router.post('/delivery/:id/simulate', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const delivery = await storage.getDelivery(id);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      // Check if we have origin and destination coordinates
      if (!delivery.currentLat || !delivery.currentLng || !delivery.destinationLat || !delivery.destinationLng) {
        return res.status(400).json({ 
          error: 'Delivery must have current and destination coordinates to simulate a route'
        });
      }
      
      // Start simulation in the background - in a real app this would use a job queue
      const simulationId = Date.now().toString();
      
      // Respond immediately with simulation ID
      res.status(200).json({ 
        success: true, 
        message: 'Delivery route simulation started',
        simulationId
      });
      
      // In a real app, we'd use a proper job system, but for demo purposes:
      setTimeout(() => {
        startDeliverySimulation(id, delivery, io);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting delivery simulation:', error);
      res.status(500).json({ error: 'Failed to start delivery simulation' });
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // Register all routes with '/api' prefix
  app.use('/api', router);

  return app;
}

// Function to simulate a delivery route with periodic location updates
async function startDeliverySimulation(deliveryId: number, delivery: any, io?: SocketIOServer) {
  // Parse coordinates
  const startLat = parseFloat(delivery.currentLat);
  const startLng = parseFloat(delivery.currentLng);
  const endLat = parseFloat(delivery.destinationLat);
  const endLng = parseFloat(delivery.destinationLng);
  
  // Calculate a simple route (straight line divided into steps)
  const steps = 20; // Number of points along the route
  const latStep = (endLat - startLat) / steps;
  const lngStep = (endLng - startLng) / steps;
  
  // Update delivery status
  await storage.updateDelivery(deliveryId, {
    status: 'in_transit',
    startTime: new Date()
  });
  
  // Simulate movement along the route
  for (let i = 0; i <= steps; i++) {
    // Calculate current position
    const lat = startLat + (latStep * i);
    const lng = startLng + (lngStep * i);
    
    // Simulate speed and heading
    const speed = 25 + Math.random() * 15; // Random speed between 25-40 km/h
    const heading = Math.atan2(latStep, lngStep) * (180 / Math.PI);
    
    try {
      // Save location to history
      const locationHistory = await storage.createDeliveryLocationHistory({
        deliveryId,
        latitude: lat.toString(),
        longitude: lng.toString(),
        speed,
        heading,
        accuracy: 10,
        batteryLevel: 0.8,
        metadata: { simulated: true, step: i }
      });
      
      // Update delivery with current position
      await storage.updateDelivery(deliveryId, {
        currentLat: lat.toString(),
        currentLng: lng.toString(),
        lastLocationUpdateTime: new Date(),
        estimatedArrivalTime: new Date(Date.now() + (steps - i) * 30000) // Estimate 30 seconds per remaining step
      });
      
      // Broadcast to clients if Socket.IO is available
      if (io) {
        io.to(`delivery:${deliveryId}`).emit('deliveryLocationUpdated', {
          deliveryId,
          location: { lat, lng },
          timestamp: locationHistory.timestamp,
          speed,
          heading,
          estimatedArrival: new Date(Date.now() + (steps - i) * 30000)
        });
      }
      
      // Last step - delivery completed
      if (i === steps) {
        await storage.updateDelivery(deliveryId, {
          status: 'delivered',
          completedTime: new Date()
        });
        
        if (io) {
          io.to(`delivery:${deliveryId}`).emit('deliveryCompleted', {
            deliveryId,
            completedTime: new Date()
          });
        }
      }
      
      // Wait before next update (1.5 seconds between updates)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`Error in delivery simulation step ${i}:`, error);
    }
  }
}