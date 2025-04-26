import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, CheckCircle, AlertCircle, ArrowRightCircle, Database } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';

const SupabaseImportPage: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Query to check Supabase connection status
  const connectionQuery = useQuery({
    queryKey: ['/api/integrations/supabase/status'],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Mutation to import data from Supabase
  const importMutation = useMutation({
    mutationFn: async () => {
      setStatusMessage('Starting import from Supabase...');
      return await apiRequest('/api/integrations/supabase/import', '');
    },
    onSuccess: (data) => {
      setStatusMessage('Import completed successfully');
      queryClient.invalidateQueries({ queryKey: ['/api'] });
    },
    onError: (error) => {
      setStatusMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const isConnected = connectionQuery.data?.connected === true;
  const isLoading = connectionQuery.isLoading || importMutation.isPending;

  // Render connection status
  const renderConnectionStatus = () => {
    if (connectionQuery.isLoading) {
      return (
        <div className="flex items-center gap-2 text-neutral">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking connection...</span>
        </div>
      );
    }

    if (connectionQuery.isError) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {connectionQuery.error instanceof Error
              ? connectionQuery.error.message
              : 'Could not connect to Supabase. Please check your credentials.'}
          </AlertDescription>
        </Alert>
      );
    }

    if (isConnected) {
      return (
        <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Connected to Supabase</AlertTitle>
          <AlertDescription>
            Your Supabase connection is active and ready for data import.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>
          Could not establish connection to Supabase. Please check your API key and URL.
        </AlertDescription>
      </Alert>
    );
  };

  // Render import results
  const renderImportResults = () => {
    if (!importMutation.data) return null;
    
    const { stats } = importMutation.data;
    
    if (!stats) return null;
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Import Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Users</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Products</p>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">ONDC Integrations</p>
                <p className="text-2xl font-bold">{stats.ondcIntegrations}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Supabase Data Import</CardTitle>
            </div>
            <CardDescription>
              Import data from your Supabase instance to synchronize with the current system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderConnectionStatus()}

            <div className="mt-6">
              <Button
                onClick={() => importMutation.mutate()}
                disabled={isLoading || !isConnected}
                className="flex items-center gap-2"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRightCircle className="h-4 w-4" />
                )}
                Import from Supabase
              </Button>
              
              {statusMessage && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {statusMessage}
                </p>
              )}
              
              {importMutation.isPending && (
                <div className="mt-4">
                  <Progress value={importMutation.isPending ? 75 : 100} className="h-2" />
                </div>
              )}
            </div>

            {renderImportResults()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SupabaseImportPage;