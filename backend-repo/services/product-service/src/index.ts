import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productRoutes from './routes';
import { errorHandler } from '../../shared/utils';
import config from '../../shared/config';
import { testConnection } from '../../shared/db';

// Create Express application
const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 3002;

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: config.service.corsOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`${config.service.apiPrefix}/products`, productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`Product service running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}${config.service.apiPrefix}/products`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down product service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down product service...');
  process.exit(0);
});

// Start the server
startServer();