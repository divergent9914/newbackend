import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes';
import { errorHandler } from '../../shared/utils';
import config from '../../shared/config';

// Handle the __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();
const PORT = process.env.API_GATEWAY_PORT || config.service.port;

// Create HTTP server
const server = http.createServer(app);

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: config.service.corsOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`${config.service.apiPrefix}`, apiRoutes);

// Static client files in production
const clientDistPath = path.resolve(__dirname, '../../../../client/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith(config.service.apiPrefix)) {
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    // Start listening for requests
    server.listen(PORT, () => {
      console.log(`API Gateway running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}${config.service.apiPrefix}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`Client available at http://localhost:${PORT}`);
      } else {
        console.log(`Client available at the Vite dev server port (typically 5173)`);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down API Gateway...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down API Gateway...');
  server.close();
  process.exit(0);
});

// Start the server
startServer();