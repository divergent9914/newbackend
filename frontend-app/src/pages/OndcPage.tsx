import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  ShoppingCart, Search, CheckSquare, Package, 
  CreditCard, FileCheck, AlertTriangle, Loader2 
} from 'lucide-react';

interface OndcEndpoint {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: JSX.Element;
  samplePayload: string;
}

const OndcPage = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<OndcEndpoint | null>(null);
  const [requestPayload, setRequestPayload] = useState('');
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const ondcEndpoints: OndcEndpoint[] = [
    {
      id: 'search',
      name: 'Search',
      path: '/api/ondc/search',
      description: 'Search for products or services in the network',
      icon: <Search size={20} />,
      samplePayload: JSON.stringify({
        context: {
          domain: "retail",
          country: "IND",
          city: "std:080",
          action: "search",
          timestamp: new Date().toISOString()
        },
        message: {
          intent: {
            category: {
              descriptor: {
                name: "Groceries"
              }
            }
          }
        }
      }, null, 2)
    },
    {
      id: 'select',
      name: 'Select',
      path: '/api/ondc/select',
      description: 'Select items from the catalog for ordering',
      icon: <CheckSquare size={20} />,
      samplePayload: JSON.stringify({
        context: {
          domain: "retail",
          country: "IND",
          city: "std:080",
          action: "select",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            items: [
              {
                id: "10001",
                quantity: {
                  count: 2
                }
              }
            ]
          }
        }
      }, null, 2)
    },
    {
      id: 'init',
      name: 'Initialize',
      path: '/api/ondc/init',
      description: 'Initialize the order with delivery information',
      icon: <Package size={20} />,
      samplePayload: JSON.stringify({
        context: {
          domain: "retail",
          country: "IND",
          city: "std:080",
          action: "init",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            items: [
              {
                id: "10001",
                quantity: {
                  count: 2
                }
              }
            ],
            billing: {
              name: "John Doe",
              address: {
                door: "123",
                building: "Apartment",
                street: "Main Street",
                locality: "Downtown",
                city: "Bangalore",
                state: "Karnataka",
                country: "India",
                area_code: "560001"
              },
              phone: "9876543210",
              email: "john.doe@example.com"
            },
            fulfillment: {
              type: "home-delivery",
              end: {
                location: {
                  address: {
                    door: "123",
                    building: "Apartment",
                    street: "Main Street",
                    locality: "Downtown",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    area_code: "560001"
                  }
                },
                contact: {
                  phone: "9876543210",
                  email: "john.doe@example.com"
                }
              }
            }
          }
        }
      }, null, 2)
    },
    {
      id: 'confirm',
      name: 'Confirm',
      path: '/api/ondc/confirm',
      description: 'Confirm the order with payment details',
      icon: <CreditCard size={20} />,
      samplePayload: JSON.stringify({
        context: {
          domain: "retail",
          country: "IND",
          city: "std:080",
          action: "confirm",
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            items: [
              {
                id: "10001",
                quantity: {
                  count: 2
                }
              }
            ],
            billing: {
              name: "John Doe",
              address: {
                door: "123",
                building: "Apartment",
                street: "Main Street",
                locality: "Downtown",
                city: "Bangalore",
                state: "Karnataka",
                country: "India",
                area_code: "560001"
              },
              phone: "9876543210",
              email: "john.doe@example.com"
            },
            fulfillment: {
              type: "home-delivery",
              end: {
                location: {
                  address: {
                    door: "123",
                    building: "Apartment",
                    street: "Main Street",
                    locality: "Downtown",
                    city: "Bangalore",
                    state: "Karnataka",
                    country: "India",
                    area_code: "560001"
                  }
                },
                contact: {
                  phone: "9876543210",
                  email: "john.doe@example.com"
                }
              }
            },
            payment: {
              type: "POST-FULFILLMENT",
              status: "PAID",
              params: {
                transaction_id: "txn_12345",
                amount: "500.00",
                currency: "INR"
              }
            }
          }
        }
      }, null, 2)
    },
    {
      id: 'status',
      name: 'Status',
      path: '/api/ondc/status',
      description: 'Check the status of an order',
      icon: <FileCheck size={20} />,
      samplePayload: JSON.stringify({
        context: {
          domain: "retail",
          country: "IND",
          city: "std:080",
          action: "status",
          timestamp: new Date().toISOString()
        },
        message: {
          order_id: "order_12345"
        }
      }, null, 2)
    }
  ];

  const sendRequestMutation = useMutation({
    mutationFn: async (data: { path: string; payload: any }) => {
      const response = await fetch(data.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data.payload,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to process ONDC request');
      }
      
      return responseData;
    },
    onSuccess: (data) => {
      setResponseData(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setResponseData(null);
    },
  });

  const handleEndpointSelect = (endpoint: OndcEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestPayload(endpoint.samplePayload);
    setResponseData(null);
    setError(null);
  };

  const handleSendRequest = () => {
    if (!selectedEndpoint) return;
    
    try {
      // Just parse to check validity
      JSON.parse(requestPayload);
      
      // If valid, send the request
      sendRequestMutation.mutate({
        path: selectedEndpoint.path,
        payload: requestPayload,
      });
    } catch (err) {
      setError('Invalid JSON payload');
    }
  };

  return (
    <div className="ondc-container">
      <h1 className="dashboard-title">ONDC Integration</h1>
      <p className="section-description">
        Open Network for Digital Commerce (ONDC) integration allows your services to participate in the open commerce network.
        Test and configure ONDC protocol endpoints below.
      </p>
      
      <div className="ondc-content">
        <div className="endpoints-sidebar">
          <h2 className="text-lg font-semibold">ONDC Endpoints</h2>
          <div className="endpoints-list">
            {ondcEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`endpoint-item ${selectedEndpoint?.id === endpoint.id ? 'selected' : ''}`}
                onClick={() => handleEndpointSelect(endpoint)}
              >
                <div className="endpoint-icon">
                  {endpoint.icon}
                </div>
                <div className="endpoint-info">
                  <h3 className="endpoint-name">{endpoint.name}</h3>
                  <p className="endpoint-description">{endpoint.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="request-area">
          <h2 className="text-lg font-semibold mb-4">Request</h2>
          
          {selectedEndpoint ? (
            <>
              <div className="endpoint-path mb-4">{selectedEndpoint.path}</div>
              
              <div className="mb-4">
                <textarea
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  className="w-full h-80 bg-gray-900 text-white font-mono p-4 rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter request payload (JSON)"
                ></textarea>
              </div>
              
              <button
                onClick={handleSendRequest}
                disabled={sendRequestMutation.isPending}
                className="send-request-btn"
              >
                {sendRequestMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="spin-icon" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Send ONDC Request
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="no-endpoint-selected">
              <ShoppingCart size={32} className="mb-4 opacity-50" />
              <p>Select an ONDC endpoint from the left panel</p>
            </div>
          )}
        </div>
        
        <div className="response-area">
          <h2 className="text-lg font-semibold mb-4">Response</h2>
          
          {sendRequestMutation.isPending ? (
            <div className="loading-response">
              <Loader2 size={32} className="spin-icon mb-4" />
              <p>Processing request...</p>
            </div>
          ) : error ? (
            <div className="error-response">
              <h3 className="flex items-center gap-2">
                <AlertTriangle size={18} />
                Error
              </h3>
              <pre>{error}</pre>
            </div>
          ) : responseData ? (
            <div className="success-response">
              <h3 className="flex items-center gap-2">
                <CheckSquare size={18} />
                Success
              </h3>
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            </div>
          ) : (
            <div className="no-response">
              <FileCheck size={32} className="mb-4 opacity-50" />
              <p>Response will appear here after sending a request</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="ondc-documentation">
        <h2 className="text-xl font-semibold mb-4">ONDC Protocol Documentation</h2>
        <p className="mb-4">
          The Open Network for Digital Commerce (ONDC) is an initiative aimed at promoting open networks for all aspects of the exchange of goods and services over digital networks.
          ONDC is based on open-sourced methodology, using open specifications and open network protocols independent of any specific platform.
        </p>
        <p className="mb-4">
          Key Principles:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Decentralized and interoperable network</li>
          <li>Open specifications and protocols</li>
          <li>Platform-agnostic approach</li>
          <li>Inclusivity and digitization of the entire value chain</li>
          <li>Standardized operations for searching, ordering, fulfillment, payments, and more</li>
        </ul>
        <p>
          For detailed specifications and implementation guidelines, please refer to the{' '}
          <a 
            href="https://ondc.org/protocol-specifications.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            official ONDC protocol documentation
          </a>.
        </p>
      </div>
    </div>
  );
};

export default OndcPage;