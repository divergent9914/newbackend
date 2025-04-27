const { spawnSync, spawn } = require('child_process');
const path = require('path');

/**
 * ONDC E-commerce Application Workflow
 * 
 * This workflow starts the server and client components of the ONDC e-commerce system.
 */
module.exports = {
  run: async ({ setUrl, onExit }) => {
    // Display startup banner
    console.log(`
==================================================
  ONDC E-commerce System - Starting Application
==================================================
Server: Express backend on port 3001
Client: React frontend on port 5173
==================================================
`);

    // Start the server
    console.log('🚀 Starting ONDC E-commerce Server...');
    const server = spawn('npx', ['tsx', 'watch', './server/index.ts'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: '3001' },
      detached: false
    });

    // Start the client
    console.log('🚀 Starting ONDC E-commerce Client...');
    const client = spawn('cd', ['client', '&&', 'npm', 'run', 'dev', '--', '--host', '0.0.0.0'], {
      stdio: 'inherit',
      shell: true,
      detached: false
    });

    // Set the preview URL to the client
    setUrl('http://localhost:5173');

    // Handle clean exit
    onExit(() => {
      if (server) {
        console.log('Shutting down server...');
        server.kill();
      }
      if (client) {
        console.log('Shutting down client...');
        client.kill();
      }
    });
  }
};