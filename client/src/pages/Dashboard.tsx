import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Server, Database, RefreshCw, ExternalLink, 
  BarChart3, ShoppingCart, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface ServerStatus {
  status: string;
  timestamp: string;
  dbConnected: boolean;
  supabaseConnected: boolean;
}

const Dashboard = () => {
  const { data: serverStatus, isLoading, error, refetch } = useQuery<ServerStatus>({
    queryKey: ['serverStatus'],
    queryFn: async () => {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="system-status">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">System Status</h2>
          <button 
            onClick={() => refetch()} 
            className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-md"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        
        {isLoading ? (
          <p className="text-center py-4">Loading system status...</p>
        ) : error ? (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <p className="font-medium">Error connecting to the server</p>
            </div>
            <p className="mt-2 text-sm text-gray-300">Make sure the backend is running and try refreshing.</p>
          </div>
        ) : (
          <div className="status-details">
            <div className="mb-3">
              <span className="text-gray-400">Status:</span>
              <span className="status-badge ml-2">{serverStatus?.status}</span>
            </div>

            <div className="mb-3">
              <span className="text-gray-400">Last Updated:</span>
              <span className="ml-2">{serverStatus?.timestamp}</span>
            </div>

            <div className="mb-3">
              <span className="text-gray-400">Database:</span>
              <span 
                className={`connection-badge ml-2 ${
                  serverStatus?.dbConnected ? 'connected' : 'disconnected'
                }`}
              >
                {serverStatus?.dbConnected ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Disconnected
                  </span>
                )}
              </span>
            </div>

            <div className="mb-3">
              <span className="text-gray-400">Supabase:</span>
              <span 
                className={`connection-badge ml-2 ${
                  serverStatus?.supabaseConnected ? 'connected' : 'disconnected'
                }`}
              >
                {serverStatus?.supabaseConnected ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Disconnected
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <Server size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Total Services</h3>
            <p className="stat-value">0</p>
            <p className="stat-description">Registered microservices</p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <Database size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-title">API Calls</h3>
            <p className="stat-value">0</p>
            <p className="stat-description">Total API calls today</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Success Rate</h3>
            <p className="stat-value">0%</p>
            <p className="stat-description">API success rate</p>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-title">ONDC Requests</h3>
            <p className="stat-value">0</p>
            <p className="stat-description">ONDC protocol requests</p>
          </div>
        </div>
      </div>

      <div className="ondc-info">
        <h2 className="text-xl font-semibold mb-2">ONDC Integration</h2>
        <p className="text-gray-400 mb-4">
          Your API Gateway is compatible with Open Network for Digital Commerce (ONDC) protocol.
          Configure your services to participate in the ONDC network.
        </p>
        <div className="ondc-actions">
          <Link href="/ondc">
            <a className="btn btn-primary flex items-center gap-2">
              <ShoppingCart size={16} />
              Configure ONDC
            </a>
          </Link>
          <a 
            href="https://ondc.org/protocol-specifications.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={16} />
            ONDC Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;