import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Define a basic Product interface for internal use
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categorySlug?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  salePrice?: number;
}

export default function Home() {
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Fetch all products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch categories (can be extracted from products or fetched separately)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<{name: string, slug: string}[]>({
    queryKey: ['/api/categories'],
  });
  
  // Function to add product to cart
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.imageUrl
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      variant: "success"
    });
  };
  
  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categorySlug === selectedCategory)
    : products;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-600 rounded-xl p-8 mb-10 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Fresh meals delivered to your doorstep
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Discover delicious food from local kitchens through India's open network for digital commerce.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/store/kitchens">
              Explore Kitchens
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Categories */}
      {categoriesLoading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              onClick={() => setSelectedCategory(null)}
              className="mb-2"
            >
              All
            </Button>
            
            {categories?.map((category: any) => (
              <Button 
                key={category.slug} 
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.slug)}
                className="mb-2"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Products Grid */}
      <h2 className="text-2xl font-bold mb-6">
        {selectedCategory ? `${selectedCategory} Items` : 'All Items'}
      </h2>
      
      {productsLoading ? (
        <div className="flex justify-center my-10">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : filteredProducts?.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any products in this category.
          </p>
          <Button onClick={() => setSelectedCategory(null)}>
            View All Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts?.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-all hover:shadow-lg">
              {product.imageUrl && (
                <Link href={`/store/product/${product.id}`}>
                  <a className="block h-48 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                </Link>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/store/product/${product.id}`}>
                    <a className="block">
                      <h3 className="font-medium text-gray-900 hover:text-primary">{product.name}</h3>
                    </a>
                  </Link>
                  {product.isVeg && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Veg</span>
                  )}
                </div>
                
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">
                    ₹{product.price.toFixed(2)}
                    {product.salePrice && (
                      <span className="ml-2 text-sm line-through text-gray-400">
                        ₹{product.salePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                  >
                    {product.isAvailable ? 'Add' : 'Sold Out'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}