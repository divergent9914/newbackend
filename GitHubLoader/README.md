# Aamis Food Delivery App

A modern food delivery application with user and admin interfaces, built with React, Express, and PostgreSQL.

## Project Structure

This project consists of two main parts:

1. **Client**: React-based frontend with modern UI components
2. **Backend**: Express.js API server with PostgreSQL database

## Frontend Features

- Modern UI with responsive design
- Product catalog with categories
- Shopping cart functionality
- User authentication
- Order management
- Admin dashboard for inventory and order management

## Backend Features

- RESTful API endpoints
- PostgreSQL database integration with Drizzle ORM
- Structured in MVC pattern
- Authentication and authorization
- Order processing system

## Technologies Used

- **Frontend**:
  - React
  - TanStack Query (React Query)
  - Tailwind CSS
  - Axios for API calls

- **Backend**:
  - Node.js with Express
  - PostgreSQL with Drizzle ORM
  - TypeScript

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL database

### Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the backend directory with the following:
   ```
   DATABASE_URL=your_postgresql_connection_string
   PORT=5000
   ```

4. Set up the frontend:
   ```
   npm install
   ```

5. Start the development servers:
   - For backend: `cd backend && npm run dev`
   - For frontend: `npm run dev`

## API Documentation

API documentation is available at `/api/docs` when the server is running.