import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw, 
  Download, 
  AlertCircle, 
  Info, 
  CheckCircle
} from 'lucide-react';
import ServiceTopology from './ServiceTopology';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceStats } from '@/lib/types';

const SystemOverview: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/metrics'],
    staleTime: 30000, // 30 seconds
  });

  if (metricsLoading) {
    return <div>Loading system overview...</div>;
  }

  const serviceStats: ServiceStats[] = [
    {
      name: 'API Gateway',
      status: 'healthy',
      value: metrics?.[0]?.requestCount || 324,
      description: 'Requests in last hour',
      changeValue: '12%',
      changeDirection: 'up',
      changeDescription: 'from last hour'
    },
    {
      name: 'Microservices',
      status: metrics?.some(m => m.status === 'warning') ? 'warning' : 'healthy',
      value: `${metrics?.filter(m => m.status === 'healthy').length || 4}/${metrics?.length || 5}`,
      description: 'Services operational',
      additionalInfo: metrics?.find(m => m.status === 'warning')?.serviceName + ' service has high latency'
    },
    {
      name: 'ONDC Integration',
      status: 'healthy',
      value: '98.2%',
      description: 'Compliance score',
      additionalInfo: 'Last sync: 5 minutes ago',
      icon: 'info'
    },
    {
      name: 'System Health',
      status: 'healthy',
      value: '96.5%',
      description: 'Average uptime',
      additionalInfo: 'All databases connected',
      icon: 'check'
    }
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-darkest">System Overview</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {serviceStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-neutral-dark">{stat.name}</h3>
                <span className={`inline-flex px-2 text-xs font-semibold rounded-full 
                  ${stat.status === 'healthy' ? 'bg-status-success bg-opacity-10 text-status-success' : 
                    stat.status === 'warning' ? 'bg-status-warning bg-opacity-10 text-status-warning' : 
                    'bg-status-error bg-opacity-10 text-status-error'}`}>
                  {stat.status === 'healthy' ? 'Healthy' : 
                   stat.status === 'warning' ? 'Warning' : 
                   'Error'}
                </span>
              </div>
              <p className="text-2xl font-semibold text-neutral-darkest mb-2">{stat.value}</p>
              <p className="text-xs text-neutral-medium">{stat.description}</p>
              
              {stat.changeValue && stat.changeDirection && (
                <div className="mt-4 flex items-center text-xs">
                  {stat.changeDirection === 'up' ? (
                    <TrendingUp className="text-status-success h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="text-status-error h-4 w-4 mr-1" />
                  )}
                  <span className={`${
                    stat.changeDirection === 'up' ? 'text-status-success' : 'text-status-error'
                  } font-medium`}>
                    {stat.changeValue}
                  </span>
                  <span className="text-neutral-medium ml-1">{stat.changeDescription}</span>
                </div>
              )}

              {stat.additionalInfo && (
                <div className="mt-4 flex items-center text-xs">
                  {stat.icon === 'error' ? (
                    <AlertCircle className="text-status-error h-4 w-4 mr-1" />
                  ) : stat.icon === 'info' ? (
                    <Info className="text-status-info h-4 w-4 mr-1" />
                  ) : stat.icon === 'check' ? (
                    <CheckCircle className="text-status-success h-4 w-4 mr-1" />
                  ) : null}
                  <span className="text-neutral-medium">{stat.additionalInfo}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-neutral-dark mb-4">Service Topology</h3>
          <ServiceTopology />
        </CardContent>
      </Card>
    </section>
  );
};

export default SystemOverview;
