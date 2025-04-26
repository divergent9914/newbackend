# Aamis Backend API

This is the API server for the Aamis Food Delivery application.

## Features

- RESTful API for food delivery management
- PostgreSQL database with Drizzle ORM
- Authentication and authorization
- Order processing and management
- Admin panel API endpoints

## Tech Stack

- Node.js with Express
- TypeScript
- PostgreSQL with Drizzle ORM
- JWT for authentication

## API Endpoints

### Auth
- `POST /api/auth/request-otp` - Request an OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP and authenticate

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get a category by slug
- `POST /api/categories` - Create a new category (admin)
- `PUT /api/categories/:id` - Update a category (admin)
- `DELETE /api/categories/:id` - Delete a category (admin)

### Products
- `GET /api/products` - Get all products (with optional category filter)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/by-category` - Get products grouped by category
- `GET /api/products/related/:id` - Get related products
- `GET /api/products/:id` - Get a product by ID
- `POST /api/products` - Create a new product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Kitchens
- `GET /api/kitchens` - Get all kitchens
- `GET /api/kitchens/:id` - Get a kitchen by ID
- `POST /api/kitchens` - Create a new kitchen (admin)
- `PUT /api/kitchens/:id` - Update a kitchen (admin)
- `DELETE /api/kitchens/:id` - Delete a kitchen (admin)

### Delivery Slots
- `GET /api/delivery-slots` - Get all delivery slots (with optional kitchen filter)
- `GET /api/delivery-slots/:id` - Get a delivery slot by ID
- `POST /api/delivery-slots` - Create a new delivery slot (admin)
- `PUT /api/delivery-slots/:id` - Update a delivery slot (admin)
- `DELETE /api/delivery-slots/:id` - Delete a delivery slot (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/user/:userId` - Get orders for a user
- `GET /api/orders/kitchen/:kitchenId` - Get orders for a kitchen (admin)
- `GET /api/orders/status/:status` - Get orders by status (admin)
- `GET /api/orders/:id` - Get an order by ID
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update an order's status (admin)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   PORT=5000
   ```
4. Run the database migrations:
   ```
   npm run db:push
   ```
5. Seed the database (optional):
   ```
   npm run db:seed
   ```
6. Start the development server:
   ```
   npm run dev
   ```

## Development

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run db:push` - Push schema changes to the database
- `npm run db:seed` - Seed the database with initial data