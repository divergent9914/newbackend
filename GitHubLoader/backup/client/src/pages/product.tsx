import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart as CartDrawer } from "@/components/shopping-cart";
import { getUserId } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Review } from "@shared/schema";

export default function ProductPage() {
  const [match, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: productData, isLoading } = useQuery<{ product: Product }>({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery<{ reviews: Review[] }>({
    queryKey: [`/api/products/${params?.id}/reviews`],
    enabled: !!params?.id,
  });

  const product = productData?.product;
  const reviews = reviewsData?.reviews || [];

  // Calculate average rating
  const avgRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: "You've reached the maximum available stock for this product",
        variant: "destructive"
      });
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      await addToCart({
        product_id: product.id,
        user_id: userId,
        quantity
      });

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest('POST', '/api/wishlist', {
        product_id: product.id,
        user_id: userId
      });

      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="w-full h-96 bg-gray-300 animate-pulse rounded-lg"></div>
          </div>
          <div className="md:w-1/2">
            <div className="h-8 w-3/4 bg-gray-300 animate-pulse rounded mb-4"></div>
            <div className="h-5 w-1/2 bg-gray-300 animate-pulse rounded mb-4"></div>
            <div className="h-6 w-1/3 bg-gray-300 animate-pulse rounded mb-4"></div>
            <div className="h-24 w-full bg-gray-300 animate-pulse rounded mb-4"></div>
            <div className="h-10 w-full bg-gray-300 animate-pulse rounded mb-4"></div>
            <div className="h-12 w-full bg-gray-300 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" size="lg" asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-6" asChild>
        <a href="javascript:history.back()">
          <ChevronLeft className="mr-2" size={16} />
          Back to products
        </a>
      </Button>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.brand}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={star <= Math.round(parseFloat(avgRating)) ? "fill-yellow-400" : ""}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{avgRating} ({reviews.length} reviews)</span>
          </div>
          
          <div className="mb-4">
            <span className="text-2xl font-bold">${Number(product.price).toFixed(2)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-medium line-through ml-2">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
            {product.on_sale && (
              <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                SALE
              </span>
            )}
          </div>
          
          <p className="text-gray-700 mb-6">
            {product.description}
          </p>
          
          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleIncreaseQuantity}
                disabled={product.stock <= quantity}
              >
                <Plus size={16} />
              </Button>
              <span className="ml-4 text-sm text-gray-500">
                {product.stock} in stock
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-4">
            <Button 
              className="flex-grow"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2" size={18} />
              Add to Cart
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddToWishlist}
            >
              <Heart size={18} />
            </Button>
          </div>
          
          {/* Out of stock notification */}
          {product.stock === 0 && (
            <p className="mt-4 text-red-500 text-sm">
              This product is currently out of stock.
            </p>
          )}
        </div>
      </div>
      
      {/* Reviews section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? "fill-yellow-400" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CartDrawer />
    </div>
  );
}
