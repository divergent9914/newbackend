#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  env: { ...process.env, PORT: '3001' }
});

// Start the client
console.log('🚀 Starting ONDC E-commerce Client...');
const client = spawn('npx', ['vite'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client'),
  env: { ...process.env, VITE_HOST: '0.0.0.0', VITE_PORT: '5173' }
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  client.kill();
  process.exit();
});

// Handle server exit
server.on('close', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  client.kill();
  process.exit(code);
});

// Handle client exit
client.on('close', (code) => {
  console.log(`🛑 Client exited with code ${code}`);
  server.kill();
  process.exit(code);
});