// Client workflow
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ONDC Client...');
const client = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '../client')
});

process.on('SIGINT', () => {
  console.log('Shutting down client...');
  client.kill();
  process.exit();
});

client.on('close', (code) => {
  console.log(`Client exited with code ${code}`);
  process.exit(code);
});