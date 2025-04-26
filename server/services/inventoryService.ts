import { storage } from "../storage";
import { InsertProduct } from "@shared/schema";

class InventoryService {
  private readonly serviceName = "Inventory Service";

  async getAllProducts() {
    try {
      const products = await storage.getProducts();
      await this.updateMetrics(true);
      return products;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async getProductById(id: number) {
    try {
      const product = await storage.getProduct(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      await this.updateMetrics(true);
      return product;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async createProduct(productData: InsertProduct) {
    try {
      const product = await storage.createProduct(productData);
      await this.updateMetrics(true);
      return product;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async createBatchProducts(productsData: InsertProduct[]) {
    try {
      const productPromises = productsData.map(product => 
        storage.createProduct(product)
      );
      
      const products = await Promise.all(productPromises);
      await this.updateMetrics(true);
      return products;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async updateProductStock(id: number, stock: number) {
    try {
      const updatedProduct = await storage.updateProductStock(id, stock);
      if (!updatedProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      await this.updateMetrics(true);
      return updatedProduct;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  private async updateMetrics(success: boolean) {
    try {
      const metrics = (await storage.getServiceMetricsByName(this.serviceName))[0];
      
      if (metrics) {
        const requestCount = metrics.requestCount + 1;
        const errorCount = success ? metrics.errorRate * metrics.requestCount : (metrics.errorRate * metrics.requestCount) + 1;
        const errorRate = errorCount / requestCount;
        
        await storage.updateServiceMetric(metrics.id, {
          requestCount,
          errorRate,
          status: errorRate > 0.05 ? 'warning' : 'healthy'
        });
      }
    } catch (error) {
      console.error("Failed to update metrics:", error);
    }
  }
}

export const inventoryService = new InventoryService();
