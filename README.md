# ONDC E-commerce Platform

A scalable microservices-based e-commerce platform compatible with ONDC protocol, designed to provide a flexible and integrated digital commerce solution with enhanced user experience.

## Features

- **Microservices Architecture**: Order, Inventory, Payment, Delivery services
- **ONDC Protocol Integration**: Compatible with the Open Network for Digital Commerce
- **Node.js Backend**: Express server with TypeScript for type safety
- **Vite React Frontend**: Modern React application with Vite for fast development
- **State Management**: Zustand for state management and React Query for data fetching
- **Database**: PostgreSQL database with Drizzle ORM for data modeling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **PetPooja Integration**: Item availability toggled through PetPooja order app
- **Centralized Delivery**: Based from AAMIS, Hakimapara, Siliguri

## System Architecture

The application consists of two main components:

1. **Customer-Facing Storefront**: The main e-commerce interface for customers to browse and order products.
2. **Admin Panel / API Gateway**: The backend management system for ONDC integration and store operations.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database
- Supabase account (for production)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ondc-ecommerce.git
   cd ondc-ecommerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Frontend Deployment (Vercel)

The React frontend should be deployed on Vercel:
- Connect GitHub repository to Vercel
- Configure build settings:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`

### Backend Deployment (Render)

The Node.js backend should be deployed on Render:
- Connect GitHub repository to Render
- Configure as a Web Service with:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start:server`

### Database (Supabase)

- Create a Supabase project
- Use the PostgreSQL connection string in your backend's environment variables
- Set up Supabase Edge Functions for specific functionality

## Key Components

### Customer Interface
- **Homepage**: Displays food products organized by category
- **Product Detail**: Shows detailed information about a food item
- **Cart**: Side panel showing selected items
- **Checkout**: Form for order details and payment
- **Order Success**: Confirmation page after successful order

### Admin Interface
- **Dashboard**: Overview of store performance
- **ONDC Integration**: Connectivity with ONDC network
- **API Gateway**: Monitor and manage API endpoints
- **GitHub Loader**: Import components from GitHub
- **Supabase Import**: Database configuration

## Integration Points

- **ONDC Protocol**: Integrates with Open Network for Digital Commerce
- **PetPooja**: Menu and availability management
- **Stripe**: Payment processing
- **Supabase**: Database, auth, and edge functions

## Central Delivery Location

All delivery distances are calculated from AAMIS, Hakimapara, Siliguri until additional franchise locations are added.

## Documentation

Detailed documentation is available in the docs folder:

- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md): Comprehensive system details
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md): Step-by-step deployment instructions
- [Integration Guide](./docs/INTEGRATION_GUIDE.md): PetPooja and ONDC integration details
- [GitHub Setup](./docs/GITHUB_SETUP.md): Version control and GitHub workflow

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Supabase Auth
- **State Management**: Zustand, React Query
- **Payment Processing**: Stripe
- **Deployment**: Vercel, Render, Supabase

## License

This project is licensed under the MIT License