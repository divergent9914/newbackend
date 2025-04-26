import React from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Store, 
  CreditCard, 
  Truck,
  ArrowLeft,
  Clock,
  HardDrive,
  Zap,
  BarChart2,
  Settings,
  RefreshCw
} from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const [match, params] = useRoute('/services/:serviceId');
  const serviceId = params?.serviceId || '';

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/metrics'],
  });

  if (!match) return null;

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 mr-2 text-secondary" />;
      case 'inventory':
        return <Store className="h-5 w-5 mr-2 text-secondary" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 mr-2 text-status-warning" />;
      case 'delivery':
        return <Truck className="h-5 w-5 mr-2 text-secondary" />;
      default:
        return null;
    }
  };

  const getServiceName = (id: string) => {
    switch (id) {
      case 'order':
        return 'Order Service';
      case 'inventory':
        return 'Inventory Service';
      case 'payment':
        return 'Payment Service';
      case 'delivery':
        return 'Delivery Service';
      default:
        return 'Unknown Service';
    }
  };

  const getServiceMetrics = () => {
    if (!metrics) return null;
    return metrics.find((m: any) => m.serviceName === getServiceName(serviceId));
  };

  const serviceMetrics = getServiceMetrics();
  const isPaymentService = serviceId === 'payment';

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/services">
            <a className="mr-3">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </a>
          </Link>
          <div className="flex items-center">
            {getServiceIcon(serviceId)}
            <h1 className="text-2xl font-bold text-neutral-darkest">{getServiceName(serviceId)}</h1>
          </div>
          <Badge variant="outline" className={`ml-4 
            ${serviceId === 'payment' ? 'bg-status-warning bg-opacity-10 text-status-warning' : 
              'bg-status-success bg-opacity-10 text-status-success'}
          `}>
            {serviceId === 'payment' ? 'High Latency' : 'Healthy'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Restart
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-neutral-medium">Uptime</p>
            <p className="text-xl font-semibold text-neutral-darkest">
              {serviceId === 'payment' ? '2d 4h 15m' : '5d 12h 10m'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <HardDrive className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-neutral-medium">Database</p>
            <p className="text-xl font-semibold text-neutral-darkest">
              {serviceId === 'inventory' || serviceId === 'delivery' ? 'MongoDB' : 'PostgreSQL'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-neutral-medium">Latency</p>
            <p className={`text-xl font-semibold ${isPaymentService ? 'text-status-warning' : 'text-neutral-darkest'}`}>
              {isPaymentService ? '230ms' : serviceId === 'order' ? '45ms' : serviceId === 'inventory' ? '38ms' : '52ms'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <BarChart2 className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-neutral-medium">Requests</p>
            <p className="text-xl font-semibold text-neutral-darkest">
              {serviceMetrics?.requestCount || (serviceId === 'order' ? '156' : serviceId === 'inventory' ? '89' : serviceId === 'payment' ? '67' : '42')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-dark mb-2">Service Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Status:</span>
                          <span className="font-medium">Running</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Instances:</span>
                          <span className="font-medium">{serviceId === 'order' ? '3' : '2'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Error Rate:</span>
                          <span className="font-medium">{isPaymentService ? '2.5%' : '0%'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Memory Usage:</span>
                          <span className="font-medium">{isPaymentService ? '245MB' : '180MB'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-dark mb-2">Database Connection</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Type:</span>
                          <span className="font-medium">
                            {serviceId === 'inventory' || serviceId === 'delivery' ? 'MongoDB' : 'PostgreSQL'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Status:</span>
                          <span className="font-medium text-status-success">Connected</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Connection Pool:</span>
                          <span className="font-medium">10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-medium">Active Queries:</span>
                          <span className="font-medium">3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-dark mb-2">Service Description</h3>
                    <p className="text-sm text-neutral-dark">
                      {serviceId === 'order' && 
                        'The Order Service handles customer orders from creation to completion. It manages order states, processes order items, and coordinates with other services for payment and delivery.'}
                      {serviceId === 'inventory' && 
                        'The Inventory Service manages product inventory and stock levels. It ensures accurate stock counts, handles product information, and provides catalog services.'}
                      {serviceId === 'payment' && 
                        'The Payment Service processes payments and refunds for orders. It integrates with payment gateways, manages payment states, and ensures transaction security.'}
                      {serviceId === 'delivery' && 
                        'The Delivery Service manages order fulfillment and shipping. It generates tracking numbers, updates delivery statuses, and integrates with shipping providers.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-dark mb-2">ONDC Integration</h3>
                    <p className="text-sm text-neutral-dark mb-2">
                      This service is integrated with the ONDC protocol through:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-neutral-dark space-y-1">
                      {serviceId === 'order' && (
                        <>
                          <li>Order creation via ONDC select and init APIs</li>
                          <li>Order status updates to ONDC network</li>
                        </>
                      )}
                      {serviceId === 'inventory' && (
                        <>
                          <li>Product catalog exposure via ONDC search API</li>
                          <li>Inventory updates to ONDC network</li>
                        </>
                      )}
                      {serviceId === 'payment' && (
                        <>
                          <li>Payment processing via ONDC confirm API</li>
                          <li>Payment status updates to ONDC network</li>
                        </>
                      )}
                      {serviceId === 'delivery' && (
                        <>
                          <li>Delivery tracking via ONDC status API</li>
                          <li>Delivery updates to ONDC network</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-neutral-lightest rounded-lg flex items-center justify-center">
                  <span className="text-sm text-neutral-medium">Service Performance Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-lightest">
                      <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                      <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Path</th>
                      <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                      <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-light">
                    {serviceId === 'order' && (
                      <>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get all orders</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary">POST</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a new order</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get order by ID</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-accent bg-opacity-10 text-accent">PUT</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update order status</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                      </>
                    )}

                    {serviceId === 'inventory' && (
                      <>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get all products</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get product by ID</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-accent bg-opacity-10 text-accent">PUT</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update product stock</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary">POST</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/batch</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Batch create products</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                      </>
                    )}

                    {serviceId === 'payment' && (
                      <>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary">POST</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a payment</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-warning bg-opacity-10 text-status-warning">Slow</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get payment by ID</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-error bg-opacity-10 text-status-error">DELETE</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Cancel payment</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/status/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get payment status</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-warning bg-opacity-10 text-status-warning">Slow</Badge>
                          </td>
                        </tr>
                      </>
                    )}

                    {serviceId === 'delivery' && (
                      <>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary">POST</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a delivery</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get delivery by ID</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-accent bg-opacity-10 text-accent">PUT</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/{'{id}'}/status</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update delivery status</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">GET</Badge>
                          </td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/tracking/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get tracking information</td>
                          <td className="border border-neutral-light px-4 py-2">
                            <Badge variant="outline" className="bg-status-success bg-opacity-10 text-status-success">Active</Badge>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Service Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-3">Environment Variables</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Name</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Value</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">NODE_ENV</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">production</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Environment</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">SERVICE_PORT</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">8000</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Service port</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">DATABASE_URL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">[hidden]</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Database connection string</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">LOG_LEVEL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">info</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Logging level</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-3">Service Settings</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Setting</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Value</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Max Connections</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">100</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Maximum concurrent connections</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Timeout</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">30s</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Request timeout</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Cache TTL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">5m</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Cache time-to-live</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Rate Limit</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">100/min</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">API rate limit</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Service Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-darkest text-white p-4 rounded-md font-mono text-sm h-96 overflow-auto">
                <p className="text-neutral-medium">[2023-07-12 10:15:32] [INFO] Service started on port 8000</p>
                <p className="text-neutral-medium">[2023-07-12 10:15:33] [INFO] Connected to database</p>
                <p className="text-neutral-medium">[2023-07-12 10:16:01] [INFO] Received request: GET /api/v1/{serviceId === 'order' ? 'orders' : serviceId === 'inventory' ? 'inventory' : serviceId === 'payment' ? 'payments/status/1001' : 'delivery/tracking/DLVR1234567'}</p>
                <p className="text-neutral-medium">[2023-07-12 10:16:02] [INFO] Request processed successfully</p>
                {isPaymentService && (
                  <>
                    <p className="text-status-warning">[2023-07-12 10:17:15] [WARN] Slow database query detected (230ms)</p>
                    <p className="text-neutral-medium">[2023-07-12 10:17:16] [INFO] Performance alert triggered</p>
                  </>
                )}
                <p className="text-neutral-medium">[2023-07-12 10:18:45] [INFO] Received request: {serviceId === 'order' || serviceId === 'inventory' ? 'GET' : 'POST'} /api/v1/{serviceId === 'order' ? 'orders/1002' : serviceId === 'inventory' ? 'inventory' : serviceId === 'payment' ? 'payments' : 'delivery'}</p>
                <p className="text-neutral-medium">[2023-07-12 10:18:46] [INFO] Request processed successfully</p>
                <p className="text-neutral-medium">[2023-07-12 10:20:12] [INFO] ONDC integration: Received {serviceId === 'order' ? 'select request' : serviceId === 'inventory' ? 'search request' : serviceId === 'payment' ? 'confirm request' : 'status request'}</p>
                <p className="text-neutral-medium">[2023-07-12 10:20:13] [INFO] ONDC integration: Response sent successfully</p>
                {isPaymentService && (
                  <p className="text-status-warning">[2023-07-12 10:22:30] [WARN] High latency detected in payment processing endpoint</p>
                )}
                <p className="text-neutral-medium">[2023-07-12 10:25:01] [INFO] Received request: {serviceId === 'order' || serviceId === 'delivery' ? 'PUT' : 'GET'} /api/v1/{serviceId === 'order' ? 'orders/1003' : serviceId === 'inventory' ? 'inventory/5001' : serviceId === 'payment' ? 'payments/2001' : 'delivery/3001/status'}</p>
                <p className="text-neutral-medium">[2023-07-12 10:25:02] [INFO] Request processed successfully</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ServiceDetail;
