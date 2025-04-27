#!/bin/bash

# Script to prepare the codebase for GitHub

# Print banner
echo "====================================================="
echo "   Preparing ONDC E-commerce Platform for GitHub     "
echo "====================================================="

# Step 1: Remove GitHubLoader folder
echo "Step 1: Removing GitHubLoader folder..."
if [ -d "GitHubLoader" ]; then
  rm -rf GitHubLoader
  echo "✅ GitHubLoader folder removed"
else
  echo "⚠️ GitHubLoader folder not found, skipping"
fi

# Step 2: Remove any temporary or system files
echo "Step 2: Removing temporary and system files..."
find . -name ".DS_Store" -type f -delete
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete
echo "✅ Temporary files removed"

# Step 3: Check for any potential secrets in the codebase
echo "Step 3: Checking for potential secrets in the code..."
grep -r "key\|secret\|password\|token\|credential" --include="*.{js,ts,jsx,tsx,json,md}" . | grep -v ".env.example" | grep -v "docs/DEPLOYMENT_GUIDE.md" | grep -v "docs/INTEGRATION_GUIDE.md" | grep -v "docs/PROJECT_DOCUMENTATION.md" | grep -v "package.json" | grep -v ".gitignore"
echo "⚠️ Review the above output for any actual secrets that should be removed before pushing to GitHub"

# Step 4: Ensure documentation is properly formatted
echo "Step 4: Checking documentation files..."
for doc in README.md docs/*.md; do
  if [ -f "$doc" ]; then
    echo "✅ Found documentation file: $doc"
  fi
done

# Step 5: Ensure .gitignore is present
echo "Step 5: Checking for .gitignore file..."
if [ -f ".gitignore" ]; then
  echo "✅ .gitignore file is present"
else
  echo "❌ .gitignore file is missing, creating one..."
  cat > .gitignore << 'EOL'
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*
!.env.example

# Build outputs
dist/
build/

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE folders
.idea/
.vscode/

# GitHubLoader folder (reference implementation)
GitHubLoader/

# Replit specific
.replit
.workflow/
screenshots/
EOL
  echo "✅ Created .gitignore file"
fi

# Step 6: Ensure .env.example is present
echo "Step 6: Checking for .env.example file..."
if [ -f ".env.example" ]; then
  echo "✅ .env.example file is present"
else
  echo "❌ .env.example file is missing, creating one..."
  cat > .env.example << 'EOL'
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
VITE_STRIPE_PUBLIC_KEY=pk_test_your-key

# ONDC
ONDC_SUBSCRIBER_ID=your-id
ONDC_REGISTRY_URL=https://registry.ondc.org/

# PetPooja
PETPOOJA_API_KEY=your-key
PETPOOJA_RESTAURANT_ID=your-id

# Central Location
CENTRAL_LOCATION_LAT=26.7271
CENTRAL_LOCATION_LNG=88.3953
EOL
  echo "✅ Created .env.example file"
fi

# Step 7: Provide final instructions
echo "====================================================="
echo "✅ Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review any potential secrets identified above"
echo "2. Initialize Git repository with:"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Initial commit: ONDC E-commerce Platform\""
echo ""
echo "3. Create GitHub repository and push:"
echo "   git remote add origin https://github.com/your-username/ondc-ecommerce.git"
echo "   git push -u origin main"
echo "====================================================="