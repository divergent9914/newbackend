import { storage } from "../storage";
import { ApiRoute } from "@shared/schema";

class ApiGateway {
  private readonly serviceName = "API Gateway";
  private routes: ApiRoute[] = [];

  constructor() {
    this.loadRoutes();
  }

  private async loadRoutes() {
    try {
      this.routes = await storage.getApiRoutes();
    } catch (error) {
      console.error("Failed to load API routes:", error);
      this.routes = [];
    }
  }

  async refreshRoutes() {
    await this.loadRoutes();
    return this.routes;
  }

  async getRoutes() {
    return this.routes;
  }

  async addRoute(route: { path: string; method: string; service: string; active: boolean }) {
    try {
      const newRoute = await storage.createApiRoute(route);
      await this.loadRoutes();
      await this.updateMetrics(true);
      return newRoute;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async updateRouteStatus(id: number, active: boolean) {
    try {
      const updatedRoute = await storage.updateApiRoute(id, active);
      await this.loadRoutes();
      await this.updateMetrics(true);
      return updatedRoute;
    } catch (error) {
      await this.updateMetrics(false);
      throw error;
    }
  }

  async routeRequest(path: string, method: string) {
    try {
      // Find the appropriate route for the request
      const route = this.routes.find(r => 
        r.path.replace(/{[^}]+}/g, '[^/]+').match(new RegExp(`^${path}$`)) && 
        r.method === method && 
        r.active
      );
      
      if (!route) {
        throw new Error(`No active route found for ${method} ${path}`);
      }
      
      await this.updateMetrics(true);
      return route.service;
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

export const apiGateway = new ApiGateway();
