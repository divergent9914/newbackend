import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X, Plus, Minus, ShoppingCart as CartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function ShoppingCart() {
  const { isCartOpen, closeCart, cartItems, cart, removeFromCart, updateCartItemQuantity } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  // Animation states
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if cart is empty
  const isEmpty = cartItems.length === 0;

  // Handle animations
  useEffect(() => {
    if (isCartOpen) {
      setIsVisible(true);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen, isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    const timer = setTimeout(() => {
      closeCart();
      setIsClosing(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleIncreaseQuantity = (id: number, currentQuantity: number, maxStock: number = 100) => {
    if (currentQuantity < maxStock) {
      updateCartItemQuantity(id, currentQuantity + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: "You've reached the maximum available stock for this product",
        variant: "destructive"
      });
    }
  };

  const handleDecreaseQuantity = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItemQuantity(id, currentQuantity - 1);
    } else {
      removeFromCart(id);
    }
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      closeCart();
      toast({
        title: "Please sign in",
        description: "You need to be signed in to proceed to checkout",
        variant: "destructive"
      });
      return;
    }

    if (isEmpty) {
      toast({
        title: "Your cart is empty",
        description: "Add some products to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    closeCart();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 transition-opacity" onClick={handleClose}>
      <div 
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Cart ({cartItems.length})</h3>
            <button 
              className="text-gray-medium hover:text-gray-dark"
              onClick={handleClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-auto p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CartIcon size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Looks like you haven't added any products to your cart yet.</p>
                <Button onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b">
                  <img 
                    src={item.product?.image_url} 
                    alt={item.product?.name} 
                    className="w-20 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-sm text-gray-medium">
                      {item.product?.brand ? `${item.product.brand} | ` : ''}{item.quantity} unit{item.quantity > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center mt-2">
                      <button 
                        className="text-gray-medium hover:text-primary"
                        onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button 
                        className="text-gray-medium hover:text-primary"
                        onClick={() => handleIncreaseQuantity(item.id, item.quantity, item.product?.stock)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(Number(item.product?.price) * item.quantity).toFixed(2)}</p>
                    <button 
                      className="text-gray-medium hover:text-error text-sm mt-2"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X size={14} className="inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {!isEmpty && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-medium">Subtotal</span>
                <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-medium">Shipping</span>
                <span className="font-semibold">${cart.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-medium">Tax</span>
                <span className="font-semibold">${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6 pb-4 border-b">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <Link href="/checkout">
                <Button 
                  className="w-full mb-2"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
