import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Import API Gateway
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is our main entry point for Render deployment
// We're essentially just running the API Gateway service
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // We'll dynamically import the API Gateway to start all services
    const { default: startApiGateway } = await import('./services/api-gateway/dist/index.js');
    
    // Create a simple Express app for health checks and basic routing
    const app = express();
    
    // Apply middleware
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    
    app.use(cors({
      origin: [FRONTEND_URL],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(compression());
    app.use(express.json());
    
    // Basic health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'ONDC E-commerce Platform API is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
      });
    });
    
    // Start the API Gateway - this will initialize all microservices
    await startApiGateway();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`ONDC Backend API running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Allowing CORS for: ${FRONTEND_URL}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

// Start the server
startServer();