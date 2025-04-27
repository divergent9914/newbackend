const { spawn } = require('child_process');
const path = require('path');

// Start the server
console.log('\n🚀 Starting ONDC E-commerce Server...');
const server = spawn('node', ['--require', 'esbuild-register', './server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill();
  process.exit();
});

// Handle server exit
server.on('close', (code) => {
  console.log(`\n🛑 Server exited with code ${code}`);
  process.exit(code);
});
