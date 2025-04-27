const { spawn } = require('child_process');
const path = require('path');

// Start the client
console.log('Starting ONDC E-commerce Client...');
const client = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client')
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down client...');
  client.kill();
  process.exit();
});

// Handle client exit
client.on('close', (code) => {
  console.log(`Client exited with code ${code}`);
  process.exit(code);
});