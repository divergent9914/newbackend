import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceCard from './ServiceCard';
import { ServiceCard as ServiceCardType } from '@/lib/types';

const Microservices: React.FC = () => {
  const services: ServiceCardType[] = [
    {
      id: 1,
      name: 'Order Service',
      icon: '<span class="material-icons text-secondary mr-2">shopping_cart</span>',
      status: 'healthy',
      stats: {
        status: 'Running (3 instances)',
        uptime: '5d 12h 34m',
        database: 'PostgreSQL (Connected)',
        databaseStatus: 'Connected',
        latency: '45ms',
        latencyValue: 45
      },
      endpoints: [
        { method: 'GET', path: '/api/v1/orders' },
        { method: 'POST', path: '/api/v1/orders' },
        { method: 'GET', path: '/api/v1/orders/{id}' },
        { method: 'PUT', path: '/api/v1/orders/{id}' }
      ]
    },
    {
      id: 2,
      name: 'Inventory Service',
      icon: '<span class="material-icons text-secondary mr-2">inventory_2</span>',
      status: 'healthy',
      stats: {
        status: 'Running (2 instances)',
        uptime: '5d 11h 22m',
        database: 'MongoDB (Connected)',
        databaseStatus: 'Connected',
        latency: '38ms',
        latencyValue: 38
      },
      endpoints: [
        { method: 'GET', path: '/api/v1/inventory' },
        { method: 'GET', path: '/api/v1/inventory/{id}' },
        { method: 'PUT', path: '/api/v1/inventory/{id}' },
        { method: 'POST', path: '/api/v1/inventory/batch' }
      ]
    },
    {
      id: 3,
      name: 'Payment Service',
      icon: '<span class="material-icons text-status-warning mr-2">payments</span>',
      status: 'warning',
      stats: {
        status: 'Running (2 instances)',
        uptime: '2d 4h 15m',
        database: 'PostgreSQL (Connected)',
        databaseStatus: 'Connected',
        latency: '230ms',
        latencyValue: 230
      },
      endpoints: [
        { method: 'POST', path: '/api/v1/payments' },
        { method: 'GET', path: '/api/v1/payments/{id}' },
        { method: 'DELETE', path: '/api/v1/payments/{id}' },
        { method: 'GET', path: '/api/v1/payments/status/{id}' }
      ]
    },
    {
      id: 4,
      name: 'Delivery Service',
      icon: '<span class="material-icons text-secondary mr-2">local_shipping</span>',
      status: 'healthy',
      stats: {
        status: 'Running (2 instances)',
        uptime: '5d 12h 10m',
        database: 'MongoDB (Connected)',
        databaseStatus: 'Connected',
        latency: '52ms',
        latencyValue: 52
      },
      endpoints: [
        { method: 'POST', path: '/api/v1/delivery' },
        { method: 'GET', path: '/api/v1/delivery/{id}' },
        { method: 'PUT', path: '/api/v1/delivery/{id}/status' },
        { method: 'GET', path: '/api/v1/delivery/tracking/{id}' }
      ]
    }
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-darkest">Microservices</h2>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};

export default Microservices;
