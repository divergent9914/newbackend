// Enum for order modes
export enum OrderMode {
  DELIVERY = "delivery",
  TAKEAWAY = "takeaway",
  DINE_IN = "dine_in"
}

// Kitchen type
export interface Kitchen {
  id: number;
  name: string;
  area: string;
  city: string;
  openTime?: string;
  closeTime?: string;
  isActive: boolean;
  latitude?: string;
  longitude?: string;
}

// Category type
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

// Product type
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  categoryId?: number;
  categorySlug?: string;
  imageUrl?: string;
  inStock: boolean;
  kitchenId?: number;
}

// Delivery slot type
export interface DeliverySlot {
  id: number;
  startTime: string;
  endTime: string;
  capacity?: number;
  bookedCount?: number;
  kitchenId?: number;
}

// Cart item type
export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  notes?: string;
  product?: Product;
}

// User type
export interface User {
  id: number;
  phone: string;
  name?: string;
  email?: string;
  address?: string;
}

// Order item type
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  notes?: string;
  product?: Product;
}

// Order type
export interface Order {
  id: number;
  userId: number;
  kitchenId: number;
  orderMode: OrderMode;
  orderStatus: string;
  deliverySlotId?: number;
  deliveryAddress?: string;
  subtotal: string;
  deliveryFee: string;
  serviceFee: string;
  total: string;
  createdAt: string;
  items?: OrderItem[];
  kitchen?: Kitchen;
  deliverySlot?: DeliverySlot;
}

// Authentication related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface SendOtpData {
  phone: string;
}

export interface VerifyOtpData {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
