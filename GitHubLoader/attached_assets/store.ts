import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderMode, Kitchen, User, DeliverySlot, CartItem, Product } from './types';

// UI State
interface UIState {
  theme: 'light' | 'dark';
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  isDeliverySlotModalOpen: boolean;
  isLocationSelectorOpen: boolean;
  toggleTheme: () => void;
  toggleCart: () => void;
  toggleAuthModal: () => void;
  toggleDeliverySlotModal: () => void;
  openDeliverySlotModal: () => void;
  closeDeliverySlotModal: () => void;
  openLocationSelector: () => void;
  closeLocationSelector: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isCartOpen: false,
  isAuthModalOpen: false,
  isDeliverySlotModalOpen: false,
  isLocationSelectorOpen: false,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleAuthModal: () => set((state) => ({ isAuthModalOpen: !state.isAuthModalOpen })),
  toggleDeliverySlotModal: () => set((state) => ({ isDeliverySlotModalOpen: !state.isDeliverySlotModalOpen })),
  openDeliverySlotModal: () => set({ isDeliverySlotModalOpen: true }),
  closeDeliverySlotModal: () => set({ isDeliverySlotModalOpen: false }),
  openLocationSelector: () => set({ isLocationSelectorOpen: true }),
  closeLocationSelector: () => set({ isLocationSelectorOpen: false }),
}));

// Location/Kitchen State
interface LocationState {
  selectedKitchen: Kitchen | null;
  setSelectedKitchen: (kitchen: Kitchen) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedKitchen: null,
      setSelectedKitchen: (kitchen) => set({ selectedKitchen: kitchen }),
    }),
    {
      name: 'aamis-location-storage',
    }
  )
);

// User Auth State
interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'aamis-user-storage',
    }
  )
);

// Cart State
interface CartState {
  items: CartItem[];
  orderMode: OrderMode;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setOrderMode: (mode: OrderMode) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderMode: OrderMode.DELIVERY,
      addItem: (item) => {
        const items = get().items;
        // Check if the item already exists
        const existingItemIndex = items.findIndex(
          (i) => i.productId === item.productId && i.notes === item.notes
        );

        if (existingItemIndex > -1) {
          // Update the quantity
          const newItems = [...items];
          newItems[existingItemIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          // Add new item
          set({ items: [...items, item] });
        }
      },
      updateItemQuantity: (id, quantity) => {
        const items = get().items;
        const newItems = items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },
      removeItem: (id) => {
        const items = get().items;
        const newItems = items.filter((item) => item.id !== id);
        set({ items: newItems });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + Number(item.product?.price || 0) * item.quantity,
          0
        );
      },
      setOrderMode: (mode) => set({ orderMode: mode }),
    }),
    {
      name: 'aamis-cart-storage',
    }
  )
);

// Order State (for delivery scheduling)
interface OrderState {
  selectedSlot: DeliverySlot | null;
  deliveryAddress: string;
  setSelectedSlot: (slot: DeliverySlot) => void;
  setDeliveryAddress: (address: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      selectedSlot: null,
      deliveryAddress: '',
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
    }),
    {
      name: 'aamis-order-storage',
    }
  )
);
