// Service Types
export type ServiceStatus = "healthy" | "warning" | "error";

export interface ServiceStats {
  name: string;
  status: ServiceStatus;
  value: string | number;
  description: string;
  changeValue?: string | number;
  changeDirection?: "up" | "down" | "neutral";
  changeDescription?: string;
  icon?: string;
  additionalInfo?: string;
}

export interface ServiceCard {
  id: number;
  name: string;
  icon: string;
  status: ServiceStatus;
  stats: {
    status: string;
    uptime: string;
    database: string;
    databaseStatus: string;
    latency: string;
    latencyValue: number;
  };
  endpoints: {
    method: string;
    path: string;
  }[];
}

// API Gateway Types
export interface ApiRoute {
  id: number;
  path: string;
  service: string;
  method: string;
  active: boolean;
}

export interface AuthConfig {
  name: string;
  description: string;
  status: "enabled" | "disabled";
}

// ONDC Integration Types
export interface OndcEndpoint {
  id: number;
  endpoint: string;
  type: string;
  mappedService: string;
  status: string;
  complianceScore: number;
  lastSync: string;
}

export interface OndcProtocolStatus {
  sellerApis: {
    compliance: number;
  };
  buyerApis: {
    compliance: number;
  };
  gatewayApis: {
    compliance: number;
  };
}

// Monitoring Types
export interface ServiceMetric {
  id: number;
  serviceName: string;
  status: ServiceStatus;
  uptime: number;
  requestCount: number;
  errorRate: number;
  averageLatency: number;
  timestamp: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  [key: string]: string | number;
}
