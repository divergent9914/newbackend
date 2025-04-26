import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  reviews, type Review, type InsertReview,
  wishlists, type Wishlist, type InsertWishlist
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(options?: { featured?: boolean, categoryId?: number, limit?: number, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getProductsByCategoryId(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;

  // Cart operations
  getCartItemsByUserId(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  deleteCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Order operations
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Order items operations
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Review operations
  getReviewsByProductId(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Wishlist operations
  getWishlistByUserId(userId: number): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private wishlists: Map<number, Wishlist>;

  private userId: number;
  private categoryId: number;
  private productId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private reviewId: number;
  private wishlistId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.wishlists = new Map();

    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.reviewId = 1;
    this.wishlistId = 1;

    // Initialize with some sample categories
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const sampleCategories: InsertCategory[] = [
      { name: "Electronics", slug: "electronics", image_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Clothing", slug: "clothing", image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Home & Garden", slug: "home-garden", image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Sports", slug: "sports", image_url: "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Beauty", slug: "beauty", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Toys & Games", slug: "toys-games", image_url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&h=350&q=80" },
      { name: "Books", slug: "books", image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&h=350&q=80" }
    ];

    sampleCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.supabase_id === supabaseId) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    for (const category of this.categories.values()) {
      if (category.slug === slug) {
        return category;
      }
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getProducts(options?: { featured?: boolean, categoryId?: number, limit?: number, search?: string }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (options?.featured) {
      products = products.filter(product => product.featured);
    }

    if (options?.categoryId) {
      products = products.filter(product => product.category_id === options.categoryId);
    }

    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    if (options?.limit) {
      products = products.slice(0, options.limit);
    }

    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return this.getProducts({ featured: true, limit });
  }

  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    const products = Array.from(this.products.values())
      .filter(product => product.new_arrival)
      .slice(0, limit);
    
    return products;
  }

  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return this.getProducts({ categoryId });
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Cart methods
  async getCartItemsByUserId(userId: number): Promise<CartItem[]> {
    const cartItems: CartItem[] = [];
    for (const item of this.cartItems.values()) {
      if (item.user_id === userId) {
        cartItems.push(item);
      }
    }
    return cartItems;
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if product already exists in cart
    for (const item of this.cartItems.values()) {
      if (item.user_id === cartItem.user_id && item.product_id === cartItem.product_id) {
        // Update quantity instead of creating new item
        return this.updateCartItemQuantity(item.id, item.quantity + cartItem.quantity);
      }
    }

    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      throw new Error(`Cart item with id ${id} not found`);
    }

    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.user_id === userId) {
        this.cartItems.delete(id);
      }
    }
  }

  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const orders: Order[] = [];
    for (const order of this.orders.values()) {
      if (order.user_id === userId) {
        orders.push(order);
      }
    }
    return orders.sort((a, b) => {
      // Sort by created_at in descending order
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      created_at: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order items methods
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];
    for (const item of this.orderItems.values()) {
      if (item.order_id === orderId) {
        orderItems.push(item);
      }
    }
    return orderItems;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Review methods
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    const reviews: Review[] = [];
    for (const review of this.reviews.values()) {
      if (review.product_id === productId) {
        reviews.push(review);
      }
    }
    return reviews.sort((a, b) => {
      // Sort by created_at in descending order
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = { ...review, id, created_at: new Date() };
    this.reviews.set(id, newReview);
    
    // Update product rating and review count
    const product = this.products.get(review.product_id);
    if (product) {
      const reviews = await this.getReviewsByProductId(review.product_id);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = (totalRating / reviews.length).toFixed(1);
      
      await this.updateProduct(product.id, {
        rating: avgRating as unknown as number, // type conversion needed due to numeric type
        review_count: reviews.length
      });
    }
    
    return newReview;
  }

  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    const wishlistItems: Wishlist[] = [];
    for (const item of this.wishlists.values()) {
      if (item.user_id === userId) {
        wishlistItems.push(item);
      }
    }
    return wishlistItems;
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if product already exists in wishlist
    for (const item of this.wishlists.values()) {
      if (item.user_id === wishlist.user_id && item.product_id === wishlist.product_id) {
        return item;
      }
    }

    const id = this.wishlistId++;
    const newWishlistItem: Wishlist = { ...wishlist, id };
    this.wishlists.set(id, newWishlistItem);
    return newWishlistItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    for (const [id, item] of this.wishlists.entries()) {
      if (item.user_id === userId && item.product_id === productId) {
        this.wishlists.delete(id);
        break;
      }
    }
  }
}

export const storage = new MemStorage();
