# ONDC E-commerce Platform

A microservices-based e-commerce platform designed for hyper-local food delivery, integrating ONDC protocol with advanced geospatial and multi-vendor capabilities.

## Architecture Overview

The application follows a microservices architecture to ensure scalability, maintainability, and separation of concerns. Each service is independently deployable and focused on a specific business domain.

### Core Services

- **API Gateway**: Entry point for all client requests, handles routing to appropriate microservices
- **User Service**: Manages user authentication, registration, and profile information
- **Product Service**: Handles product catalog, categories, and inventory management
- **Order Service**: Processes orders, maintains order status, and manages order items
- **Payment Service**: Integrates with Stripe for payment processing and subscription management
- **Delivery Service**: Manages delivery tracking, route optimization, and real-time location updates
- **ONDC Service**: Handles ONDC protocol integration and communication with ONDC network

### Client Application

The frontend is built with React, Vite, and modern UI components:

- React with TypeScript for type-safe development
- Vite for fast development and optimized builds
- Tailwind CSS and ShadCN UI for responsive, beautiful interfaces
- React Query for efficient data fetching and cache management
- Zustand for state management
- Leaflet for interactive maps and delivery tracking

## Technical Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **API Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with Passport.js
- **Real-time Communication**: Socket.IO
- **Payment Processing**: Stripe API
- **Geolocation**: Leaflet and native browser APIs

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with ShadCN UI components
- **Forms**: React Hook Form with Zod validation
- **Maps**: React Leaflet
- **Notifications**: Sonner toast notifications

### DevOps & Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Neon PostgreSQL
- **Environment Variables**: Dotenv

## Service Interactions

Services communicate through:

1. **RESTful HTTP APIs**: For direct service-to-service communication
2. **Event Broker**: For asynchronous communication and event propagation

### Key Workflows

#### Order Processing Flow

1. User places an order through the client application
2. API Gateway routes request to Order Service
3. Order Service validates order and creates order record
4. Order Service publishes ORDER_CREATED event
5. Payment Service subscribes to ORDER_CREATED, initiates payment
6. On successful payment, Payment Service publishes PAYMENT_SUCCEEDED
7. Order Service updates order status to 'paid'
8. Delivery Service creates delivery record and begins tracking
9. Real-time location updates sent to client via Socket.IO

#### ONDC Integration Flow

1. Client makes ONDC search/select/init/confirm request
2. API Gateway routes to ONDC Service
3. ONDC Service formats request according to protocol
4. ONDC Service communicates with ONDC network
5. Responses processed and transformed for client consumption

## Environment Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account for payment processing

### Environment Variables

Create a `.env` file with the following variables:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Service Ports
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
DELIVERY_SERVICE_PORT=3005
ONDC_SERVICE_PORT=3006

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# ONDC Integration
ONDC_SUBSCRIBER_ID=your_subscriber_id
ONDC_SUBSCRIBER_URL=your_subscriber_url
ONDC_REGISTRY_URL=your_registry_url
ONDC_ENCRYPTION_PRIVATE_KEY=your_encryption_private_key
ONDC_SIGNING_PRIVATE_KEY=your_signing_private_key

# Delivery Configuration
DEFAULT_LATITUDE=26.7271012
DEFAULT_LONGITUDE=88.3952861
MAX_DELIVERY_DISTANCE=10
```

## Running the Application

### Development Mode

Start all services in development mode:

```bash
# Install dependencies
npm install

# Start the services
npm run dev
```

### Production Mode

Build and start all services for production:

```bash
# Install dependencies
npm install

# Build all services
npm run build

# Start the services
npm start
```

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

### Backend Deployment (Render)

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all required environment variables

## API Documentation

### API Gateway Routes

- `GET /api/health` - Health check
- `GET /api/services` - List all available services

### User Service

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Product Service

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug/products` - Get products by category

### Order Service

- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Payment Service

- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/create-subscription` - Create subscription
- `POST /api/payments/webhook` - Handle Stripe webhooks

### Delivery Service

- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries/:id/location` - Update delivery location
- `GET /api/deliveries/:id/track` - Get real-time tracking updates

### ONDC Service

- `POST /api/ondc/search` - ONDC search API
- `POST /api/ondc/select` - ONDC select API
- `POST /api/ondc/init` - ONDC init API
- `POST /api/ondc/confirm` - ONDC confirm API
- `POST /api/ondc/status` - ONDC status API

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.