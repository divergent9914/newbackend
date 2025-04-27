# GitHub Setup Guide

This guide provides instructions for cleaning up the codebase and pushing it to GitHub for version control and future development.

## 1. Cleanup Before GitHub Push

### 1.1 Remove GitHubLoader Folder

The GitHubLoader folder contains reference implementation that is no longer needed. Remove it:

```bash
# Run this command from the project root
rm -rf GitHubLoader/
```

### 1.2 Create .gitignore File

Create a comprehensive `.gitignore` file to prevent unnecessary files from being committed:

```bash
# Create or update .gitignore file
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
out/
.next/
.nuxt/
.cache/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Operating system files
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE and editor folders
.idea/
.vscode/
*.sublime-project
*.sublime-workspace
.project
.classpath
.settings/
*.code-workspace

# Testing
coverage/
.nyc_output/
cypress/screenshots/
cypress/videos/

# Misc
.vercel
.netlify
.docusaurus
.serverless/
.fusebox/
.dynamodb/
.tern-port
.webpack/
.svelte-kit
.turbo

# Temporary directories
tmp/
temp/
.temp/

# Replit specific
.replit
.workflow/
screenshots/

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml
EOL
```

### 1.3 Check for Secrets and Sensitive Information

Make sure no secrets are accidentally committed:

```bash
# Search for potential secret keys, tokens, or credentials
grep -r "key\|secret\|password\|token\|credential" --include="*.{js,ts,jsx,tsx,json,md}" .
```

Review the output and ensure no actual secrets are in the code.

### 1.4 Create a README.md

Create a README file for your repository:

```bash
cat > README.md << 'EOL'
# ONDC E-commerce Platform

A scalable microservices-based e-commerce platform compatible with ONDC protocol, designed to provide a flexible and integrated digital commerce solution with enhanced user experience.

## Features

- Microservices Architecture (Order, Inventory, Payment, Delivery)
- ONDC Protocol Integration
- Node.js Backend with TypeScript
- Vite React Frontend
- State Management with Modern Web Technologies
- PetPooja Integration for Menu Management
- Centralized Delivery Location System

## Getting Started

See our [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) for detailed information on setup and development.

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

- Frontend: Vercel
- Backend: Render
- Database: Supabase

See our [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Documentation

- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Integration Guide](./docs/INTEGRATION_GUIDE.md)
- [GitHub Setup](./docs/GITHUB_SETUP.md)

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Supabase Auth
- **State Management**: Zustand, React Query
- **Payment Processing**: Stripe
- **Deployment**: Vercel, Render, Supabase

## License

This project is licensed under the MIT License - see the LICENSE file for details.
EOL
```

## 2. Git Setup and Initial Push

### 2.1 Initialize Git Repository

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ONDC E-commerce Platform"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in
2. Click the "+" icon in the top-right corner and select "New repository"
3. Enter repository name: `ondc-ecommerce` (or your preferred name)
4. Add a description: "A scalable microservices-based e-commerce platform compatible with ONDC protocol"
5. Choose visibility (Public or Private)
6. Leave "Initialize this repository with a README" unchecked
7. Click "Create repository"

### 2.3 Push to GitHub

Connect your local repository to GitHub and push the code:

```bash
# Add the GitHub repository as remote
git remote add origin https://github.com/your-username/ondc-ecommerce.git

# Push the code
git push -u origin main
```

## 3. Branch Structure

Set up a proper branch structure for collaborative development:

```bash
# Create development branch
git checkout -b develop
git push -u origin develop

# Create feature branch example
git checkout -b feature/payment-integration
git push -u origin feature/payment-integration
```

Recommended branch structure:

- `main` - Production-ready code
- `develop` - Integration branch for new features
- `feature/*` - For new features
- `bugfix/*` - For bug fixes
- `release/*` - For release preparation

## 4. GitHub Repository Setup

After pushing your code, complete these steps on GitHub:

### 4.1 Repository Settings

1. Go to repository Settings
2. Enable branch protection:
   - Go to Branches → Branch protection rules → Add rule
   - For "Branch name pattern" enter `main`
   - Enable "Require pull request reviews before merging"
   - Enable "Require status checks to pass before merging"
   - Save changes

### 4.2 GitHub Actions Setup (Optional)

Create a basic CI workflow:

```bash
mkdir -p .github/workflows
```

Create a file `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check types
      run: npm run typecheck
    
    - name: Lint
      run: npm run lint
    
    - name: Build
      run: npm run build
```

### 4.3 Create Issue Templates

Create issue templates for better collaboration:

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

Create a file `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG]'
labels: 'bug'
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete the following information):**
 - Device: [e.g. Desktop, iPhone]
 - OS: [e.g. Windows, iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

Create a file `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE]'
labels: 'enhancement'
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 5. Release Management

### 5.1 Versioning

Use semantic versioning for your releases:

- **Major version** (1.0.0): Incompatible API changes
- **Minor version** (0.1.0): Add functionality in a backward-compatible manner
- **Patch version** (0.0.1): Backward-compatible bug fixes

### 5.2 Creating Releases on GitHub

1. Go to repository → Releases → Draft a new release
2. Create a new tag based on your version (e.g., `v1.0.0`)
3. Set the target branch (usually `main` for releases)
4. Add a title and description for the release
5. Attach any binary assets if needed
6. Publish the release

## 6. Collaborative Development

### 6.1 Pull Request Workflow

1. Create a feature branch from `develop`
2. Make changes and commit
3. Push to GitHub
4. Create a Pull Request to merge into `develop`
5. Request reviews
6. After approval, merge the PR

### 6.2 Code Reviews

Guidelines for effective code reviews:

- Focus on code, not the person
- Be constructive and specific
- Check for security issues
- Verify adherence to project standards
- Test functionality
- Look for edge cases
- Suggest optimizations where applicable

## 7. Keeping Repository Clean

Regularly maintain your repository:

```bash
# Clean up merged branches
git branch --merged | grep -v "\*" | grep -v "main" | grep -v "develop" | xargs -n 1 git branch -d

# Prune remote tracking branches that no longer exist on remote
git fetch --prune
```

## 8. Documentation Updates

Keep documentation in sync with code changes:

- Update README.md with new features
- Maintain technical documentation in the docs folder
- Document APIs using OpenAPI specification
- Keep environment sample files up-to-date

## 9. Syncing Changes

To get the latest changes from GitHub:

```bash
# Fetch all changes
git fetch --all

# Update your current branch
git pull

# Update specific branch
git checkout develop
git pull origin develop
```