import { useUIStore, useUserStore, useLocationStore, useCartStore } from "@/lib/store";
import { Link } from "wouter";
import { Moon, Sun, MapPin, ChevronDown, UserCircle2, ShoppingBag, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { toggleTheme, theme, toggleCart, toggleAuthModal, openLocationSelector } = useUIStore();
  const { isAuthenticated, user } = useUserStore();
  const { selectedKitchen } = useLocationStore();
  const { items } = useCartStore();
  
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center">
        <div className="flex items-center mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="gradient-text text-xl">aamis</span>
          </Link>
        </div>
        
        {/* Location Selector (Desktop) */}
        <button 
          className="hidden md:flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
          onClick={openLocationSelector}
        >
          <MapPin size={16} />
          <span>{selectedKitchen ? `${selectedKitchen.area}, ${selectedKitchen.city}` : "Select location"}</span>
          <ChevronDown size={16} />
        </button>
        
        <div className="flex-1"></div>
        
        {/* Admin Link (temporarily visible to everyone for testing) */}
        <Link href="/admin" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3">
          <LayoutDashboard size={16} className="mr-2" />
          Admin
        </Link>
        
        {/* Theme Toggle */}
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 ml-2"
          onClick={toggleTheme}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
        
        {/* Auth Button */}
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3 ml-2"
          onClick={toggleAuthModal}
        >
          {isAuthenticated ? (
            <span className="flex items-center gap-2">
              <UserCircle2 size={16} />
              <span>{user?.name || "Account"}</span>
            </span>
          ) : (
            "Login"
          )}
        </button>
        
        {/* Cart Button */}
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 ml-2 relative"
          onClick={toggleCart}
        >
          <ShoppingBag size={16} className="mr-2" />
          Cart
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
