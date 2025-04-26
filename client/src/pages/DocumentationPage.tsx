import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileCode, BookOpen, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DocumentationPage: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-darkest mb-2">Documentation</h1>
        <p className="text-neutral-dark">
          Documentation for the microservices architecture and ONDC integration
        </p>
      </div>

      <Tabs defaultValue="architecture">
        <TabsList className="mb-6">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="ondc">ONDC Integration</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-3">
                  The e-commerce system is built using a microservices architecture, with four core services:
                </p>
                <ul className="list-disc pl-5 text-sm text-neutral-dark mb-4 space-y-2">
                  <li><strong>Order Service:</strong> Manages customer orders, order statuses, and order history</li>
                  <li><strong>Inventory Service:</strong> Handles product inventory, stock management, and catalog services</li>
                  <li><strong>Payment Service:</strong> Processes payments, refunds, and manages payment statuses</li>
                  <li><strong>Delivery Service:</strong> Manages shipping, tracking, and delivery status updates</li>
                </ul>
                <p className="text-sm text-neutral-dark">
                  The services communicate through the API Gateway, which handles routing, authentication, and load balancing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileCode className="h-5 w-5 mr-2 text-primary" />
                  Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-3">
                  The microservices architecture is built using the following technologies:
                </p>
                <ul className="list-disc pl-5 text-sm text-neutral-dark mb-4 space-y-2">
                  <li><strong>Frontend:</strong> React.js, Tailwind CSS, TanStack Query</li>
                  <li><strong>API Gateway:</strong> Express.js, JWT authentication</li>
                  <li><strong>Microservices:</strong> Express.js, Drizzle ORM</li>
                  <li><strong>Storage:</strong> In-memory storage for development, PostgreSQL compatible</li>
                  <li><strong>Integration:</strong> ONDC Protocol Adapter</li>
                </ul>
                <p className="text-sm text-neutral-dark">
                  All services are containerized and can be deployed individually.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Communication Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-4">
                  The diagram below shows the communication flow between services:
                </p>
                <div className="bg-neutral-lightest p-4 rounded-md">
                  <ol className="list-decimal pl-5 text-sm text-neutral-dark space-y-3">
                    <li>
                      <strong>Client to API Gateway:</strong> All client requests pass through the API Gateway, which authenticates the request and determines which service should handle it.
                    </li>
                    <li>
                      <strong>API Gateway to Services:</strong> The Gateway routes the request to the appropriate service (Order, Inventory, Payment, or Delivery).
                    </li>
                    <li>
                      <strong>Service-to-Service Communication:</strong> When needed, services can communicate with each other through the API Gateway.
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Order Service checks inventory with Inventory Service</li>
                        <li>Order Service requests payment processing from Payment Service</li>
                        <li>Order Service initiates delivery with Delivery Service</li>
                      </ul>
                    </li>
                    <li>
                      <strong>ONDC Integration:</strong> The ONDC adapter handles protocol-specific requests and translates them into the internal service format.
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileCode className="h-5 w-5 mr-2 text-primary" />
                  API Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-4">
                  The API Gateway exposes the following endpoints for each service:
                </p>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Order Service</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Endpoint</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get all orders</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a new order</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get order by ID</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-accent font-medium">PUT</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/orders/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update order status</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Inventory Service</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Endpoint</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get all products</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get product by ID</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-accent font-medium">PUT</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update product stock</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/inventory/batch</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Batch create products</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Payment Service</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Endpoint</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a payment</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get payment by ID</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-status-error font-medium">DELETE</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Cancel payment</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/payments/status/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get payment status for order</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3">Delivery Service</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Endpoint</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Create a delivery</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get delivery by ID</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-accent font-medium">PUT</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/{'{id}'}/status</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Update delivery status</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-primary font-medium">GET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/v1/delivery/tracking/{'{id}'}</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Get tracking information</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ondc">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                  ONDC Protocol Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-4">
                  The platform is integrated with the Open Network for Digital Commerce (ONDC) protocol, enabling interoperability with the ONDC network.
                </p>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">ONDC Endpoints</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Endpoint</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Method</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Mapped Service</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/ondc/search</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Search for products</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Inventory Service</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/ondc/select</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Select items for a cart</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Order Service</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/ondc/init</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Initialize an order</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Order Service</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/ondc/confirm</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Confirm an order</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Payment Service</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">/api/ondc/status</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm text-secondary font-medium">POST</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Check order status</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Delivery Service</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-3">ONDC Flow</h3>
                  <ol className="list-decimal pl-5 text-sm text-neutral-dark space-y-3">
                    <li>
                      <strong>Search:</strong> Buyer searches for products, mapped to the Inventory Service.
                    </li>
                    <li>
                      <strong>Select:</strong> Buyer selects products to add to cart, creating a draft order in the Order Service.
                    </li>
                    <li>
                      <strong>Init:</strong> Buyer initializes the checkout process, updating the Order Service.
                    </li>
                    <li>
                      <strong>Confirm:</strong> Buyer confirms and pays for the order, processed by the Payment Service.
                    </li>
                    <li>
                      <strong>Status:</strong> Buyer or seller checks the order status, retrieving information from the Delivery Service.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3">ONDC Compliance</h3>
                  <p className="text-sm text-neutral-dark mb-3">
                    The platform maintains ONDC compliance through:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-neutral-dark mb-4 space-y-2">
                    <li>Standardized API formats for ONDC protocol compatibility</li>
                    <li>Schema validation for ONDC request and response payloads</li>
                    <li>Compliance with ONDC business rules and processes</li>
                    <li>Regular synchronization with ONDC protocol updates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileCode className="h-5 w-5 mr-2 text-primary" />
                  Deployment Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-dark mb-4">
                  The microservices architecture can be deployed in multiple ways:
                </p>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Local Development</h3>
                  <div className="bg-neutral-lightest p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>
                      # Install dependencies<br />
                      npm install<br /><br />
                      
                      # Start the development server<br />
                      npm run dev
                    </pre>
                  </div>
                  <p className="text-sm text-neutral-dark mt-3">
                    This will start the frontend on port 5000 and all microservices through the API gateway.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Production Deployment</h3>
                  <div className="bg-neutral-lightest p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>
                      # Build the application<br />
                      npm run build<br /><br />
                      
                      # Start the production server<br />
                      npm start
                    </pre>
                  </div>
                  <p className="text-sm text-neutral-dark mt-3">
                    For production deployments, consider setting up proper database connections for each service.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3">Environment Variables</h3>
                  <p className="text-sm text-neutral-dark mb-3">
                    The following environment variables should be set:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-lightest">
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Variable</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Description</th>
                          <th className="border border-neutral-light px-4 py-2 text-left text-xs font-medium text-neutral-dark">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">NODE_ENV</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Environment (development/production)</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">development</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">DATABASE_URL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Database connection string</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Required for DB mode</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">JWT_SECRET</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Secret for JWT tokens</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Required for auth</td>
                        </tr>
                        <tr>
                          <td className="border border-neutral-light px-4 py-2 text-sm font-mono">ONDC_REGISTRY_URL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">ONDC registry URL</td>
                          <td className="border border-neutral-light px-4 py-2 text-sm">Required for ONDC</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default DocumentationPage;
