import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiRoute, AuthConfig } from '@/lib/types';

const ApiGateway: React.FC = () => {
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['/api/gateway/routes'],
  });

  if (routesLoading) {
    return <div>Loading API Gateway configuration...</div>;
  }

  const authConfigs: AuthConfig[] = [
    { 
      name: 'JWT Authentication', 
      description: 'Token expiration: 1 hour', 
      status: 'enabled' 
    },
    { 
      name: 'API Key Authentication', 
      description: 'For service-to-service communication', 
      status: 'enabled' 
    },
    { 
      name: 'OAuth 2.0 Integration', 
      description: 'For third-party access', 
      status: 'disabled' 
    },
    { 
      name: 'Rate Limiting', 
      description: '100 requests per minute', 
      status: 'enabled' 
    }
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-darkest">API Gateway Configuration</h2>
        <Button className="flex items-center gap-1">
          <Edit className="h-4 w-4" />
          Edit Configuration
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-3">Route Configuration</h3>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-neutral-lightest border-b border-neutral-light">
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Path</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-light">
                    {routes?.slice(0, 5).map((route: ApiRoute) => (
                      <tr key={route.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-darkest font-mono">{route.path}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-dark">{route.service}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Badge variant="outline" className={`
                            ${route.method === 'GET' ? 'bg-primary bg-opacity-10 text-primary' : 
                              route.method === 'POST' ? 'bg-secondary bg-opacity-10 text-secondary' : 
                              route.method === 'PUT' ? 'bg-accent bg-opacity-10 text-accent' :
                              'bg-status-error bg-opacity-10 text-status-error'}
                          `}>
                            {route.method}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 text-right">
              <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-light">
                View All Routes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-neutral-dark mb-3">Authentication Configuration</h3>
            <div className="space-y-4">
              {authConfigs.map((config, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-lightest rounded-md">
                  <div>
                    <p className="text-sm font-medium text-neutral-darkest">{config.name}</p>
                    <p className="text-xs text-neutral-dark mt-1">{config.description}</p>
                  </div>
                  <Badge variant="outline" className={`
                    ${config.status === 'enabled' ? 
                      'bg-status-success bg-opacity-10 text-status-success' : 
                      'bg-neutral-dark bg-opacity-10 text-neutral-dark'}
                  `}>
                    {config.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ApiGateway;
