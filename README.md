# ONDC E-commerce System

A comprehensive microservices-based e-commerce system with frontend, API gateway, and services (Order, Inventory, Payment, Delivery) that's compatible with the Open Network for Digital Commerce (ONDC) protocol.

## Project Overview

This project consists of two main components:
1. Customer-facing storefront for browsing and purchasing products
2. Admin panel for managing ONDC integration and monitoring operations

### Technology Stack

- **Frontend**: React with Vite, TailwindCSS, Shadcn UI components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: Zustand, React Query
- **Routing**: Wouter
- **Form Management**: React Hook Form with Zod validation

## Architecture

The application follows a client-server architecture:

- **Client**: The React frontend that handles user interactions and displays data
- **Server**: An Express backend that manages API routes and data persistence
- **Database**: PostgreSQL for data storage (with MemStorage as a fallback)

## Project Structure

```
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── lib/           # Utilities and shared code
│       ├── pages/         # Page components
│       └── styles/        # CSS styles
├── server/                # Backend Express application
│   ├── src/               # Server source code
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage interface
│   ├── db.ts              # Database connection
│   └── supabase.ts        # Supabase connection (for integration)
├── shared/                # Shared code between client and server
│   ├── types/             # TypeScript type definitions
│   └── schema.ts          # Database schema definitions
├── GitHubLoader/          # Reference code for UI/UX and ONDC integration
├── drizzle.config.ts      # Drizzle ORM configuration
└── start.js               # Application startup script
```

## Database Schema

The application uses the following database tables, defined in `shared/schema.ts`:

- `users`: User accounts and authentication
- `products`: Product catalog with details and pricing
- `orders`: Customer orders with status tracking
- `order_items`: Individual items in orders
- `payments`: Payment records associated with orders
- `deliveries`: Delivery information and status
- `api_routes`: API route configurations for ONDC integration
- `ondc_integration`: ONDC integration settings and credentials
- `service_metrics`: Metrics for monitoring service performance

## Storage Implementation

The application supports two storage implementations:

1. **DatabaseStorage**: Uses PostgreSQL with Drizzle ORM
2. **MemStorage**: In-memory storage for development/testing

The active storage is determined by the environment variable `USE_DATABASE`. If set to 'true', DatabaseStorage is used; otherwise, MemStorage is used.

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- PostgreSQL database

### Environment Variables

The following environment variables are required:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
USE_DATABASE=true
SUPABASE_URL=your-supabase-url
SUPABASE_API_KEY=your-supabase-api-key
```

### Running the Application

To start both client and server components:

```bash
node start.js
```

This will start:
- Backend server on port 3001
- Frontend development server on port 5173

### Database Migrations

To apply database migrations:

```bash
npx drizzle-kit push
```

## API Routes

The backend server provides the following API routes:

- **Authentication**: `/api/auth/login`
- **Products**: CRUD operations on `/api/products`
- **Orders**: CRUD operations on `/api/orders`
- **ONDC Integration**: 
  - Search: `/api/ondc/search`
  - Select: `/api/ondc/select`
  - Initialize: `/api/ondc/init`
  - Confirm: `/api/ondc/confirm`
  - Status: `/api/ondc/status`

## ONDC Integration

The application is compatible with the Open Network for Digital Commerce (ONDC) protocol, supporting:

1. Buyer App functionalities
2. Seller App functionalities
3. Gateway integration

Refer to the routes in `server/routes.ts` for specific ONDC protocol handlers.

## Deployment

The recommended deployment strategy is:

- Frontend: Vercel or similar static hosting platform
- Backend: Render, Heroku, or similar containerized service platform
- Database: Managed PostgreSQL service (Neon, AWS RDS, etc.)

## Development Guidelines

- Follow the storage interface in `server/storage.ts` for all database operations
- Use Drizzle ORM for database queries
- Keep business logic in the backend, using the frontend primarily for presentation
- Ensure API routes are properly validated with Zod schemas
- Use React Query for data fetching and cache management
- Follow the component structure in the GitHubLoader directory for UI consistency

## Current State and Next Steps

The current implementation includes:

- ✅ Complete database schema with relations
- ✅ Storage interfaces for all entity types
- ✅ Server and client startup configuration
- ✅ PostgreSQL database setup with Drizzle ORM
- ✅ Database schema migrations

Next steps for development:

- Set up proper Replit workflow for continuous running
- Implement client-side components for product browsing and ordering
- Complete the ONDC protocol integration in the admin panel
- Add authentication and user management features
- Implement order tracking and delivery management
- Add payment processing integration

## License

MIT