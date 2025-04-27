import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Loader2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

interface ProductDetailProps {
  productId: string;
}

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
  weight?: string;
  ingredients?: string;
  nutritionInfo?: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    }
  });
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.imageUrl
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart`,
      variant: "success"
    });
    
    // Reset quantity after adding to cart
    setQuantity(1);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find the product you're looking for. It might have been removed or is no longer available.
        </p>
        <Button asChild>
          <Link href="/store">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-600 hover:text-primary" 
        onClick={() => navigate("/store")}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Products
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-xl overflow-hidden h-96">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <ShoppingBag size={64} className="text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.isVeg && (
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                Vegetarian
              </span>
            )}
          </div>
          
          <div className="text-2xl font-bold mb-4 text-primary">
            ₹{product.price.toFixed(2)}
            {product.salePrice && (
              <span className="ml-3 text-base line-through text-gray-400">
                ₹{product.salePrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.weight && (
            <p className="text-sm text-gray-500 mb-4">Weight: {product.weight}</p>
          )}
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* Quantity selector */}
          <div className="mb-6">
            <p className="font-medium mb-2">Quantity</p>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <span className="w-16 text-center font-medium text-lg">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleQuantityChange(1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          {/* Add to cart button */}
          <Button 
            size="lg" 
            className="w-full md:w-auto px-8"
            disabled={!product.isAvailable}
            onClick={handleAddToCart}
          >
            {product.isAvailable 
              ? `Add to Cart • ₹${(product.price * quantity).toFixed(2)}`
              : 'Out of Stock'
            }
          </Button>
          
          {/* Product details accordion */}
          {(product.ingredients || product.nutritionInfo) && (
            <div className="mt-10 border-t pt-6">
              <h2 className="text-xl font-bold mb-4">Product Details</h2>
              
              {product.ingredients && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Ingredients</h3>
                  <p className="text-gray-700">{product.ingredients}</p>
                </div>
              )}
              
              {product.nutritionInfo && (
                <div>
                  <h3 className="font-medium mb-2">Nutrition Information</h3>
                  <p className="text-gray-700">{product.nutritionInfo}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}