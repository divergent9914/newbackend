import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X, Minus, Plus, ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";

export function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Animation states
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Reset quantity when product changes
  useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setSelectedColor("black");
    }
  }, [quickViewProduct]);

  // Handle animations
  useEffect(() => {
    if (quickViewProduct) {
      setIsVisible(true);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [quickViewProduct, isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    const timer = setTimeout(() => {
      closeQuickView();
      setIsClosing(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleIncreaseQuantity = () => {
    if (quickViewProduct && quantity < (quickViewProduct.stock || 100)) {
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
    if (!quickViewProduct) return;
    
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
        product_id: quickViewProduct.id,
        user_id: userId,
        quantity
      });

      toast({
        title: "Added to cart",
        description: `${quickViewProduct.name} has been added to your cart`,
      });
      
      // Close modal after adding to cart
      closeQuickView();
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

  const handleAddToWishlist = async () => {
    if (!quickViewProduct) return;
    
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
        product_id: quickViewProduct.id,
        user_id: userId
      });

      toast({
        title: "Added to wishlist",
        description: `${quickViewProduct.name} has been added to your wishlist`,
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

  if (!isVisible || !quickViewProduct) return null;

  // Calculate discount percentage
  const discountPercentage = quickViewProduct.original_price
    ? Math.round(((Number(quickViewProduct.original_price) - Number(quickViewProduct.price)) / Number(quickViewProduct.original_price)) * 100)
    : 0;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center transition-opacity"
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-4xl bg-white rounded-lg shadow-lg transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark z-10"
          onClick={handleClose}
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 p-6">
            <img 
              src={quickViewProduct.image_url} 
              alt={quickViewProduct.name} 
              className="w-full h-auto object-cover rounded"
            />
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <h2 className="text-2xl font-bold mb-2">{quickViewProduct.name}</h2>
            <p className="text-gray-medium mb-4">{quickViewProduct.brand}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= Math.round(Number(quickViewProduct.rating)) ? "fill-yellow-400" : ""}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-medium ml-2">
                {quickViewProduct.rating} ({quickViewProduct.review_count} reviews)
              </span>
            </div>
            
            <div className="mb-4">
              <span className="text-2xl font-bold">${Number(quickViewProduct.price).toFixed(2)}</span>
              {quickViewProduct.original_price && (
                <>
                  <span className="text-sm text-gray-medium line-through ml-2">
                    ${Number(quickViewProduct.original_price).toFixed(2)}
                  </span>
                  <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
            
            <p className="text-gray-medium mb-4">
              {quickViewProduct.description}
            </p>
            
            {/* Color Options - Mocked as this wasn't in the schema */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Color</h3>
              <div className="flex space-x-2">
                <button 
                  className={`w-8 h-8 rounded-full bg-black ${selectedColor === 'black' ? 'border-2 border-primary' : 'border border-gray-300'}`}
                  onClick={() => setSelectedColor('black')}
                ></button>
                <button 
                  className={`w-8 h-8 rounded-full bg-white ${selectedColor === 'white' ? 'border-2 border-primary' : 'border border-gray-300'}`}
                  onClick={() => setSelectedColor('white')}
                ></button>
                <button 
                  className={`w-8 h-8 rounded-full bg-red-500 ${selectedColor === 'red' ? 'border-2 border-primary' : 'border border-gray-300'}`}
                  onClick={() => setSelectedColor('red')}
                ></button>
                <button 
                  className={`w-8 h-8 rounded-full bg-blue-500 ${selectedColor === 'blue' ? 'border-2 border-primary' : 'border border-gray-300'}`}
                  onClick={() => setSelectedColor('blue')}
                ></button>
              </div>
            </div>
            
            {/* Quantity Selector */}
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
                  disabled={quickViewProduct.stock <= quantity}
                >
                  <Plus size={16} />
                </Button>
                {quickViewProduct.stock > 0 && (
                  <span className="ml-4 text-sm text-gray-500">
                    {quickViewProduct.stock} in stock
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                className="flex-grow"
                onClick={handleAddToCart}
                disabled={isAddingToCart || quickViewProduct.stock <= 0}
              >
                <ShoppingCart className="mr-2" size={18} />
                Add to Cart
              </Button>
              <Button 
                variant="outline"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
              >
                <Heart size={18} />
              </Button>
            </div>
            
            {/* Link to Product Page */}
            <div className="mt-6 text-center">
              <Link href={`/product/${quickViewProduct.id}`}>
                <a className="text-primary hover:underline">View Full Details</a>
              </Link>
            </div>
            
            {/* Out of stock notification */}
            {quickViewProduct.stock <= 0 && (
              <p className="mt-4 text-red-500 text-sm">
                This product is currently out of stock.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
