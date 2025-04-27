import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

// Simplified cart item directly matching our UI needs
export interface CartItem {
  id: number;
  productId?: number; // For order API compatibility
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  quantity: number;
  imageUrl?: string;
  categorySlug?: string;
}

// Cart State
interface CartState {
  isOpen: boolean;
  items: CartItem[];
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

// Extended cart state with calculated values
interface CartStateExtended extends CartState {
  itemCount: number;
  subtotal: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      
      // Toggle cart visibility
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      // Add an item to cart
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          // If item already exists, increase quantity
          set({
            items: items.map(i => 
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          });
        } else {
          // Otherwise add new item
          set({ 
            items: [...items, { ...item, quantity: 1 }],
            isOpen: true // Open the cart when adding a new item
          });
        }
      },
      
      // Update quantity of an item
      updateQuantity: (id: number, quantity: number) => {
        const { items } = get();
        set({
          items: items.map(item => 
            item.id === id
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      // Remove an item from cart
      removeItem: (id: number) => {
        const { items } = get();
        set({
          items: items.filter(item => item.id !== id)
        });
      },
      
      // Clear all items from cart
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'ondc-cart-storage',
    }
  )
);

// User types and state
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'ondc-user-storage',
    }
  )
);

// Custom hook to access cart state with computed values
export function useCart(): CartStateExtended {
  const cart = useCartStore();
  const [cartState, setCartState] = useState<CartStateExtended>({
    ...cart,
    itemCount: 0,
    subtotal: 0
  });

  useEffect(() => {
    // Calculate derived values
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
    
    const subtotal = cart.items.reduce((total, item) => {
      const itemPrice = item.salePrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    
    setCartState({
      ...cart,
      itemCount,
      subtotal
    });
  }, [cart, cart.items]);

  return cartState;
}