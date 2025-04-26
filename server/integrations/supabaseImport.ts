import { supabase, testSupabaseConnection } from '../supabase';
import { storage } from '../storage';
import { log } from '../vite';
import { PostgrestError } from '@supabase/supabase-js';
import {
  InsertProduct,
  InsertOrder,
  InsertUser,
  InsertOndcIntegration,
  InsertOrderItem
} from '@shared/schema';

// Define a generic data fetcher
async function fetchSupabaseData<T>(
  tableName: string,
  select = '*',
  limit = 1000
): Promise<{ data: T[] | null; error: PostgrestError | null }> {
  return await supabase.from(tableName).select(select).limit(limit);
}

// Import users from Supabase
async function importUsers(): Promise<number> {
  const { data, error } = await fetchSupabaseData<InsertUser>('users');
  
  if (error) {
    log(`Error fetching users from Supabase: ${error.message}`, 'supabase-import');
    return 0;
  }
  
  if (!data || data.length === 0) {
    log('No users found in Supabase', 'supabase-import');
    return 0;
  }
  
  let importedCount = 0;
  
  for (const user of data) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(user.username);
      
      if (!existingUser) {
        await storage.createUser(user);
        importedCount++;
      }
    } catch (err) {
      log(`Error importing user ${user.username}: ${err instanceof Error ? err.message : String(err)}`, 'supabase-import');
    }
  }
  
  log(`Imported ${importedCount} users from Supabase`, 'supabase-import');
  return importedCount;
}

// Import products from Supabase
async function importProducts(): Promise<number> {
  const { data, error } = await fetchSupabaseData<InsertProduct>('products');
  
  if (error) {
    log(`Error fetching products from Supabase: ${error.message}`, 'supabase-import');
    return 0;
  }
  
  if (!data || data.length === 0) {
    log('No products found in Supabase', 'supabase-import');
    return 0;
  }
  
  let importedCount = 0;
  
  for (const product of data) {
    try {
      // We can check by name or SKU
      const existingProducts = await storage.getProducts();
      const existingProduct = existingProducts.find(p => p.sku === product.sku);
      
      if (!existingProduct) {
        await storage.createProduct(product);
        importedCount++;
      }
    } catch (err) {
      log(`Error importing product ${product.name}: ${err instanceof Error ? err.message : String(err)}`, 'supabase-import');
    }
  }
  
  log(`Imported ${importedCount} products from Supabase`, 'supabase-import');
  return importedCount;
}

// Import orders from Supabase
async function importOrders(): Promise<number> {
  const { data: ordersData, error: ordersError } = await fetchSupabaseData<InsertOrder>('orders');
  
  if (ordersError) {
    log(`Error fetching orders from Supabase: ${ordersError.message}`, 'supabase-import');
    return 0;
  }
  
  if (!ordersData || ordersData.length === 0) {
    log('No orders found in Supabase', 'supabase-import');
    return 0;
  }
  
  let importedCount = 0;
  
  for (const order of ordersData) {
    try {
      // Check if order already exists
      const existingOrders = await storage.getOrders();
      const existingOrder = existingOrders.find(o => o.ondcOrderId === order.ondcOrderId && order.ondcOrderId !== null);
      
      if (!existingOrder) {
        const newOrder = await storage.createOrder(order);
        
        // Fetch and import order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('orderId', order.id);
        
        if (itemsError) {
          log(`Error fetching order items for order ${order.id}: ${itemsError.message}`, 'supabase-import');
          continue;
        }
        
        if (itemsData && itemsData.length > 0) {
          for (const item of itemsData) {
            await storage.createOrderItem({
              ...item,
              orderId: newOrder.id // Use the new order ID
            });
          }
        }
        
        importedCount++;
      }
    } catch (err) {
      log(`Error importing order ${order.id}: ${err instanceof Error ? err.message : String(err)}`, 'supabase-import');
    }
  }
  
  log(`Imported ${importedCount} orders from Supabase`, 'supabase-import');
  return importedCount;
}

// Import ONDC integrations from Supabase
async function importOndcIntegrations(): Promise<number> {
  const { data, error } = await fetchSupabaseData<InsertOndcIntegration>('ondc_integration');
  
  if (error) {
    log(`Error fetching ONDC integrations from Supabase: ${error.message}`, 'supabase-import');
    return 0;
  }
  
  if (!data || data.length === 0) {
    log('No ONDC integrations found in Supabase', 'supabase-import');
    return 0;
  }
  
  let importedCount = 0;
  
  for (const integration of data) {
    try {
      // Check if integration already exists
      const existingIntegrations = await storage.getOndcIntegrations();
      const existingIntegration = existingIntegrations.find(i => i.endpoint === integration.endpoint);
      
      if (!existingIntegration) {
        await storage.createOndcIntegration(integration);
        importedCount++;
      }
    } catch (err) {
      log(`Error importing ONDC integration ${integration.endpoint}: ${err instanceof Error ? err.message : String(err)}`, 'supabase-import');
    }
  }
  
  log(`Imported ${importedCount} ONDC integrations from Supabase`, 'supabase-import');
  return importedCount;
}

// Main import function
export async function importFromSupabase(): Promise<{
  success: boolean;
  stats: {
    users: number;
    products: number;
    orders: number;
    ondcIntegrations: number;
  };
}> {
  // Test Supabase connection
  const connected = await testSupabaseConnection();
  
  if (!connected) {
    return {
      success: false,
      stats: {
        users: 0,
        products: 0,
        orders: 0,
        ondcIntegrations: 0
      }
    };
  }
  
  log('Starting Supabase data import...', 'supabase-import');
  
  // Import data
  const users = await importUsers();
  const products = await importProducts();
  const orders = await importOrders();
  const ondcIntegrations = await importOndcIntegrations();
  
  log('Supabase data import completed', 'supabase-import');
  
  return {
    success: true,
    stats: {
      users,
      products,
      orders,
      ondcIntegrations
    }
  };
}