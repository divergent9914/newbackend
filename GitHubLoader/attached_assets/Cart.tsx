import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Plus, Minus, CalendarClock } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore, useUIStore, useUserStore, useLocationStore, useOrderStore } from '@/lib/store';
import { formatCurrency, getTimeSlotLabel } from '@/lib/utils';
import { Product } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
  const { isCartOpen, toggleCart, toggleDeliverySlotModal, toggleAuthModal } = useUIStore();
  const { isAuthenticated } = useUserStore();
  const { selectedKitchen } = useLocationStore();
  const { selectedSlot } = useOrderStore();
  const { items, updateItemQuantity, removeItem, orderMode, getTotalItems, clearCart } = useCartStore();
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const { toast } = useToast();

  // Fetch products data
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    enabled: items.length > 0,
  });

  // Create a map of product IDs to products
  useEffect(() => {
    if (productsData) {
      const productMap = new Map();
      productsData.forEach((product: Product) => {
        productMap.set(product.id, product);
      });
      setProducts(productMap);
    }
  }, [productsData]);

  // Calculate order summary
  const subtotal = items.reduce((total, item) => {
    const product = products.get(item.productId);
    return total + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  const deliveryFee = orderMode === 'delivery' ? 49 : 0;
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to checkout",
        variant: "destructive",
      });
      toggleCart();
      toggleAuthModal();
      return;
    }

    if (!selectedKitchen) {
      toast({
        title: "Kitchen selection required",
        description: "Please select a delivery location",
        variant: "destructive",
      });
      return;
    }

    if (orderMode === 'delivery' && !selectedSlot) {
      toast({
        title: "Delivery time required",
        description: "Please select a delivery time slot",
        variant: "destructive",
      });
      toggleDeliverySlotModal();
      return;
    }

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes
      }));

      const orderData = {
        kitchenId: selectedKitchen.id,
        orderMode,
        deliverySlotId: selectedSlot?.id,
        items: orderItems
      };

      await apiRequest('POST', '/api/orders', orderData);
      
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be processed soon",
      });
      
      // Clear cart and close cart sheet
      clearCart();
      toggleCart();
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-6">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Order
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Add items to your cart to get started
              </p>
              <Button onClick={toggleCart} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = products.get(item.productId);
                
                if (!product && !productsLoading) return null;
                
                return (
                  <div key={item.id} className="flex items-start space-x-4 py-3">
                    {/* Product image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      {productsLoading ? (
                        <div className="h-full w-full bg-muted animate-pulse" />
                      ) : product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">
                          {productsLoading ? (
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          ) : (
                            product?.name
                          )}
                        </h4>
                        <span className="text-sm font-medium">
                          {productsLoading ? (
                            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                          ) : product ? (
                            formatCurrency(product.price)
                          ) : null}
                        </span>
                      </div>
                      
                      {/* Notes */}
                      {item.notes && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {item.notes}
                        </p>
                      )}
                      
                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          
                          <span className="flex h-8 min-w-[2rem] items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <>
            {/* Delivery slot selection */}
            {orderMode === 'delivery' && (
              <div 
                className="mb-4 flex cursor-pointer items-center justify-between rounded-md border p-3"
                onClick={toggleDeliverySlotModal}
              >
                <div className="flex items-center">
                  <div className="mr-3 rounded-md bg-primary/10 p-2">
                    <CalendarClock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Delivery Time</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {selectedSlot ? (
                        getTimeSlotLabel(selectedSlot.startTime, selectedSlot.endTime)
                      ) : (
                        "Select a delivery time"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order summary */}
            <div className="space-y-3 rounded-md border bg-muted/30 p-4">
              <h3 className="font-medium">Order Summary</h3>
              
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Service Fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              
              <div className="h-px bg-border"></div>
              
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
