# ONDC E-commerce Backend API

The backend API for the ONDC E-commerce Platform, optimized for deployment on Render.

## Technology Stack

- Node.js with TypeScript
- Express.js for API endpoints
- Microservices architecture
- Supabase for database and authentication
- Socket.IO for real-time communication
- Stripe for payment processing
- ONDC Protocol integration

## Architecture

This backend uses a microservices architecture with the following services:

1. **API Gateway** - Entry point for all client requests
2. **User Service** - Authentication and user management
3. **Product Service** - Catalog and inventory management
4. **Order Service** - Order processing and management
5. **Payment Service** - Stripe integration for payments
6. **Delivery Service** - GPS tracking and delivery management
7. **ONDC Service** - ONDC protocol integration

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`

3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Render

1. Connect your GitHub repository to Render
2. Use the Web Service deployment type
3. Configure settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all required environment variables from `.env.example`
4. Deploy!

Alternatively, you can use the included `render.yaml` for Blueprint deployments.

## Environment Variables

See `.env.example` for the required environment variables.

## Frontend Communication

This backend API is designed to work with the frontend deployed on Vercel. The frontend URL is configured via the `FRONTEND_URL` environment variable for CORS settings.