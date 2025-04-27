import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import deliveryRoutes from './routes';
import { errorHandler } from '../../shared/utils';
import config from '../../shared/config';
import { testConnection } from '../../shared/db';
import { eventBroker, EventType } from '../../shared/event-broker';

// Create Express application
const app = express();
const PORT = process.env.DELIVERY_SERVICE_PORT || 3005;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server for real-time delivery updates
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/ws'
});

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: config.service.corsOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`${config.service.apiPrefix}/deliveries`, deliveryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'delivery-service' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected to delivery service:', socket.id);
  
  // Join delivery room
  socket.on('join-delivery', (deliveryId) => {
    console.log(`Client ${socket.id} joined delivery ${deliveryId}`);
    socket.join(`delivery-${deliveryId}`);
  });
  
  // Leave delivery room
  socket.on('leave-delivery', (deliveryId) => {
    console.log(`Client ${socket.id} left delivery ${deliveryId}`);
    socket.leave(`delivery-${deliveryId}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Listen for delivery location updates and emit to clients
eventBroker.subscribe(EventType.DELIVERY_LOCATION_UPDATED, (payload) => {
  const { data } = payload;
  const { deliveryId } = data;
  
  // Emit to all clients in the delivery room
  io.to(`delivery-${deliveryId}`).emit('location-update', data);
});

// Listen for delivery status updates and emit to clients
eventBroker.subscribe(EventType.DELIVERY_UPDATED, (payload) => {
  const { data } = payload;
  
  // Emit to all clients in the delivery room
  io.to(`delivery-${data.id}`).emit('status-update', data);
});

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
    server.listen(PORT, () => {
      console.log(`Delivery service running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}${config.service.apiPrefix}/deliveries`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down delivery service...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down delivery service...');
  server.close();
  process.exit(0);
});

// Start the server
startServer();