import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Minus, Plus, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useCartStore, type Product } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  
  // Fetch product details from API
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json() as Promise<Product>;
    }
  });
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Show a toast or confirmation
      alert(`${quantity} × ${product.name} added to cart!`);
      setQuantity(1);
    }
  };
  
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    setQuantity(value);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="md:w-1/2 h-96 bg-gray-200 rounded-lg"></div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mt-8"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 border rounded-lg bg-red-50 text-red-600">
          <h3 className="text-lg font-medium mb-2">Product not found</h3>
          <p>We couldn't find the product you're looking for.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="border rounded-lg overflow-hidden bg-white">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-96 object-contain"
            />
          </div>
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2">
          <div className="mb-2 flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded ${product.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
            {product.isPopular && (
              <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                Popular
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="h-4 w-4"
                  fill={star <= 4 ? "currentColor" : "none"} 
                  color={star <= 4 ? "#FFB800" : "#E5E7EB"} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              (24 reviews)
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-xl font-bold">
              {product.salePrice ? (
                <>
                  <span>{formatCurrency(product.salePrice / 100)}</span>
                  <span className="ml-2 text-gray-500 line-through text-base">
                    {formatCurrency(product.price / 100)}
                  </span>
                </>
              ) : (
                <span>{formatCurrency(product.price / 100)}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">{product.weight}</p>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <p className="text-gray-700 mb-4">{product.description}</p>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center border rounded-md mr-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 text-lg font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>
          
          <div className="flex items-center text-gray-500 space-x-4">
            <button className="flex items-center gap-1 hover:text-primary transition">
              <Heart className="h-4 w-4" />
              <span className="text-sm">Save</span>
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition">
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Related Products or Product Details Tabs can be added here */}
    </div>
  );
}