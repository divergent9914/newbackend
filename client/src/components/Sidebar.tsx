import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Database, Github, BarChart3, Book, Server, ShoppingCart } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && (
        <button 
          onClick={toggleSidebar} 
          className="mobile-menu-toggle p-2 border-0"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu size={24} />
        </button>
      )}
      
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">API Gateway</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="close-button p-0"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link href="/">
                <a 
                  className={`sidebar-link ${location === '/' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Home size={18} />
                  Dashboard
                </a>
              </Link>
            </li>
            <li>
              <Link href="/services">
                <a 
                  className={`sidebar-link ${location === '/services' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Server size={18} />
                  Services
                </a>
              </Link>
            </li>
            <li>
              <Link href="/api-gateway">
                <a 
                  className={`sidebar-link ${location === '/api-gateway' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Database size={18} />
                  API Gateway
                </a>
              </Link>
            </li>
            <li>
              <Link href="/monitoring">
                <a 
                  className={`sidebar-link ${location === '/monitoring' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <BarChart3 size={18} />
                  Monitoring
                </a>
              </Link>
            </li>
            <li>
              <Link href="/ondc">
                <a 
                  className={`sidebar-link ${location === '/ondc' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <ShoppingCart size={18} />
                  ONDC Integration
                </a>
              </Link>
            </li>
            <li>
              <Link href="/github-loader">
                <a 
                  className={`sidebar-link ${location === '/github-loader' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Github size={18} />
                  GitHub Loader
                </a>
              </Link>
            </li>
            <li>
              <Link href="/supabase-import">
                <a 
                  className={`sidebar-link ${location === '/supabase-import' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Database size={18} />
                  Supabase Import
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documentation">
                <a 
                  className={`sidebar-link ${location === '/documentation' ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <Book size={18} />
                  Documentation
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;