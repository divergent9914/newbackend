import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  categorySlug: string;
  weight: string;
  isAvailable: boolean;
  isVeg: boolean;
  isPopular?: boolean;
}

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// UI State for controlling modals, cart, etc.
interface UIState {
  isCartOpen: boolean;
  toggleCart: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));

// Cart State
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  removeFromCart: (productId: string, quantity?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // Add a product to cart
      addItem: (product: Product) => {
        const { items } = get();
        const existingItem = items.find(item => item.product.id === product.id);
        
        if (existingItem) {
          // If item already exists, increase quantity
          set({
            items: items.map(item => 
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          // Otherwise add new item
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      
      // Update quantity of an item
      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        if (quantity < 1) {
          return;
        }
        
        set({
          items: items.map(item => 
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      // Remove an item from cart
      removeItem: (productId: string) => {
        const { items } = get();
        set({
          items: items.filter(item => item.product.id !== productId)
        });
      },
      
      // Add to cart with optional quantity
      addToCart: (product: Product, quantity: number = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.product.id === product.id);
        
        if (existingItem) {
          // If item already exists, increase quantity by specified amount
          set({
            items: items.map(item => 
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          // Otherwise add new item with the specified quantity
          set({ items: [...items, { product, quantity }] });
        }
      },
      
      // Remove from cart with optional quantity
      removeFromCart: (productId: string, quantity: number = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.product.id === productId);
        
        if (!existingItem) return;
        
        // If quantity to remove is greater than or equal to item quantity, remove completely
        if (existingItem.quantity <= quantity) {
          set({
            items: items.filter(item => item.product.id !== productId)
          });
        } else {
          // Otherwise decrease the quantity
          set({
            items: items.map(item => 
              item.product.id === productId
                ? { ...item, quantity: item.quantity - quantity }
                : item
            )
          });
        }
      },
      
      // Clear all items from cart
      clearCart: () => set({ items: [] }),
      
      // Get total number of items
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get total price
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product.salePrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'ondc-cart-storage',
    }
  )
);