import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { z } from 'zod';
import { registerRoutes } from './routes';
import { db } from './db';
import { storage } from './storage';

// Environment variables
const port = process.env.PORT || 5000;

async function startServer() {
  // Create Express app
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
      ? '*' 
      : ['https://yourdomain.com', 'http://localhost:3000']
  }));
  
  // Register routes
  registerRoutes(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Start listening
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    
    // Log environment
    console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Log database connection
    console.log('📦 Database connected');
  });
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    httpServer.close(() => {
      console.log('Server shut down');
      process.exit(0);
    });
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});