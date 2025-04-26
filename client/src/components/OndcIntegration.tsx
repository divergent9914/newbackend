import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderSync, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OndcEndpoint, OndcProtocolStatus } from '@/lib/types';

const OndcIntegration: React.FC = () => {
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/ondc/integrations'],
  });

  if (integrationsLoading) {
    return <div>Loading ONDC integration data...</div>;
  }

  const protocolStatus: OndcProtocolStatus = {
    sellerApis: { compliance: 100 },
    buyerApis: { compliance: 94 },
    gatewayApis: { compliance: 86 }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-darkest">ONDC Integration</h2>
        <Button className="flex items-center gap-1">
          <FolderSync className="h-4 w-4" />
          FolderSync Config
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-darkest">ONDC Protocol Status</h3>
              <p className="text-xs text-neutral-dark mt-1">Last compliance check: 2 hours ago</p>
            </div>
            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">
              Connected
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-neutral-lightest rounded-md">
              <div className="flex items-center">
                <CheckCircle className="text-primary h-4 w-4 mr-2" />
                <h4 className="text-xs font-medium text-neutral-darkest">Seller App APIs</h4>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-dark">Compliance</span>
                <span className="text-xs font-medium text-neutral-darkest">{protocolStatus.sellerApis.compliance}%</span>
              </div>
              <Progress className="h-1.5 mt-1" value={protocolStatus.sellerApis.compliance} />
            </div>
            
            <div className="p-3 bg-neutral-lightest rounded-md">
              <div className="flex items-center">
                <CheckCircle className="text-primary h-4 w-4 mr-2" />
                <h4 className="text-xs font-medium text-neutral-darkest">Buyer App APIs</h4>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-dark">Compliance</span>
                <span className="text-xs font-medium text-neutral-darkest">{protocolStatus.buyerApis.compliance}%</span>
              </div>
              <Progress className="h-1.5 mt-1" value={protocolStatus.buyerApis.compliance} />
            </div>
            
            <div className="p-3 bg-neutral-lightest rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="text-status-warning h-4 w-4 mr-2" />
                <h4 className="text-xs font-medium text-neutral-darkest">Gateway APIs</h4>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-dark">Compliance</span>
                <span className="text-xs font-medium text-neutral-darkest">{protocolStatus.gatewayApis.compliance}%</span>
              </div>
              <Progress className="h-1.5 mt-1" value={protocolStatus.gatewayApis.compliance} />
            </div>
          </div>
          
          <div className="border-t border-neutral-light pt-4 mt-2">
            <h3 className="text-sm font-medium text-neutral-darkest mb-3">ONDC API Endpoints</h3>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-neutral-lightest border-b border-neutral-light">
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Path</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Mapped Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-light">
                    {integrations?.map((endpoint: OndcEndpoint) => (
                      <tr key={endpoint.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-darkest font-mono">{endpoint.endpoint}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-dark">{endpoint.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-dark">{endpoint.mappedService}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Badge variant="outline" className={`inline-flex items-center 
                            ${endpoint.status === 'active' ? 'bg-status-success bg-opacity-10 text-status-success' : 
                              endpoint.status === 'slow' ? 'bg-status-warning bg-opacity-10 text-status-warning' : 
                              'bg-status-error bg-opacity-10 text-status-error'}
                          `}>
                            {endpoint.status === 'active' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {endpoint.status === 'active' ? 'Active' : 
                             endpoint.status === 'slow' ? 'Slow' : 
                             'Error'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default OndcIntegration;
