import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Menu, ShoppingBag, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore, useCartStore, useUserStore } from '@/lib/store';
import LocationSelector from './LocationSelector';

export default function Header() {
  const { theme, toggleTheme, toggleCart, toggleAuthModal } = useUIStore();
  const { getTotalItems } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-shadow ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold gradient-text">aamis</span>
        </Link>
        
        {/* Location */}
        <div className="hidden md:block">
          <LocationSelector isButton />
        </div>
        
        {/* Navigation actions */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Cart */}
          <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
            <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
            {getTotalItems() > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {getTotalItems()}
              </span>
            )}
            <span className="sr-only">Open cart</span>
          </Button>
          
          {/* Auth */}
          <Button 
            variant={isAuthenticated ? "default" : "outline"} 
            size="sm"
            onClick={toggleAuthModal}
          >
            <User className="mr-2 h-4 w-4" />
            {isAuthenticated ? 'Account' : 'Login'}
          </Button>
          
          {/* Mobile menu (can be expanded) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
