const http = require('http');

console.log('Testing ONDC E-commerce Server API...');

// Test server status endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/status',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', data);
    console.log('Server is running and responding to API requests!');
  });
});

req.on('error', (error) => {
  console.error('Error connecting to server:', error.message);
  console.log('Make sure to start the server with: node start.js');
});

req.end();