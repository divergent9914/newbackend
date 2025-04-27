/**
 * Quick Preview Script for the ONDC E-commerce Application
 */
const { spawn, exec } = require('child_process');
const http = require('http');

// Clear the console
console.clear();

// Banner
console.log(`
==================================================
  ONDC E-commerce Application Preview
==================================================
`);

// Start the server component
console.log('🚀 Starting server...');
const server = spawn('node', ['--loader', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// Start the client component
console.log('🚀 Starting client...');
const client = spawn('cd client && npx vite --host 0.0.0.0', {
  stdio: 'inherit',
  shell: true
});

// Wait for client to be ready and display info
setTimeout(() => {
  console.log(`
==================================================
  Application Components:
  
  - Customer Storefront: http://localhost:5173/
  - Admin Panel: http://localhost:5173/admin
  - API: http://localhost:3001/api
==================================================
  
  Key Features:
  - Product browsing and ordering
  - Shopping cart functionality
  - Order management
  - ONDC Protocol Integration
  - Stripe Payment Processing
==================================================

  Press Ctrl+C to stop the application
==================================================
`);
}, 5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down application...');
  
  if (server) {
    console.log('Stopping server...');
    server.kill();
  }
  
  if (client) {
    console.log('Stopping client...');
    client.kill();
  }
  
  process.exit(0);
});