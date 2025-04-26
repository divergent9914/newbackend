import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function Cart() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isCartOpen, toggleCart } = useUIStore();
  const { items, addToCart, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  
  const handleCheckout = async () => {
    if (totalItems === 0) return;
    
    setIsCheckingOut(true);
    try {
      // Here we would normally make an API call to create an order
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     items: items.map(item => ({
      //       productId: item.product.id,
      //       quantity: item.quantity,
      //       price: item.product.price
      //     })),
      //     totalPrice,
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create order');
      // }
      
      // For demo purposes, we'll just simulate a successful checkout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear the cart and close it
      clearCart();
      toggleCart();
      
      // Show success message
      alert('Order placed successfully! Thank you for shopping with us.');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again later.');
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  if (!isCartOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleCart}
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-bold">Your Cart ({totalItems})</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add items to get started</p>
              <button 
                onClick={toggleCart}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.product.id} className="flex border rounded-lg overflow-hidden">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col p-3">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium line-clamp-1">{item.product.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.quantity)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">{item.product.weight}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => removeFromCart(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.product, 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-medium">
                          {formatCurrency(item.product.price * item.quantity / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 space-y-4">
          {/* Summary */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(totalPrice / 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery fee</span>
                <span>{formatCurrency(items.length > 0 ? 49 : 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes</span>
                <span>{formatCurrency(Math.round(totalPrice * 0.05) / 100)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formatCurrency((totalPrice + (items.length > 0 ? 4900 : 0) + Math.round(totalPrice * 0.05)) / 100)}
                </span>
              </div>
            </div>
          )}
          
          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={totalItems === 0 || isCheckingOut}
            className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}