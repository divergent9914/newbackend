import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, RefreshCcw, Settings } from 'lucide-react';
import { ServiceCard as ServiceCardType } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceCardType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="mr-2" dangerouslySetInnerHTML={{ __html: service.icon }} />
            <h3 className="text-sm font-medium text-neutral-darkest">{service.name}</h3>
          </div>
          <span className={`inline-flex px-2 text-xs font-semibold rounded-full 
            ${service.status === 'healthy' ? 'bg-status-success bg-opacity-10 text-status-success' : 
              service.status === 'warning' ? 'bg-status-warning bg-opacity-10 text-status-warning' : 
              'bg-status-error bg-opacity-10 text-status-error'}`}>
            {service.status === 'healthy' ? 'Healthy' : 
             service.status === 'warning' ? (service.name === 'Payment Service' ? 'High Latency' : 'Warning') : 
             'Error'}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-dark">Status</span>
            <span className="text-neutral-darkest font-medium">{service.stats.status}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-dark">Uptime</span>
            <span className="text-neutral-darkest font-medium">{service.stats.uptime}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-dark">Database</span>
            <span className="text-neutral-darkest font-medium">{service.stats.database}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-dark">Latency (avg)</span>
            <span className={`${
              service.stats.latencyValue > 200 ? 'text-status-warning' : 'text-neutral-darkest'
            } font-medium`}>{service.stats.latency}</span>
          </div>
        </div>
        
        <div className="border-t border-neutral-light pt-3">
          <h4 className="text-xs font-semibold text-neutral-dark mb-2">API Endpoints</h4>
          <ul className="text-xs space-y-1">
            {service.endpoints.map((endpoint, index) => (
              <li key={index} className={`p-1 rounded ${index % 2 === 0 ? 'bg-neutral-lightest bg-opacity-50' : ''}`}>
                <span className={`px-1 inline-flex text-xs font-semibold ${
                  endpoint.method === 'GET' ? 'text-primary' : 
                  endpoint.method === 'POST' ? 'text-secondary' : 
                  endpoint.method === 'PUT' ? 'text-accent' :
                  'text-status-error'
                }`}>{endpoint.method}</span>
                <span className="font-mono text-neutral-darkest">{endpoint.path}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button className="text-xs text-neutral-dark hover:text-neutral-darkest font-medium flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            Docs
          </button>
          <button className="text-xs text-neutral-dark hover:text-neutral-darkest font-medium flex items-center">
            <RefreshCcw className="h-3 w-3 mr-1" />
            Restart
          </button>
          <Link href={`/services/${service.name.split(' ')[0].toLowerCase()}`}>
            <a className="text-xs text-primary hover:text-primary-light font-medium flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              Manage
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
