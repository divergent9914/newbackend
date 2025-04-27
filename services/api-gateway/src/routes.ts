import express, { Request, Response, NextFunction } from 'express';
import { ServiceClient, ServiceName } from '../../shared/service-client';
import { errorHandler, asyncHandler } from '../../shared/utils';
import axios, { AxiosRequestConfig } from 'axios';
import config from '../../shared/config';

// Create router
const router = express.Router();
const serviceClient = new ServiceClient();

/**
 * Creates a middleware to proxy requests to a microservice
 * @param serviceName Target service
 * @param pathPrefix Path prefix to strip from the request
 */
function createProxyMiddleware(serviceName: ServiceName, pathPrefix: string) {
  return asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get service URL from service client
      const serviceBaseUrl = serviceClient.getServiceUrl(serviceName);
      
      // Strip path prefix to get relative path
      const relativePath = req.url.replace(pathPrefix, '');
      
      // Build target URL
      const targetUrl = `${serviceBaseUrl}${relativePath}`;
      
      // Forward the request
      const options: AxiosRequestConfig = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: new URL(serviceBaseUrl).host
        },
        data: req.body,
        params: req.query,
        validateStatus: () => true // Pass through status code
      };
      
      const response = await axios(options);
      
      // Send response
      res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error(`Proxy error to ${serviceName}:`, error.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Unable to connect to the target service',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
}

// Route traffic to appropriate microservices

// User service routes
router.use('/users', createProxyMiddleware(ServiceName.USER, '/users'));

// Product service routes
router.use('/products', createProxyMiddleware(ServiceName.PRODUCT, '/products'));
router.use('/categories', createProxyMiddleware(ServiceName.PRODUCT, '/categories'));

// Order service routes
router.use('/orders', createProxyMiddleware(ServiceName.ORDER, '/orders'));

// Payment service routes
router.use('/payments', createProxyMiddleware(ServiceName.PAYMENT, '/payments'));

// Delivery service routes
router.use('/deliveries', createProxyMiddleware(ServiceName.DELIVERY, '/deliveries'));

// ONDC service routes
router.use('/ondc', createProxyMiddleware(ServiceName.ONDC, '/ondc'));

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    version: config.version,
    environment: config.env
  });
});

// Service discovery endpoint
router.get('/services', (req: Request, res: Response) => {
  res.json({
    services: [
      {
        name: 'user-service',
        url: serviceClient.getServiceUrl(ServiceName.USER),
        routes: ['/users']
      },
      {
        name: 'product-service',
        url: serviceClient.getServiceUrl(ServiceName.PRODUCT),
        routes: ['/products', '/categories']
      },
      {
        name: 'order-service',
        url: serviceClient.getServiceUrl(ServiceName.ORDER),
        routes: ['/orders']
      },
      {
        name: 'payment-service',
        url: serviceClient.getServiceUrl(ServiceName.PAYMENT),
        routes: ['/payments']
      },
      {
        name: 'delivery-service',
        url: serviceClient.getServiceUrl(ServiceName.DELIVERY),
        routes: ['/deliveries']
      },
      {
        name: 'ondc-service',
        url: serviceClient.getServiceUrl(ServiceName.ONDC),
        routes: ['/ondc']
      }
    ]
  });
});

export default router;