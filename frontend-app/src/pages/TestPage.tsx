import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const TestPage = () => {
  const [message, setMessage] = useState<string>('');

  // Query to check server status
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/status');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  // Test sending a message to the server
  const sendTestMessage = async () => {
    try {
      setMessage('Sending test message...');
      
      // Test simple GET request
      const response = await fetch('http://localhost:3001/api/status');
      const result = await response.json();
      
      setMessage(`Server responded: ${JSON.stringify(result)}`);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ONDC E-commerce System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">Server Status</h2>
            <p className="text-gray-600">Check if the backend server is running</p>
          </div>
          <div className="p-4">
            {isLoading && <p>Checking server status...</p>}
            {isError && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-lg font-medium text-red-800">Server Connection Error</h3>
                <p className="text-red-700">
                  {error instanceof Error ? error.message : 'Failed to connect to the server'}
                </p>
              </div>
            )}
            {data && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <h3 className="text-lg font-medium text-green-800">Server Online</h3>
                <pre className="mt-2 text-sm text-green-700 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Refresh Status
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">Test API Connection</h2>
            <p className="text-gray-600">Send a test request to the server</p>
          </div>
          <div className="p-4">
            <button 
              onClick={sendTestMessage} 
              className="mb-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Send Test Request
            </button>
            
            {message && (
              <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800">Response</h3>
                <p className="mt-2 text-sm text-blue-700 whitespace-pre-wrap">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;