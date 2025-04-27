# Deployment Guide

This guide provides detailed instructions for deploying the ONDC E-commerce Platform using Vercel (frontend), Render (backend), and Supabase (database).

## 1. Prerequisites

Before deployment, ensure you have:

- A GitHub account and repository with your project code
- Access to Vercel, Render, and Supabase accounts
- All necessary API keys and credentials for:
  - Stripe
  - ONDC
  - PetPooja (if using their integration)
  - Any other third-party services required

## 2. Database Deployment (Supabase)

### 2.1 Create Supabase Project

1. Log in to [Supabase](https://app.supabase.io/)
2. Click "New Project"
3. Enter a name for your project
4. Set a secure database password
5. Choose a region closest to your users (e.g., Mumbai for Indian users)
6. Click "Create new project"

### 2.2 Configure Database Tables

There are two approaches for setting up the database:

#### Option A: Using Drizzle Schema Push (Recommended)

1. Update your `.env` file with the Supabase PostgreSQL connection string:
   ```
   DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

2. Run the schema push command:
   ```bash
   npm run db:push
   ```

#### Option B: Manual SQL Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query and paste the SQL schema from the `schema.sql` file
3. Run the query to create all necessary tables

### 2.3 Initialize Data (Optional)

For initial data setup, you can use the SQL editor to:

1. Create categories
2. Add sample products
3. Set up any required configuration data

### 2.4 Set Up Supabase Edge Functions (if needed)

For scheduled PetPooja synchronization:

1. Go to Edge Functions in the Supabase dashboard
2. Click "Create a new function"
3. Name it "petpooja-sync"
4. Upload the code from `supabase/functions/petpooja-sync/index.ts`
5. Set up the necessary secrets:
   ```bash
   supabase secrets set BACKEND_URL=https://your-backend-url.render.com
   ```
6. Configure scheduled execution with appropriate cron expressions

## 3. Backend Deployment (Render)

### 3.1 Prepare Backend for Deployment

1. Ensure your project includes a `start` script in `package.json`:
   ```json
   "scripts": {
     "start": "node dist/server/index.js",
     "build": "tsc"
   }
   ```

2. Configure the `build` command to compile TypeScript:
   ```json
   "build": "tsc -p server/tsconfig.json"
   ```

### 3.2 Deploy to Render

1. Log in to [Render](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ondc-ecommerce-api` (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Choose appropriate plan (Free for development, paid for production)

5. Set up environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_API_KEY`: Your Supabase service role API key
   - `PORT`: 3001 (or your preferred port)
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: URL of your frontend (Vercel deployment)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - Add all other required environment variables from `.env.example`

6. Click "Create Web Service"

### 3.3 Configure Auto-Deploy

1. Under "Settings" → "Build & Deploy", enable auto-deployment
2. Configure branch to deploy from (usually `main` or `production`)

### 3.4 Set Up Custom Domain (Optional)

1. Go to "Settings" → "Custom Domain"
2. Add your domain and follow the DNS configuration instructions

## 4. Frontend Deployment (Vercel)

### 4.1 Prepare Frontend for Deployment

1. Ensure you have a `build` script in your frontend `package.json`:
   ```json
   "scripts": {
     "build": "vite build"
   }
   ```

2. Set up environment variables for the frontend:
   - Create a `.env.production` file with required variables
   - Ensure all variables are prefixed with `VITE_` to be accessible in the frontend

### 4.2 Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/)
2. Click "Import Project" → "Import Git Repository"
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (if your frontend is in a subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Set up environment variables:
   - `VITE_API_URL`: URL of your backend on Render
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key
   - Add all other frontend environment variables from `.env.example`

6. Click "Deploy"

### 4.3 Configure Custom Domain

1. Go to "Settings" → "Domains"
2. Add your domain and follow the DNS configuration instructions

## 5. ONDC Integration Setup

### 5.1 ONDC Participant Registration

1. Register as an ONDC participant through [ONDC Gateway](https://gateway.ondc.org/)
2. Complete the onboarding process and obtain your ONDC Subscriber ID
3. Generate your signing key pair:
   ```bash
   # Generate private key
   openssl genrsa -out ondc_private_key.pem 2048
   
   # Generate public key
   openssl rsa -in ondc_private_key.pem -pubout -out ondc_public_key.pem
   ```

4. Register your public key with ONDC

### 5.2 Configure ONDC Environment Variables

Add the following to your backend environment variables on Render:

```
ONDC_SUBSCRIBER_ID=your-subscriber-id
ONDC_SIGNING_PRIVATE_KEY=your-private-key-content
ONDC_REGISTRY_URL=https://registry.ondc.org/
ONDC_API_URL=https://api.ondc.org/
```

**Note**: For the private key, you'll need to convert the multi-line key to a single line by replacing newlines with `\n`.

### 5.3 Set Up Callback Endpoints

Ensure your backend on Render exposes the necessary callback endpoints:

- `/ondc/on_search`
- `/ondc/on_select`
- `/ondc/on_init`
- `/ondc/on_confirm`
- `/ondc/on_status`

### 5.4 Verify Integration

Use the ONDC Gateway to verify your integration:

1. Log in to ONDC Gateway
2. Navigate to "Testing" → "API Testing"
3. Test each protocol endpoint and verify responses

## 6. PetPooja Integration

### 6.1 Register with PetPooja

1. Sign up for a PetPooja account at [PetPooja](https://www.petpooja.com/)
2. Set up your restaurant profile
3. Request API access from PetPooja support

### 6.2 Configure PetPooja Environment Variables

Add the following to your backend environment variables on Render:

```
PETPOOJA_API_KEY=your-api-key
PETPOOJA_RESTAURANT_ID=your-restaurant-id
PETPOOJA_USERNAME=your-username
PETPOOJA_PASSWORD=your-password
```

### 6.3 Set Up Menu Synchronization

Configure the scheduled sync using Supabase Edge Functions:

1. Set up the cron schedule for:
   - Every hour for availability sync: `0 * * * *`
   - Daily for menu sync: `0 0 * * *`

## 7. Stripe Integration

### 7.1 Create Stripe Account

1. Sign up at [Stripe](https://stripe.com/)
2. Complete the verification process
3. Obtain API keys from the Stripe Dashboard

### 7.2 Configure Stripe Environment Variables

Add the following to your environment variables:

- Backend (Render):
  ```
  STRIPE_SECRET_KEY=sk_test_your-secret-key
  ```

- Frontend (Vercel):
  ```
  VITE_STRIPE_PUBLIC_KEY=pk_test_your-public-key
  ```

### 7.3 Test Payment Integration

1. Use Stripe's test cards to verify the payment flow
2. Check that payment confirmations are being processed correctly
3. Verify webhook integration if used

## 8. Post-Deployment Verification

### 8.1 End-to-End Testing

1. Test the complete order flow from product selection to checkout
2. Verify payment processing
3. Check order creation and status updates
4. Test ONDC protocol operations

### 8.2 Performance Monitoring

Set up monitoring and logging:

1. Configure Render's logging integration
2. Set up error tracking with a service like Sentry
3. Implement uptime monitoring

### 8.3 Database Health Check

1. Monitor database performance in Supabase dashboard
2. Set up alerts for critical issues
3. Implement regular backups

## 9. Maintenance and Updates

### 9.1 Continuous Integration/Continuous Deployment (CI/CD)

1. Set up GitHub Actions for automated testing
2. Configure Render and Vercel for automatic deployments on main branch changes

### 9.2 Scheduled Maintenance

1. Plan regular maintenance windows
2. Communicate downtime to users if necessary
3. Regularly update dependencies and security patches

### 9.3 Scaling Considerations

As traffic grows:

1. Upgrade to higher-tier plans on Render
2. Consider implementing caching layers
3. Optimize database queries
4. Set up read replicas if needed

## 10. Troubleshooting Common Issues

### 10.1 Deployment Failures

- Check build logs on Vercel or Render
- Verify environment variables are correctly set
- Check for TypeScript or other compilation errors

### 10.2 Database Connection Issues

- Verify database connection string
- Check IP allow-list in Supabase
- Test connection with a simple query

### 10.3 API Integration Problems

- Check API keys and credentials
- Verify endpoint URLs
- Test API calls with Postman or similar tool

### 10.4 Payment Processing Errors

- Verify Stripe keys are correct
- Check webhook configurations
- Test with Stripe's testing tools