import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Database, Table, Check, AlertTriangle, 
  Loader2, RefreshCw, ExternalLink 
} from 'lucide-react';

interface SupabaseTable {
  id: string;
  name: string;
  schema: string;
  description?: string;
}

interface ImportPayload {
  url: string;
  apiKey: string;
  table?: string;
  schema?: string;
}

const mockTables: SupabaseTable[] = [
  { id: '1', name: 'products', schema: 'public', description: 'Product catalog information' },
  { id: '2', name: 'categories', schema: 'public', description: 'Product categories' },
  { id: '3', name: 'orders', schema: 'public', description: 'Customer orders' },
  { id: '4', name: 'customers', schema: 'public', description: 'Customer information' },
  { id: '5', name: 'inventory', schema: 'public', description: 'Product inventory tracking' },
  { id: '6', name: 'payments', schema: 'public', description: 'Payment transactions' },
];

const SupabaseImportPage = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [selectedTable, setSelectedTable] = useState<SupabaseTable | null>(null);
  const [customSchema, setCustomSchema] = useState('public');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // In a real implementation, this would fetch tables from Supabase
  const [tables, setTables] = useState<SupabaseTable[]>(mockTables);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (data: ImportPayload) => {
      // This would be a real API call in a complete implementation
      const response = await fetch('/api/supabase/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import from Supabase');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage('Successfully imported data from Supabase');
      setErrorMessage(null);
      // In a complete implementation, this would update the list of services
      // queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setSuccessMessage(null);
    },
  });

  const handleTableSelect = (table: SupabaseTable) => {
    setSelectedTable(table);
    setCustomSchema(table.schema);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!supabaseUrl || !supabaseKey) {
      setErrorMessage('Supabase URL and API key are required');
      return;
    }
    
    const payload: ImportPayload = {
      url: supabaseUrl,
      apiKey: supabaseKey,
    };
    
    if (selectedTable) {
      payload.table = selectedTable.name;
      payload.schema = customSchema;
    }
    
    importMutation.mutate(payload);
  };

  const handleLoadTables = () => {
    if (!supabaseUrl || !supabaseKey) {
      setErrorMessage('Supabase URL and API key are required to load tables');
      return;
    }
    
    setIsLoadingTables(true);
    setErrorMessage(null);
    
    // In a real implementation, this would fetch tables from Supabase
    // Simulate API call
    setTimeout(() => {
      setTables(mockTables);
      setIsLoadingTables(false);
    }, 1000);
  };

  const handleClearForm = () => {
    setSupabaseUrl('');
    setSupabaseKey('');
    setSelectedTable(null);
    setCustomSchema('public');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleInsertSampleData = () => {
    setSupabaseUrl('https://example.supabase.co');
    setSupabaseKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  };

  return (
    <div className="supabase-import-container">
      <h1 className="dashboard-title">Supabase Import</h1>
      <p className="section-description">
        Import data from your Supabase project into the API Gateway. This tool allows you to connect and import tables directly.
      </p>
      
      {errorMessage && (
        <div className="result-message error">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="result-message success">
          <Check size={20} />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="import-form-container">
        <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label htmlFor="supabaseUrl">Supabase URL</label>
            <div className="flex">
              <input
                type="text"
                id="supabaseUrl"
                className="w-full"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                required
              />
              <button
                type="button"
                className="sample-data-btn"
                onClick={handleInsertSampleData}
              >
                Sample Data
              </button>
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="supabaseKey">Supabase API Key</label>
            <input
              type="password"
              id="supabaseKey"
              className="w-full"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="Your service role key or anon key"
              required
            />
          </div>
          
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">Tables</h3>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              onClick={handleLoadTables}
              disabled={isLoadingTables}
            >
              {isLoadingTables ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Load Tables
                </>
              )}
            </button>
          </div>
          
          {selectedTable && (
            <div className="form-group mb-6 p-3 border border-gray-700 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Selected Table</h4>
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-white"
                  onClick={() => setSelectedTable(null)}
                >
                  Clear Selection
                </button>
              </div>
              <div className="bg-gray-800 p-2 rounded mb-3">
                <div className="flex items-center gap-2">
                  <Table size={16} className="text-blue-400" />
                  <span className="font-mono">{selectedTable.schema}.{selectedTable.name}</span>
                </div>
                {selectedTable.description && (
                  <p className="text-sm text-gray-400 mt-1">{selectedTable.description}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="customSchema" className="text-sm">Destination Schema</label>
                <input
                  type="text"
                  id="customSchema"
                  value={customSchema}
                  onChange={(e) => setCustomSchema(e.target.value)}
                  placeholder="public"
                  className="text-sm p-2"
                />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button
              type="submit"
              className="import-submit-btn"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  Importing...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Import from Supabase
                </>
              )}
            </button>
            <button
              type="button"
              className="clear-form-btn"
              onClick={handleClearForm}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
      
      <div className="available-tables">
        <h2 className="text-xl font-semibold mb-4">Available Tables</h2>
        {tables.length === 0 ? (
          <p className="text-center text-gray-400 py-6">
            No tables available. Connect to your Supabase project to load tables.
          </p>
        ) : (
          <div className="tables-grid">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`table-card ${selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleTableSelect(table)}
              >
                <div className="table-icon">
                  <Table size={20} />
                </div>
                <div className="table-info">
                  <h3 className="table-name">{table.name}</h3>
                  <p className="table-description">{table.schema} • {table.description || 'No description'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <a
          href="https://supabase.com/docs/reference/javascript/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={16} />
          Supabase Documentation
        </a>
      </div>
    </div>
  );
};

export default SupabaseImportPage;