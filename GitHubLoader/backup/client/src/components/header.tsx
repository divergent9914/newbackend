import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ShoppingCart as ShoppingCartIcon, 
  User, ChevronDown, LogOut, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/search-bar";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth-modal";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export default function Header() {
  const [, setLocation] = useLocation();
  const { cartItems, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/categories'],
  });
  
  const categories = categoriesData?.categories || [];

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Close the mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [useLocation()[0]]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Nav Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-primary text-2xl font-bold">ShopHub</span>
            </a>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-grow max-w-2xl mx-6">
            <SearchBar />
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-4">
            {/* Account */}
            <div className="relative group">
              <button className="flex items-center text-gray-medium hover:text-primary transition duration-150">
                <User className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Account</span>
              </button>
              {/* Account Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                {!user ? (
                  <div className="py-2 px-4">
                    <button 
                      onClick={handleLogin}
                      className="block py-2 px-4 text-gray-medium hover:bg-gray-ultralight hover:text-primary w-full text-left"
                    >
                      Login
                    </button>
                    <button 
                      onClick={handleSignup}
                      className="block py-2 px-4 text-gray-medium hover:bg-gray-ultralight hover:text-primary w-full text-left"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="py-2 px-4">
                    <div className="border-b pb-2 mb-2">
                      <p className="font-medium">{user.username || user.email.split('@')[0]}</p>
                      <p className="text-sm text-gray-medium">{user.email}</p>
                    </div>
                    <Link href="/account">
                      <a className="block py-2 px-4 text-gray-medium hover:bg-gray-ultralight hover:text-primary">
                        My Account
                      </a>
                    </Link>
                    <Link href="/orders">
                      <a className="block py-2 px-4 text-gray-medium hover:bg-gray-ultralight hover:text-primary">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </div>
                      </a>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block py-2 px-4 text-gray-medium hover:bg-gray-ultralight hover:text-primary w-full text-left"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="relative">
              <Button 
                variant="ghost"
                className="flex items-center text-gray-medium hover:text-primary transition duration-150 p-0"
                onClick={toggleCart}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Cart</span>
                <Badge 
                  variant="destructive"
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs"
                >
                  {cartItems.length}
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Category Nav */}
        <nav className="py-2 border-t border-gray-100 overflow-x-auto whitespace-nowrap">
          <ul className="flex space-x-8">
            {categories.map(category => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`}>
                  <a className="text-gray-medium hover:text-primary text-sm font-medium">
                    {category.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
      />
    </header>
  );
}
