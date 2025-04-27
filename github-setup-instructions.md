# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repositories
1. Go to https://github.com/new
2. Create a repository for the frontend (e.g., `ondc-frontend`)
3. Create a repository for the backend (e.g., `ondc-backend`)

## Step 2: Push Frontend Repository
```bash
cd frontend-repo
git remote add origin https://github.com/YOUR-USERNAME/ondc-frontend.git
git branch -M main
git push -u origin main
```

## Step 3: Push Backend Repository
```bash
cd ../backend-repo
git remote add origin https://github.com/YOUR-USERNAME/ondc-backend.git
git branch -M main
git push -u origin main
```

## Step 4: Setup Deployments

### Frontend (Vercel)
1. Go to https://vercel.com/new
2. Import the frontend repository
3. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: Your backend API URL (from Render)

### Backend (Render)
1. Go to https://dashboard.render.com/
2. Select "Blueprint" and connect your backend repository
3. Render will use the `render.yaml` file to set up all services
4. Add Environment Variables as needed:
   - `DATABASE_URL`
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `JWT_SECRET`
   - Other secrets as needed

## Step 5: Update Cross-Origin Settings
Once deployed, update these values:
1. In the backend, update `FRONTEND_URL` to point to your Vercel URL
2. In the frontend, update `VITE_API_URL` to point to your Render API URL

## Step 6: Test the Integration
1. Make a test API call from the frontend to the backend
2. Verify that CORS is working correctly
3. Test authentication flow if applicable