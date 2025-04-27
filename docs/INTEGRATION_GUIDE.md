# Integration Guide: PetPooja and ONDC

This guide provides detailed information on integrating the ONDC E-commerce platform with:
1. PetPooja for menu and inventory management
2. ONDC for digital commerce network connectivity

## 1. PetPooja Integration

PetPooja is used for toggling item availability and syncing menu items.

### 1.1 PetPooja API Setup

#### Prerequisites:
- PetPooja API credentials
- Restaurant ID in PetPooja system
- Access to PetPooja management dashboard

#### API Configuration:

1. **Add PetPooja credentials to environment variables**:
   ```
   PETPOOJA_API_KEY=your-api-key
   PETPOOJA_RESTAURANT_ID=your-restaurant-id
   PETPOOJA_USERNAME=your-username
   PETPOOJA_PASSWORD=your-password
   ```

2. **Create PetPooja API client module**:

```typescript
// server/integrations/petpooja/client.ts
import axios from 'axios';

const PETPOOJA_API_BASE_URL = 'https://api.petpooja.com/';

export class PetPoojaClient {
  private apiKey: string;
  private restaurantId: string;
  private username: string;
  private password: string;

  constructor() {
    this.apiKey = process.env.PETPOOJA_API_KEY || '';
    this.restaurantId = process.env.PETPOOJA_RESTAURANT_ID || '';
    this.username = process.env.PETPOOJA_USERNAME || '';
    this.password = process.env.PETPOOJA_PASSWORD || '';
    
    if (!this.apiKey || !this.restaurantId) {
      throw new Error('PetPooja API credentials not configured');
    }
  }

  private async getAuthToken() {
    const response = await axios.post(`${PETPOOJA_API_BASE_URL}/auth/token`, {
      username: this.username,
      password: this.password
    }, {
      headers: {
        'x-api-key': this.apiKey
      }
    });
    
    return response.data.token;
  }

  async getMenu() {
    const token = await this.getAuthToken();
    
    const response = await axios.get(
      `${PETPOOJA_API_BASE_URL}/restaurants/${this.restaurantId}/menu`,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  }

  async getItemAvailability() {
    const token = await this.getAuthToken();
    
    const response = await axios.get(
      `${PETPOOJA_API_BASE_URL}/restaurants/${this.restaurantId}/items/availability`,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  }
}

export const petPoojaClient = new PetPoojaClient();
```

### 1.2 Syncing Menu Items from PetPooja

Create a synchronization service to keep your product database in sync with PetPooja:

```typescript
// server/integrations/petpooja/sync-service.ts
import { db } from '../../db';
import { petPoojaClient } from './client';
import { products } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export class PetPoojaSyncService {
  async syncMenuItems() {
    try {
      // Get menu from PetPooja
      const menu = await petPoojaClient.getMenu();
      
      // Process menu items
      for (const category of menu.categories) {
        for (const item of category.items) {
          // Check if product exists in our database
          const [existingProduct] = await db
            .select()
            .from(products)
            .where(eq(products.petpoojaId, item.id));
          
          if (existingProduct) {
            // Update existing product
            await db
              .update(products)
              .set({
                name: item.name,
                description: item.description,
                price: item.price,
                // Map other fields as needed
              })
              .where(eq(products.petpoojaId, item.id));
          } else {
            // Create new product
            await db.insert(products).values({
              name: item.name,
              description: item.description || '',
              price: parseFloat(item.price),
              categoryId: this.mapPetPoojaCategoryToInternal(category.id),
              petpoojaId: item.id,
              isVeg: item.is_veg === '1',
              stock: null, // Unlimited by default
              sku: item.sku || null,
              imageUrl: item.image_url || null,
              // Map other fields as needed
            });
          }
        }
      }
      
      console.log('Menu sync completed successfully');
      return { success: true, itemsProcessed: menu.categories.flatMap(c => c.items).length };
    } catch (error) {
      console.error('Error syncing menu from PetPooja:', error);
      return { success: false, error: error.message };
    }
  }
  
  async syncItemAvailability() {
    try {
      // Get availability data from PetPooja
      const availabilityData = await petPoojaClient.getItemAvailability();
      
      // Update availability in our database
      for (const item of availabilityData.items) {
        await db
          .update(products)
          .set({
            isAvailable: item.is_available === '1'
          })
          .where(eq(products.petpoojaId, item.id));
      }
      
      console.log('Availability sync completed successfully');
      return { success: true, itemsProcessed: availabilityData.items.length };
    } catch (error) {
      console.error('Error syncing item availability from PetPooja:', error);
      return { success: false, error: error.message };
    }
  }
  
  private mapPetPoojaCategoryToInternal(petPoojaCategoryId: string): number {
    // Implement mapping from PetPooja category IDs to your internal category IDs
    // This could use a mapping table in your database
    
    // Simple example mapping:
    const categoryMap: Record<string, number> = {
      '1001': 1, // Main Course
      '1002': 2, // Starters
      '1003': 3, // Desserts
      '1004': 4  // Beverages
    };
    
    return categoryMap[petPoojaCategoryId] || 1; // Default to category 1 if not found
  }
}

export const petPoojaSyncService = new PetPoojaSyncService();
```

### 1.3 Setting Up Automated Sync

Create endpoints to trigger and schedule synchronization:

```typescript
// server/routes.ts (add these routes)

// Manual trigger for menu sync
router.post('/admin/petpooja/sync-menu', async (req: Request, res: Response) => {
  try {
    const result = await petPoojaSyncService.syncMenuItems();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync menu from PetPooja' });
  }
});

// Manual trigger for availability sync
router.post('/admin/petpooja/sync-availability', async (req: Request, res: Response) => {
  try {
    const result = await petPoojaSyncService.syncItemAvailability();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync availability from PetPooja' });
  }
});
```

### 1.4 Scheduled Syncing with Supabase Edge Functions

Create a Supabase Edge Function for scheduled sync:

```typescript
// supabase/functions/petpooja-sync/index.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import axiod from 'https://deno.land/x/axiod/mod.ts';

serve(async (req) => {
  try {
    // This should be a POST request with the target type
    const { syncType } = await req.json();
    
    // Verify if request is authorized (implement proper auth here)
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call your backend API to trigger sync
    const backendUrl = Deno.env.get('BACKEND_URL');
    const syncEndpoint = syncType === 'menu' 
      ? '/admin/petpooja/sync-menu' 
      : '/admin/petpooja/sync-availability';
    
    const response = await axiod.post(`${backendUrl}${syncEndpoint}`, {}, {
      headers: {
        Authorization: authHeader
      }
    });
    
    return new Response(
      JSON.stringify(response.data),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
```

### 1.5 Set up Cron Jobs in Supabase

Using the Supabase dashboard:

1. Navigate to Edge Functions
2. Schedule your `petpooja-sync` function:
   * Every hour for availability sync: `0 * * * *`
   * Daily for menu sync: `0 0 * * *`

## 2. ONDC Integration

The Open Network for Digital Commerce (ONDC) requires implementing specific protocols for connecting sellers and buyers in a digital marketplace.

### 2.1 ONDC Registration

#### Prerequisites:
- Register your business as an ONDC participant
- Obtain ONDC Subscriber ID and credentials
- Access to ONDC Registry

#### Configuration:

1. **Add ONDC credentials to environment variables**:
   ```
   ONDC_SUBSCRIBER_ID=your-subscriber-id
   ONDC_SIGNING_PRIVATE_KEY=your-private-key
   ONDC_REGISTRY_URL=https://registry.ondc.org/
   ONDC_API_URL=https://api.ondc.org/
   ```

### 2.2 ONDC Protocol Implementation

Create an ONDC client module:

```typescript
// server/integrations/ondc/client.ts
import axios from 'axios';
import crypto from 'crypto';

export class OndcClient {
  private subscriberId: string;
  private signingPrivateKey: string;
  private registryUrl: string;
  private apiUrl: string;

  constructor() {
    this.subscriberId = process.env.ONDC_SUBSCRIBER_ID || '';
    this.signingPrivateKey = process.env.ONDC_SIGNING_PRIVATE_KEY || '';
    this.registryUrl = process.env.ONDC_REGISTRY_URL || 'https://registry.ondc.org/';
    this.apiUrl = process.env.ONDC_API_URL || 'https://api.ondc.org/';
    
    if (!this.subscriberId || !this.signingPrivateKey) {
      throw new Error('ONDC credentials not configured');
    }
  }

  private signMessage(message: any): string {
    // Create signature using crypto and private key
    const messageString = JSON.stringify(message);
    const sign = crypto.createSign('SHA256');
    sign.update(messageString);
    sign.end();
    return sign.sign(this.signingPrivateKey, 'base64');
  }

  private createAuthorizationHeader(request: any): string {
    const signature = this.signMessage(request);
    return `Signature keyId="${this.subscriberId}",algorithm="rsa-sha256",signature="${signature}"`;
  }

  async search(searchCriteria: any) {
    const request = {
      context: {
        domain: "nic2004:52110",
        country: "IND",
        city: "std:080",
        action: "search",
        core_version: "1.0.0",
        bap_id: this.subscriberId,
        bap_uri: "https://yourapp.com/ondc",
        transaction_id: `txn_${Date.now()}`,
        message_id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      message: {
        intent: searchCriteria
      }
    };
    
    const authorization = this.createAuthorizationHeader(request);
    
    const response = await axios.post(
      `${this.apiUrl}/search`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization
        }
      }
    );
    
    return response.data;
  }

  // Add other ONDC protocol methods (select, init, confirm, etc.)
  async select(selectCriteria: any) {
    // Similar implementation to search
  }
  
  async init(initData: any) {
    // Similar implementation to search
  }
  
  async confirm(confirmData: any) {
    // Similar implementation to search
  }
  
  async status(statusQuery: any) {
    // Similar implementation to search
  }
}

export const ondcClient = new OndcClient();
```

### 2.3 Implementing ONDC Protocol Endpoints

Create endpoints for ONDC protocol interactions:

```typescript
// server/routes.ts (ONDC endpoints)

// ONDC Search
router.post('/ondc/search', async (req: Request, res: Response) => {
  try {
    const searchCriteria = req.body;
    const response = await ondcClient.search(searchCriteria);
    res.json(response);
  } catch (error) {
    console.error('ONDC search error:', error);
    res.status(500).json({ error: 'ONDC search failed' });
  }
});

// ONDC Select
router.post('/ondc/select', async (req: Request, res: Response) => {
  try {
    const selectCriteria = req.body;
    const response = await ondcClient.select(selectCriteria);
    res.json(response);
  } catch (error) {
    console.error('ONDC select error:', error);
    res.status(500).json({ error: 'ONDC select failed' });
  }
});

// ONDC Init
router.post('/ondc/init', async (req: Request, res: Response) => {
  try {
    const initData = req.body;
    const response = await ondcClient.init(initData);
    res.json(response);
  } catch (error) {
    console.error('ONDC init error:', error);
    res.status(500).json({ error: 'ONDC init failed' });
  }
});

// ONDC Confirm
router.post('/ondc/confirm', async (req: Request, res: Response) => {
  try {
    const confirmData = req.body;
    const response = await ondcClient.confirm(confirmData);
    res.json(response);
  } catch (error) {
    console.error('ONDC confirm error:', error);
    res.status(500).json({ error: 'ONDC confirm failed' });
  }
});

// ONDC Status
router.post('/ondc/status', async (req: Request, res: Response) => {
  try {
    const statusQuery = req.body;
    const response = await ondcClient.status(statusQuery);
    res.json(response);
  } catch (error) {
    console.error('ONDC status error:', error);
    res.status(500).json({ error: 'ONDC status failed' });
  }
});
```

### 2.4 ONDC Callback Handlers

```typescript
// server/routes.ts (ONDC callback endpoints)

// ONDC Search callback
router.post('/ondc/on_search', async (req: Request, res: Response) => {
  try {
    // Verify signature
    // Process search results
    // Store in database
    
    // Log the callback
    console.log('ONDC on_search callback:', JSON.stringify(req.body));
    
    res.json({ acknowledgement: { status: "ACK" } });
  } catch (error) {
    console.error('ONDC on_search error:', error);
    res.status(500).json({ error: 'Failed to process on_search' });
  }
});

// Other callbacks: on_select, on_init, on_confirm, on_status
// Similar implementation for each
```

### 2.5 ONDC Data Models

Create Drizzle schemas for ONDC entities:

```typescript
// shared/schema.ts (add these tables)

export const ondcTransactions = pgTable('ondc_transactions', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique(),
  messageId: text('message_id').notNull(),
  action: text('action').notNull(),
  domain: text('domain').notNull(),
  status: text('status').notNull().default('INITIATED'),
  requestPayload: jsonb('request_payload'),
  responsePayload: jsonb('response_payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ondcCallbacks = pgTable('ondc_callbacks', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull(),
  messageId: text('message_id').notNull(),
  action: text('action').notNull(),
  callbackPayload: jsonb('callback_payload'),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});

export const ondcOrders = pgTable('ondc_orders', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull(),
  orderId: text('order_id').notNull().unique(),
  status: text('status').notNull().default('CREATED'),
  orderData: jsonb('order_data'),
  localOrderId: integer('local_order_id').references(() => orders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## 3. Delivery Location Setup

### 3.1 Central Location Configuration

Set up a database table for location settings:

```typescript
// shared/schema.ts (add this table)

export const locationSettings = pgTable('location_settings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

Initialize the central location:

```typescript
// server/seeds/locations.ts

import { db } from '../db';
import { locationSettings } from '../../shared/schema';

export async function seedCentralLocation() {
  // Check if location exists
  const existingLocations = await db.select().from(locationSettings);
  
  if (existingLocations.length === 0) {
    // Insert the AAMIS location
    await db.insert(locationSettings).values({
      name: 'AAMIS',
      address: 'Hakimapara',
      city: 'Siliguri',
      state: 'West Bengal',
      pincode: '734001',
      latitude: '26.7271', // Replace with actual coordinates
      longitude: '88.3953', // Replace with actual coordinates
      isActive: true
    });
    
    console.log('Central location (AAMIS, Hakimapara, Siliguri) seeded successfully');
  } else {
    console.log('Locations already exist, skipping seed');
  }
}
```

### 3.2 Distance Calculation Implementation

Create a utility service for distance calculations:

```typescript
// server/services/location-service.ts

import { db } from '../db';
import { locationSettings } from '../../shared/schema';

export class LocationService {
  // Calculate distance using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  async getCentralLocation() {
    const [location] = await db
      .select()
      .from(locationSettings)
      .where(eq(locationSettings.isActive, true))
      .limit(1);
      
    if (!location) {
      throw new Error('No active central location configured');
    }
    
    return location;
  }
  
  async calculateDeliveryDistance(customerLat: number, customerLng: number) {
    const centralLocation = await this.getCentralLocation();
    
    const distanceKm = this.calculateDistance(
      parseFloat(centralLocation.latitude.toString()),
      parseFloat(centralLocation.longitude.toString()),
      customerLat,
      customerLng
    );
    
    return {
      distanceKm,
      centralLocation: centralLocation.name,
      deliverable: distanceKm <= 10 // Example: 10km delivery radius
    };
  }
  
  async calculateDeliveryFee(distanceKm: number) {
    // Implement your delivery fee calculation logic
    // Example: Base fee + per km charge
    const baseFee = 40; // ₹40 base delivery fee
    const perKmCharge = 10; // ₹10 per km
    
    return Math.round(baseFee + (perKmCharge * distanceKm));
  }
}

export const locationService = new LocationService();
```

### 3.3 API Endpoints for Location Services

Add endpoints for delivery-related operations:

```typescript
// server/routes.ts (add these routes)

// Check delivery availability
router.post('/delivery/check', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const deliveryInfo = await locationService.calculateDeliveryDistance(
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    if (deliveryInfo.deliverable) {
      const deliveryFee = await locationService.calculateDeliveryFee(deliveryInfo.distanceKm);
      
      res.json({
        available: true,
        distance: deliveryInfo.distanceKm,
        unit: 'km',
        fee: deliveryFee,
        currency: 'INR',
        estimatedTime: Math.round(30 + (deliveryInfo.distanceKm * 3)) // Base 30 mins + 3 mins per km
      });
    } else {
      res.json({
        available: false,
        distance: deliveryInfo.distanceKm,
        unit: 'km',
        message: 'Sorry, we do not deliver to your location at this time'
      });
    }
  } catch (error) {
    console.error('Delivery check error:', error);
    res.status(500).json({ error: 'Failed to check delivery availability' });
  }
});

// Get central location
router.get('/location/central', async (req: Request, res: Response) => {
  try {
    const location = await locationService.getCentralLocation();
    res.json({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
  } catch (error) {
    console.error('Central location fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch central location' });
  }
});
```

## 4. Testing Integrations

### 4.1 Testing PetPooja Integration

Create a test script to verify PetPooja connectivity:

```typescript
// scripts/test-petpooja-integration.ts
import { petPoojaClient } from '../server/integrations/petpooja/client';
import { petPoojaSyncService } from '../server/integrations/petpooja/sync-service';

async function testPetPoojaIntegration() {
  console.log('Testing PetPooja API connection...');
  
  try {
    // Test menu fetch
    console.log('Fetching menu from PetPooja...');
    const menu = await petPoojaClient.getMenu();
    console.log(`Successfully fetched menu with ${menu.categories.length} categories`);
    
    // Test availability fetch
    console.log('Fetching item availability from PetPooja...');
    const availability = await petPoojaClient.getItemAvailability();
    console.log(`Successfully fetched availability for ${availability.items.length} items`);
    
    // Test sync (if database is set up)
    console.log('Testing menu sync...');
    const syncResult = await petPoojaSyncService.syncMenuItems();
    console.log('Menu sync result:', syncResult);
    
    console.log('PetPooja integration test completed successfully');
  } catch (error) {
    console.error('PetPooja integration test failed:', error);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testPetPoojaIntegration();
}
```

### 4.2 Testing ONDC Integration

Create a test script to verify ONDC protocol implementation:

```typescript
// scripts/test-ondc-integration.ts
import { ondcClient } from '../server/integrations/ondc/client';

async function testOndcIntegration() {
  console.log('Testing ONDC protocol implementation...');
  
  try {
    // Test search
    console.log('Testing ONDC search...');
    const searchResult = await ondcClient.search({
      category: {
        id: "food"
      },
      location: {
        gps: "26.7271,88.3953"
      }
    });
    console.log('Search result:', JSON.stringify(searchResult, null, 2));
    
    // More tests for other endpoints can be added here
    
    console.log('ONDC integration test completed successfully');
  } catch (error) {
    console.error('ONDC integration test failed:', error);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testOndcIntegration();
}
```

## 5. Monitoring Integrations

Set up monitoring for integration health:

```typescript
// server/services/monitoring-service.ts
import { db } from '../db';
import { serviceMetrics } from '../../shared/schema';

export class MonitoringService {
  async recordIntegrationHealth(
    integration: 'petpooja' | 'ondc',
    status: 'healthy' | 'degraded' | 'failed',
    details: any
  ) {
    await db.insert(serviceMetrics).values({
      name: `${integration}_health`,
      category: 'integration_health',
      value: status,
      additionalData: details,
      timestamp: new Date()
    });
  }
  
  async getIntegrationHealth(integration: 'petpooja' | 'ondc') {
    const [latestMetric] = await db
      .select()
      .from(serviceMetrics)
      .where(eq(serviceMetrics.name, `${integration}_health`))
      .orderBy(desc(serviceMetrics.timestamp))
      .limit(1);
      
    return latestMetric || { status: 'unknown' };
  }
}

export const monitoringService = new MonitoringService();
```

## 6. API Documentation

Create OpenAPI documentation for your integration endpoints:

```typescript
// server/openapi.ts
export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'ONDC E-commerce Platform API',
    version: '1.0.0',
    description: 'API documentation for ONDC E-commerce Platform'
  },
  paths: {
    '/admin/petpooja/sync-menu': {
      post: {
        summary: 'Sync menu from PetPooja',
        tags: ['PetPooja Integration'],
        responses: {
          '200': {
            description: 'Successful menu sync',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    itemsProcessed: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/admin/petpooja/sync-availability': {
      post: {
        summary: 'Sync item availability from PetPooja',
        tags: ['PetPooja Integration'],
        responses: {
          '200': {
            description: 'Successful availability sync',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    itemsProcessed: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/ondc/search': {
      post: {
        summary: 'ONDC search',
        tags: ['ONDC Integration'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Define ONDC search schema
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful search',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Define ONDC search response schema
                }
              }
            }
          }
        }
      }
    },
    // Add other endpoints
  }
};
```

## 7. Integration Checklist

Before going live:

### PetPooja Integration
- [ ] PetPooja API credentials configured
- [ ] Menu synchronization tested
- [ ] Item availability updates working
- [ ] Scheduled sync set up

### ONDC Integration
- [ ] ONDC participant registration completed
- [ ] Credentials configured
- [ ] Protocol endpoints implemented and tested
- [ ] Callback handlers implemented
- [ ] Transaction tracking set up

### Delivery Location
- [ ] Central location (AAMIS, Hakimapara, Siliguri) configured
- [ ] Distance calculation working
- [ ] Delivery fee calculation implemented
- [ ] Delivery availability API tested

### Monitoring
- [ ] Integration health monitoring set up
- [ ] Alerts configured for integration failures
- [ ] Regular testing scheduled