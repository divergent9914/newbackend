# ONDC E-commerce Platform Documentation

## System Overview

The ONDC E-commerce Platform is a scalable, microservices-based application designed to provide a comprehensive digital commerce solution that's compatible with the Open Network for Digital Commerce (ONDC) protocol. The system focuses on delivering food ordering capabilities similar to platforms like Swiggy, Dominos, or Licious.

### Key Components

1. **Customer-Facing Storefront**: A responsive web application for browsing products, adding items to cart, and completing orders.
2. **Admin Panel/API Gateway**: Backend management system for ONDC integration, inventory management, and order processing.
3. **Microservices Architecture**: Separate services for orders, inventory, payments, and delivery.
4. **Database Layer**: PostgreSQL database with Drizzle ORM for data modeling and persistence.
5. **External Integrations**: Connections to ONDC, PetPooja, Stripe, and other services.

## Technology Stack

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **API Documentation**: OpenAPI specification
- **Authentication**: Supabase Auth (optional)

### Database
- **DBMS**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Schema Validation**: Zod
- **Migrations**: Drizzle Kit

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase
- **Scheduled Tasks**: Supabase Edge Functions

### External Services
- **Payment Processing**: Stripe
- **Menu Management**: PetPooja
- **Digital Commerce**: ONDC Protocol

## Architecture

```
                     ┌─────────────────┐
                     │   Client Side   │
                     │   (React/Vite)  │
                     └─────────┬───────┘
                               │
                               ▼
┌───────────────────────────────────────────────────┐
│                  API Gateway                       │
│                (Express/Node.js)                   │
└───┬───────────────┬────────────────┬──────────────┘
    │               │                │
    ▼               ▼                ▼
┌─────────┐   ┌───────────┐   ┌─────────────┐
│ Order   │   │ Inventory │   │   Payment   │
│ Service │   │  Service  │   │   Service   │
└────┬────┘   └─────┬─────┘   └──────┬──────┘
     │              │                │
     └──────────────┼────────────────┘
                    │
                    ▼
          ┌───────────────────┐
          │   Database Layer  │
          │    (PostgreSQL)   │
          └───────────────────┘
```

## Database Schema

The system uses the following primary tables:

### Users
- Stores customer and administrator account information
- Fields: id, username, email, password (hashed), role, etc.

### Products
- Contains product catalog information
- Fields: id, name, description, price, categoryId, imageUrl, isVeg, stock, etc.

### Orders
- Tracks customer orders
- Fields: id, userId, status, totalAmount, createdAt, etc.

### Order Items
- Links products to orders with quantity and pricing
- Fields: id, orderId, productId, quantity, price, etc.

### Payments
- Records payment transactions
- Fields: id, orderId, amount, status, provider, etc.

### Deliveries
- Manages delivery information
- Fields: id, orderId, status, address, etc.

### ONDC Integration
- Stores ONDC protocol metadata and transactions
- Fields: id, transactionId, messageId, status, etc.

## API Endpoints

### Customer-Facing APIs

#### Authentication
- `POST /auth/login`: User login
- `POST /auth/logout`: User logout

#### Products
- `GET /products`: List all products
- `GET /products/:id`: Get product details
- `GET /products?category=:categorySlug`: Filter products by category

#### Cart & Orders
- `POST /orders`: Create a new order
- `GET /orders/:id`: Get order details
- `GET /orders`: List user orders

#### Checkout & Payment
- `POST /api/create-payment-intent`: Create Stripe payment intent
- `POST /api/get-or-create-subscription`: Create/get subscription (if applicable)

### Admin APIs

#### Product Management
- `POST /products`: Create product
- `PUT /products/:id`: Update product
- `DELETE /products/:id`: Delete product

#### Order Management
- `GET /orders`: List all orders
- `PUT /orders/:id`: Update order status

#### ONDC Protocol
- `POST /ondc/search`: ONDC search
- `POST /ondc/select`: ONDC select
- `POST /ondc/init`: ONDC init
- `POST /ondc/confirm`: ONDC confirm
- `POST /ondc/status`: ONDC status

#### PetPooja Integration
- `POST /admin/petpooja/sync-menu`: Sync menu from PetPooja
- `POST /admin/petpooja/sync-availability`: Sync item availability

## User Flows

### Customer Journey

1. **Product Discovery**:
   - Customer visits the storefront
   - Browses products by category
   - Views product details

2. **Cart Management**:
   - Adds products to cart
   - Adjusts quantities
   - Reviews cart contents

3. **Checkout Process**:
   - Provides delivery information
   - Selects payment method
   - Reviews order summary
   - Completes payment

4. **Order Tracking**:
   - Receives order confirmation
   - Views order status
   - Receives delivery updates

### Admin Journey

1. **Dashboard Overview**:
   - Views sales metrics
   - Monitors active orders
   - Tracks inventory levels

2. **Inventory Management**:
   - Updates product information
   - Manages stock levels
   - Syncs with PetPooja

3. **Order Processing**:
   - Reviews incoming orders
   - Updates order statuses
   - Manages deliveries

4. **ONDC Integration**:
   - Monitors ONDC transactions
   - Tests protocol endpoints
   - Views integration metrics

## Configuration

### Environment Variables

The system requires several environment variables for proper operation, including:

- Server configuration (PORT, NODE_ENV)
- Database connection (DATABASE_URL)
- Supabase credentials (SUPABASE_URL, SUPABASE_API_KEY)
- Stripe API keys (STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY)
- ONDC credentials (ONDC_SUBSCRIBER_ID, ONDC_SIGNING_PRIVATE_KEY)
- PetPooja integration keys (PETPOOJA_API_KEY, PETPOOJA_RESTAURANT_ID)
- Delivery location settings (CENTRAL_LOCATION_LAT, CENTRAL_LOCATION_LNG)

See `.env.example` for a complete list of required variables.

## Deployment

The application uses a multi-platform deployment strategy:

- **Frontend**: Deployed on Vercel for optimal React application hosting
- **Backend**: Hosted on Render for reliable API service
- **Database**: Powered by Supabase PostgreSQL for managed database hosting
- **Scheduled Tasks**: Implemented with Supabase Edge Functions

For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT_GUIDE.md).

## Integration Details

### ONDC Protocol Integration

The platform implements the ONDC protocol as specified by the [ONDC Gateway](https://gateway.ondc.org/). This includes:

- Protocol-compliant API endpoints
- Digital signing and cryptographic verification
- Transaction logging and status tracking
- Callback handling for asynchronous responses

For detailed ONDC integration instructions, see the [Integration Guide](./INTEGRATION_GUIDE.md).

### PetPooja Integration

The system connects with PetPooja for restaurant menu management:

- Menu synchronization
- Item availability updates
- Category mapping
- Pricing synchronization

For detailed PetPooja integration instructions, see the [Integration Guide](./INTEGRATION_GUIDE.md).

### Stripe Payment Processing

Payment processing is handled through Stripe:

- One-time payments with Payment Intents
- Optional subscription support
- Secure client-side Elements integration
- Server-side payment confirmation

## Development Guidelines

### Code Structure

The codebase is organized as follows:

```
/
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utility functions and stores
│       ├── pages/       # Page components
│       └── styles/      # Global styles
│
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data access layer
│   ├── db.ts            # Database connection
│   └── integrations/    # External service integrations
│
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema and types
│
└── docs/                # Documentation
```

### Development Workflow

1. **Feature Development**:
   - Create a feature branch from `develop`
   - Implement and test locally
   - Submit a pull request to `develop`

2. **Release Preparation**:
   - Merge `develop` to `release` branch
   - Conduct final testing
   - Prepare documentation updates

3. **Deployment**:
   - Merge `release` to `main`
   - Deploy to production
   - Tag the release with version number

## Maintenance

### Backups

Database backups should be configured in Supabase:

- Daily automated backups
- Point-in-time recovery enabled
- Manual backups before major updates

### Monitoring

Implement monitoring for:

- API response times and error rates
- Database performance metrics
- Payment processing success rates
- Integration health (ONDC, PetPooja)

### Updates and Patches

Regular maintenance should include:

- Dependency updates (npm audit fix)
- Security patches
- Performance optimizations
- Feature enhancements based on user feedback

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL environment variable
   - Check Supabase service status
   - Confirm IP allow-listing in Supabase

2. **API Integration Failures**:
   - Validate API credentials
   - Check request/response formats
   - Review error logs for specific issues

3. **Payment Processing Problems**:
   - Verify Stripe API keys
   - Test with Stripe test cards
   - Check backend logs for error details

4. **Deployment Issues**:
   - Review build logs in Vercel/Render
   - Confirm environment variables are set
   - Check compatibility of dependencies

## Support and Resources

- [ONDC Documentation](https://docs.ondc.org/)
- [PetPooja API Documentation](https://petpooja.com/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)

## Future Enhancements

Planned future improvements include:

1. **Multi-location Support**:
   - Expand beyond the central AAMIS location
   - Implement franchise management
   - Add distance-based delivery pricing

2. **Advanced Analytics**:
   - Customer behavior tracking
   - Sales forecasting
   - Inventory optimization

3. **Mobile Applications**:
   - Native iOS and Android apps
   - Push notifications
   - Offline support

4. **Enhanced ONDC Integration**:
   - Additional protocol features
   - Multi-provider support
   - Advanced logistics integration