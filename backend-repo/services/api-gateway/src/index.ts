/**
 * API Gateway Service
 * 
 * This is the main entry point for the API Gateway service.
 * It routes requests to the appropriate microservices.
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import config from '../../../shared/config';
import { ApiError, formatErrorResponse } from '../../../shared/utils';
import corsOptions from './cors-config';
import { setupRoutes } from './routes';
import { db } from '../../../shared/db';

// Create Express app
const app = express();

// Set up middleware
app.use(helmet());

// Setup logging
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parse requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors(corsOptions));

// Health check endpoint (no auth required)
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbConnected = await db.testConnection();
    const supabaseConnected = config.supabase.url && config.supabase.apiKey ? 
      await db.testSupabase() : 'not configured';
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: config.version,
      env: config.env,
      database: dbConnected ? 'connected' : 'disconnected',
      supabase: supabaseConnected ? 'connected' : supabaseConnected,
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Health check failed',
      details: config.isDev ? (error as Error).message : undefined,
    });
  }
});

// Set up routes
setupRoutes(app);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('API Gateway Error:', err);
  
  const statusCode = err instanceof ApiError ? err.status : 500;
  const response = formatErrorResponse(err);
  
  res.status(statusCode).json(response);
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket.IO connections
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = config.service.port;
httpServer.listen(PORT, () => {
  console.log(`API Gateway started on port ${PORT} in ${config.env} mode`);
  console.log(`Version: ${config.version}`);
});

// Handle process shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    db.close().then(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});