# ONDC E-commerce Frontend

The frontend application for the ONDC E-commerce Platform, optimized for deployment on Vercel.

## Technology Stack

- React 18 with TypeScript
- Vite for fast builds
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS with ShadCN UI
- React Hook Form with Zod validation
- React Leaflet for maps
- Stripe for payments

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

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add the required environment variables from `.env.example`
4. Deploy!

## Environment Variables

See `.env.example` for the required environment variables.

## API Communication

This frontend app communicates with the backend API deployed on Render. The API URL is configured via the `VITE_API_URL` environment variable.