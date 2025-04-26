import express, { Request, Response, Router, NextFunction } from 'express';
import { storage } from './storage';
import { supabase, testSupabaseConnection } from './supabase';
import { testConnection } from './db';
import { loginSchema, serviceInsertSchema, apiKeyInsertSchema } from '../shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: express.Express) {
  const router = Router();

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

  // Services API
  router.get('/services', async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  router.get('/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  });

  router.post('/services', async (req: Request, res: Response) => {
    try {
      const serviceData = serviceInsertSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  router.put('/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = serviceInsertSchema.partial().parse(req.body);
      
      const updatedService = await storage.updateService(id, serviceData);
      
      if (!updatedService) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  router.delete('/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // API Keys routes
  router.get('/apikeys/service/:serviceId', async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const keys = await storage.getApiKeysByService(serviceId);
      res.json(keys);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  router.post('/apikeys', async (req: Request, res: Response) => {
    try {
      const keyData = apiKeyInsertSchema.parse(req.body);
      const newKey = await storage.createApiKey(keyData);
      res.status(201).json(newKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create API key' });
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
  // Sample implementation of ONDC protocol endpoints
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
            bpp/providers: [
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

  router.post('/ondc/confirm', (req: Request, res: Response) => {
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

      // Generate order ID
      const orderId = `order-${Date.now()}`;

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
            id: orderId,
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
  function calculateTotal(items: any[]): number {
    let total = 0;
    items.forEach(item => {
      const price = item.id === "10001" ? 150 : 40;
      const quantity = item.quantity?.count || 1;
      total += price * quantity;
    });
    return total;
  }

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // Register all routes with '/api' prefix
  app.use('/api', router);

  return app;
}