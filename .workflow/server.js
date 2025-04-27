// Server workflow
const { spawn } = require('child_process');

console.log('Starting ONDC Server...');
const server = spawn('tsx', ['watch', './server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit();
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});