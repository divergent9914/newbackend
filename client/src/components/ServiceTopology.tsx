import React from 'react';

const ServiceTopology: React.FC = () => {
  return (
    <div className="relative h-64">
      <svg width="100%" height="100%" viewBox="0 0 800 240">
        {/* API Gateway */}
        <g className="node" data-service="gateway">
          <rect x="350" y="20" width="100" height="50" rx="4" fill="#1565C0" />
          <text x="400" y="50" textAnchor="middle" fill="white" fontSize="12">API Gateway</text>
        </g>
        
        {/* Services */}
        <g className="node" data-service="order">
          <rect x="150" y="120" width="100" height="50" rx="4" fill="#4CAF50" />
          <text x="200" y="150" textAnchor="middle" fill="white" fontSize="12">Order Service</text>
        </g>
        
        <g className="node" data-service="inventory">
          <rect x="300" y="120" width="100" height="50" rx="4" fill="#4CAF50" />
          <text x="350" y="150" textAnchor="middle" fill="white" fontSize="12">Inventory Service</text>
        </g>
        
        <g className="node" data-service="payment">
          <rect x="450" y="120" width="100" height="50" rx="4" fill="#FFA000" />
          <text x="500" y="150" textAnchor="middle" fill="white" fontSize="12">Payment Service</text>
        </g>
        
        <g className="node" data-service="delivery">
          <rect x="600" y="120" width="100" height="50" rx="4" fill="#4CAF50" />
          <text x="650" y="150" textAnchor="middle" fill="white" fontSize="12">Delivery Service</text>
        </g>
        
        {/* Databases */}
        <g className="node" data-service="order-db">
          <rect x="150" y="210" width="100" height="30" rx="4" fill="#E1E4E8" />
          <text x="200" y="230" textAnchor="middle" fill="#24292E" fontSize="10">Order DB</text>
        </g>
        
        <g className="node" data-service="inventory-db">
          <rect x="300" y="210" width="100" height="30" rx="4" fill="#E1E4E8" />
          <text x="350" y="230" textAnchor="middle" fill="#24292E" fontSize="10">Inventory DB</text>
        </g>
        
        <g className="node" data-service="payment-db">
          <rect x="450" y="210" width="100" height="30" rx="4" fill="#E1E4E8" />
          <text x="500" y="230" textAnchor="middle" fill="#24292E" fontSize="10">Payment DB</text>
        </g>
        
        <g className="node" data-service="delivery-db">
          <rect x="600" y="210" width="100" height="30" rx="4" fill="#E1E4E8" />
          <text x="650" y="230" textAnchor="middle" fill="#24292E" fontSize="10">Delivery DB</text>
        </g>
        
        {/* Connections */}
        {/* Gateway to Services */}
        <line className="link" x1="400" y1="70" x2="200" y2="120" />
        <line className="link" x1="400" y1="70" x2="350" y2="120" />
        <line className="link" x1="400" y1="70" x2="500" y2="120" />
        <line className="link" x1="400" y1="70" x2="650" y2="120" />
        
        {/* Services to DBs */}
        <line className="link" x1="200" y1="170" x2="200" y2="210" />
        <line className="link" x1="350" y1="170" x2="350" y2="210" />
        <line className="link" x1="500" y1="170" x2="500" y2="210" />
        <line className="link" x1="650" y1="170" x2="650" y2="210" />
        
        {/* Service-to-Service */}
        <line className="link" x1="250" y1="145" x2="300" y2="145" />
        <line className="link" x1="400" y1="145" x2="450" y2="145" />
        <line className="link" x1="550" y1="145" x2="600" y2="145" />
        <line className="link link-highlighted" x1="200" y1="135" x2="500" y2="135" strokeDasharray="4" />
      </svg>
      
      <div className="text-xs text-neutral-dark mt-2 flex justify-center space-x-6">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-primary mr-1 rounded-sm"></span>
          <span>API Gateway</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-secondary mr-1 rounded-sm"></span>
          <span>Healthy Service</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-status-warning mr-1 rounded-sm"></span>
          <span>Warning State</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-neutral-light mr-1 rounded-sm"></span>
          <span>Database</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-1 bg-primary-light mr-1"></span>
          <span>Active Connection</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceTopology;
