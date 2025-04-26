import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Truck, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product-card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "@/components/shopping-cart";
import { QuickViewModal } from "@/components/quick-view-modal";
import type { Category, Product } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/categories'],
  });

  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['/api/products/featured'],
  });

  // Fetch new arrivals
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['/api/products/new-arrivals'],
  });

  const handleSubscribe = () => {
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter.",
    });
  };

  return (
    <main>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-primary py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Summer Sale is Live!</h1>
              <p className="text-lg md:text-xl mb-6 text-blue-100">Up to 40% off on selected items. Limited time offer.</p>
              <Button variant="secondary" size="lg">
                Shop Now
              </Button>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
                alt="Summer sale promotion with woman shopping" 
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-full h-40 bg-gray-300 animate-pulse"></div>
                  <div className="p-3 bg-gray-ultralight">
                    <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              categoriesData?.categories.slice(0, 4).map(category => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <a className="group cursor-pointer">
                    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                      <img 
                        src={category.image_url} 
                        alt={`${category.name} category`} 
                        className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="p-3 bg-gray-ultralight">
                        <h3 className="font-medium text-center">{category.name}</h3>
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/category/all">
              <a className="text-primary hover:underline font-medium flex items-center">
                View All <ArrowRight className="ml-1" size={16} />
              </a>
            </Link>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-full h-64 bg-gray-300 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredData?.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-secondary to-yellow-500 rounded-xl overflow-hidden shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Get 15% Off Your First Order</h2>
                <p className="text-white mb-6">Sign up for our newsletter and receive a discount code instantly.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    className="px-4 py-3 rounded-lg flex-grow bg-white"
                  />
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={handleSubscribe}
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80" 
                  alt="Special offer promotion" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Link href="/category/all?sort=newest">
              <a className="text-primary hover:underline font-medium flex items-center">
                View All <ArrowRight className="ml-1" size={16} />
              </a>
            </Link>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivalsLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-full h-64 bg-gray-300 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              newArrivalsData?.products.map(product => (
                <ProductCard key={product.id} product={product} isNew />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-gray-ultralight">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mb-4 text-primary text-3xl">
                <Truck className="mx-auto" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free & Fast Delivery</h3>
              <p className="text-gray-medium">Free shipping on all orders over $50</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mb-4 text-primary text-3xl">
                <RotateCcw className="mx-auto" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-medium">30-day money back guarantee</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mb-4 text-primary text-3xl">
                <Lock className="mx-auto" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-medium">Protected by industry-leading encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart and Quick View Modal components */}
      <ShoppingCart />
      <QuickViewModal />
    </main>
  );
}
