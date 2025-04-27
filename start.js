const { spawn } = require('child_process');
const path = require('path');

// Start the server
console.log('Starting ONDC E-commerce Server...');
const server = spawn('tsx', ['watch', './server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// Start the client
console.log('Starting ONDC E-commerce Client...');
const client = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client')
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill();
  client.kill();
  process.exit();
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  client.kill();
  process.exit(code);
});

// Handle client exit
client.on('close', (code) => {
  console.log(`Client exited with code ${code}`);
  server.kill();
  process.exit(code);
});