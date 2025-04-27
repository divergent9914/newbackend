// Start server in main process
require('./server/index');

// Start client in background via child process
const { execSync } = require('child_process');
console.log('Starting client...');
execSync('cd client && npx vite --host 0.0.0.0', { stdio: 'inherit' });