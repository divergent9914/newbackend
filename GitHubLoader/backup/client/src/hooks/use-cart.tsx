import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { getUserId } from "@/lib/supabase";
import type { CartItem, InsertCartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

interface CartState {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface CartContextValue {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  cartItems: CartItemWithProduct[];
  cart: CartState;
  addToCart: (item: InsertCartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateCartItemQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  closeQuickView: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get cart items from API
  const { data: cartData, refetch } = useQuery<{ cartItems: CartItemWithProduct[] }>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const cartItems = cartData?.cartItems || [];

  // Calculate cart totals
  const calculateCart = (): CartState => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + Number(item.product?.price || 0) * item.quantity;
    }, 0);
    
    // Shipping is free over $50, otherwise $5
    const shipping = subtotal > 50 ? 0 : 5;
    
    // Tax is 8% of subtotal
    const tax = subtotal * 0.08;
    
    const total = subtotal + shipping + tax;
    
    return {
      subtotal,
      shipping,
      tax,
      total
    };
  };

  const cart = calculateCart();

  // Toggle cart visibility
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Quick view modal
  const closeQuickView = () => setQuickViewProduct(null);

  // Add item to cart
  const addToCart = async (item: InsertCartItem) => {
    await apiRequest('POST', '/api/cart', item);
    await refetch();
  };

  // Remove item from cart
  const removeFromCart = async (id: number) => {
    await apiRequest('DELETE', `/api/cart/${id}`);
    await refetch();
  };

  // Update item quantity
  const updateCartItemQuantity = async (id: number, quantity: number) => {
    await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    await refetch();
  };

  // Clear cart
  const clearCart = async () => {
    await apiRequest('DELETE', '/api/cart');
    await refetch();
  };

  // Refresh cart when user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  return (
    <CartContext.Provider value={{
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      cartItems,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      quickViewProduct,
      setQuickViewProduct,
      closeQuickView
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  return context;
}
