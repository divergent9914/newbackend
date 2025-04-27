import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, ShoppingBag, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { toggleCart, items } = useCartStore();
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/store">
            <a className="font-bold text-xl text-primary flex items-center">
              <span className="bg-gradient-to-r from-primary to-primary-600 text-transparent bg-clip-text">
                ONDC Connect
              </span>
            </a>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/store">
              <a className={`text-sm font-medium hover:text-primary ${location === '/store' ? 'text-primary' : 'text-gray-700'}`}>
                Home
              </a>
            </Link>
            <Link href="/store/categories">
              <a className={`text-sm font-medium hover:text-primary ${location === '/store/categories' ? 'text-primary' : 'text-gray-700'}`}>
                Categories
              </a>
            </Link>
            <Link href="/store/kitchens">
              <a className={`text-sm font-medium hover:text-primary ${location === '/store/kitchens' ? 'text-primary' : 'text-gray-700'}`}>
                Kitchens
              </a>
            </Link>
            <Link href="/store/orders">
              <a className={`text-sm font-medium hover:text-primary ${location === '/store/orders' ? 'text-primary' : 'text-gray-700'}`}>
                My Orders
              </a>
            </Link>
          </nav>
          
          {/* User and cart actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User size={20} />
            </Button>
            
            <Button onClick={toggleCart} variant="ghost" size="icon" className="relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-6">
              <Link href="/store">
                <a className="font-bold text-xl text-primary" onClick={() => setMobileMenuOpen(false)}>
                  ONDC Connect
                </a>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X size={24} />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link href="/store">
                <a 
                  className={`text-lg font-medium py-2 ${location === '/store' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
              </Link>
              <Link href="/store/categories">
                <a 
                  className={`text-lg font-medium py-2 ${location === '/store/categories' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Categories
                </a>
              </Link>
              <Link href="/store/kitchens">
                <a 
                  className={`text-lg font-medium py-2 ${location === '/store/kitchens' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kitchens
                </a>
              </Link>
              <Link href="/store/orders">
                <a 
                  className={`text-lg font-medium py-2 ${location === '/store/orders' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </a>
              </Link>
              <Link href="/store/account">
                <a 
                  className={`text-lg font-medium py-2 ${location === '/store/account' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </a>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}