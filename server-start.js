const { spawn } = require('child_process');

// Start the server
console.log('Starting ONDC E-commerce Server...');
const server = spawn('tsx', ['watch', './server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit();
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});