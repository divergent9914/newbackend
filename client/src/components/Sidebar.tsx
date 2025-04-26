import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Layers, 
  Network, 
  GitCompare, 
  BarChart3, 
  FileText,
  Settings,
  ShoppingCart,
  Store,
  CreditCard,
  Truck,
  Github,
  Database
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;
  
  const mainMenuItems = [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/' },
    { icon: <Layers className="h-4 w-4" />, label: 'Services', path: '/services' },
    { icon: <Network className="h-4 w-4" />, label: 'API Gateway', path: '/api-gateway' },
    { icon: <GitCompare className="h-4 w-4" />, label: 'ONDC Integration', path: '/ondc' },
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Monitoring', path: '/monitoring' },
    { icon: <FileText className="h-4 w-4" />, label: 'Documentation', path: '/docs' },
  ];

  const microserviceItems = [
    { icon: <div className="w-2 h-2 rounded-full bg-status-success"></div>, label: 'Order Service', path: '/services/order' },
    { icon: <div className="w-2 h-2 rounded-full bg-status-success"></div>, label: 'Inventory Service', path: '/services/inventory' },
    { icon: <div className="w-2 h-2 rounded-full bg-status-warning"></div>, label: 'Payment Service', path: '/services/payment' },
    { icon: <div className="w-2 h-2 rounded-full bg-status-success"></div>, label: 'Delivery Service', path: '/services/delivery' },
  ];

  const getIconForServicePath = (path: string) => {
    const serviceMap: Record<string, React.ReactNode> = {
      '/services/order': <ShoppingCart className="h-4 w-4 text-secondary mr-2" />,
      '/services/inventory': <Store className="h-4 w-4 text-secondary mr-2" />,
      '/services/payment': <CreditCard className="h-4 w-4 text-status-warning mr-2" />,
      '/services/delivery': <Truck className="h-4 w-4 text-secondary mr-2" />,
    };
    return serviceMap[path] || null;
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-neutral-light flex flex-col">
      <div className="p-4 border-b border-neutral-light flex items-center">
        <Layers className="h-5 w-5 text-primary mr-2" />
        <h1 className="text-lg font-semibold text-neutral-darkest">Microservices</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto pt-2">
        <ul className="px-2">
          {mainMenuItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path) 
                    ? 'bg-primary-light text-white' 
                    : 'text-neutral-dark hover:bg-neutral-lightest'
                }`}>
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 px-6">
          <h2 className="text-xs font-semibold text-neutral-medium uppercase tracking-wider mb-2">
            Microservices
          </h2>
          <ul>
            {microserviceItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link href={item.path}>
                  <a className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path) 
                      ? 'bg-neutral-lightest text-neutral-darkest' 
                      : 'text-neutral-dark hover:bg-neutral-lightest'
                  }`}>
                    {isActive(item.path) ? getIconForServicePath(item.path) : <span className="mr-3">{item.icon}</span>}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 px-6">
          <h2 className="text-xs font-semibold text-neutral-medium uppercase tracking-wider mb-2">
            Integrations
          </h2>
          <ul>
            <li className="mb-1">
              <Link href="/integrations/github">
                <a className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/integrations/github') 
                    ? 'bg-neutral-lightest text-neutral-darkest' 
                    : 'text-neutral-dark hover:bg-neutral-lightest'
                }`}>
                  <Github className="h-4 w-4 mr-3" />
                  GitHub Loader
                </a>
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/integrations/supabase">
                <a className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/integrations/supabase') 
                    ? 'bg-neutral-lightest text-neutral-darkest' 
                    : 'text-neutral-dark hover:bg-neutral-lightest'
                }`}>
                  <Database className="h-4 w-4 mr-3" />
                  Supabase Import
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-neutral-light">
        <Link href="/settings">
          <a className="flex items-center text-sm font-medium text-neutral-dark">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </a>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
