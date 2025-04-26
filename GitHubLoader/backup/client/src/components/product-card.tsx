import { useState } from "react";
import { Link } from "wouter";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export default function ProductCard({ product, isNew = false }: ProductCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, setQuickViewProduct } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleQuickView = () => {
    setQuickViewProduct(product);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      await addToCart({
        product_id: product.id,
        user_id: userId,
        quantity: 1
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
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingToWishlist(true);
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
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const renderRatingStars = (rating: number | string) => {
    const ratingNumber = typeof rating === 'string' ? parseFloat(rating) : rating;
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.round(ratingNumber) ? "fill-yellow-400" : ""}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <a className="relative group block">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              className="bg-white text-primary p-2 rounded-full hover:bg-gray-100" 
              title="Quick view"
              onClick={handleQuickView}
            >
              <Eye size={16} />
            </button>
            <button 
              className="bg-white text-primary p-2 rounded-full hover:bg-gray-100" 
              title="Add to wishlist"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart size={16} />
            </button>
          </div>
          {/* Sale Badge */}
          {product.on_sale && (
            <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
          {/* New Badge */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}
        </a>
      </Link>
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium mb-1">{product.name}</h3>
        <p className="text-sm text-gray-medium mb-2">{product.brand}</p>
        <div className="flex items-center mb-2">
          {renderRatingStars(product.rating)}
          <span className="text-xs text-gray-medium ml-1">({product.review_count})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold">${Number(product.price).toFixed(2)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-medium line-through ml-2">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
          </div>
          <button 
            className="bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition duration-150 disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
