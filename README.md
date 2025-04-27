# ONDC E-commerce Platform

A hyper-local food delivery platform leveraging microservices architecture to create a seamless, scalable e-commerce experience with ONDC protocol integration.

## Project Structure

This repository is organized into two separate applications for optimized deployment:

1. **frontend-app/** - React-based customer and admin frontend for deployment on Vercel
2. **backend-api/** - Node.js microservices for deployment on Render

### Key Features

- Microservices Architecture
- TypeScript and React/Vite Tech Stack
- ONDC (Open Network for Digital Commerce) Integration
- Real-time Delivery Tracking with GPS
- Multi-vendor Support
- Secure Payment Processing with Stripe
- PetPooja Integration for Restaurant Management
- Comprehensive Admin Dashboard

## Deployment Strategy

This project uses a split deployment approach:

- **Frontend**: Deployed on Vercel for optimal React application hosting
- **Backend**: Deployed on Render for reliable API hosting

## Getting Started

### Frontend Development (Vercel)

```bash
cd frontend-app
npm install
# Create .env file from .env.example
npm run dev
```

### Backend Development (Render)

```bash
cd backend-api
npm install
# Create .env file from .env.example
npm run dev
```

## Environment Setup

Both applications require specific environment variables to be set up. Check the `.env.example` files in each directory for the required variables.

## Services Architecture

The backend is composed of the following microservices:

- **API Gateway**: Entry point for all client requests
- **User Service**: Authentication and user management
- **Product Service**: Catalog and inventory management
- **Order Service**: Order processing and management
- **Payment Service**: Stripe integration for payments
- **Delivery Service**: GPS tracking and delivery management
- **ONDC Service**: ONDC protocol integration

## Communication Between Services

Services communicate with each other via:

1. HTTP REST API calls for synchronous operations
2. Event-driven architecture for asynchronous operations

## Database

The application uses a PostgreSQL database via Supabase for data persistence.

## Documentation

For detailed API documentation, see the `/docs` directory.

## License

MIT