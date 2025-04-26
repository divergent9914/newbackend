import { Link } from 'wouter';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import LocationSelector from './LocationSelector';

export default function Header() {
  const { toggleCart } = useUIStore();
  const { getTotalItems } = useCartStore();
  const itemCount = getTotalItems();
  
  return (
    <header className="sticky top-0 bg-white border-b z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/store">
            <a className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-semibold">OC</span>
              </div>
              <span className="font-bold text-xl">ONDC Connect</span>
            </a>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/store">
              <a className="font-medium hover:text-primary transition">Home</a>
            </Link>
            <Link href="/store/categories">
              <a className="font-medium hover:text-primary transition">Categories</a>
            </Link>
            <Link href="/store/about">
              <a className="font-medium hover:text-primary transition">About ONDC</a>
            </Link>
            <a 
              href="/"
              className="font-medium hover:text-primary transition"
            >
              Admin Panel
            </a>
          </nav>
          
          {/* Location, Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LocationSelector isButton={true} />
            </div>
            
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}