import { useUIStore, useCartStore, useOrderStore } from "@/lib/store";
import { OrderMode } from "@/lib/types";
import { X, Calendar, ShoppingBag, Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUserStore, useLocationStore } from "@/lib/store";
import { format } from "date-fns";

export default function CartSheet() {
  const { isCartOpen, toggleCart, openDeliverySlotModal, openLocationSelector, toggleAuthModal } = useUIStore();
  const { items, removeItem, updateItemQuantity, orderMode, setOrderMode, getTotalPrice, clearCart } = useCartStore();
  const { selectedSlot, deliveryAddress } = useOrderStore();
  const { isAuthenticated } = useUserStore();
  const { selectedKitchen } = useLocationStore();
  const { toast } = useToast();

  const deliveryFee = orderMode === OrderMode.DELIVERY ? 40 : 0;
  const serviceFee = 20;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee + serviceFee;

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toggleAuthModal();
        return null;
      }

      if (!selectedKitchen) {
        openLocationSelector();
        return null;
      }

      if (orderMode === OrderMode.DELIVERY && (!selectedSlot || !deliveryAddress)) {
        openDeliverySlotModal();
        return null;
      }

      const response = await apiRequest("POST", "/api/orders", {
        kitchenId: selectedKitchen.id,
        orderMode,
        deliverySlotId: selectedSlot?.id || null,
        deliveryAddress: deliveryAddress || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || ""
        })),
        subtotal: subtotal.toString(),
        deliveryFee: deliveryFee.toString(),
        serviceFee: serviceFee.toString(),
        total: total.toString()
      });

      return await response.json();
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${data.id} has been placed.`
        });
        clearCart();
        toggleCart();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 h-full sm:max-w-sm w-3/4 z-50">
      <div className="fixed inset-0 bg-black/80" onClick={toggleCart}></div>
      <div className="fixed inset-y-0 right-0 h-full border-l bg-background p-6 shadow-lg transition ease-in-out w-3/4 sm:max-w-sm flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={toggleCart}>
            <X size={18} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Order Type */}
        <ToggleGroup 
          type="single" 
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full"
          value={orderMode}
          onValueChange={(value) => {
            if (value) setOrderMode(value as OrderMode);
          }}
        >
          <ToggleGroupItem value={OrderMode.DELIVERY} className="flex-1">Delivery</ToggleGroupItem>
          <ToggleGroupItem value={OrderMode.TAKEAWAY} className="flex-1">Takeaway</ToggleGroupItem>
          <ToggleGroupItem value={OrderMode.DINE_IN} className="flex-1">Dine-in</ToggleGroupItem>
        </ToggleGroup>
        
        {/* Delivery schedule for delivery mode */}
        {orderMode === OrderMode.DELIVERY && (
          <Button 
            variant="outline" 
            className="mt-3 flex items-center justify-between text-sm"
            onClick={openDeliverySlotModal}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Schedule Delivery</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedSlot 
                ? `${format(new Date(selectedSlot.startTime), "MMM d, h:mm a")}` 
                : "Select time"}
            </div>
          </Button>
        )}
        
        {/* Cart Items */}
        <div className="mt-4 flex-1 overflow-y-auto -mx-4 px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button className="mt-4" onClick={toggleCart}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product?.imageUrl && (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover" 
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{item.product?.name}</h4>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {item.notes}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-medium">
                          {formatCurrency(parseFloat(item.product?.price || "0") * item.quantity)}
                        </div>
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItemQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="text-xs px-2">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Summary */}
        {items.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Delivery Fee</span>
                <span className="text-sm font-medium">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Service Fee</span>
                <span className="text-sm font-medium">{formatCurrency(serviceFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full" 
              onClick={() => {
                if (!isAuthenticated) {
                  toggleAuthModal();
                  return;
                }

                if (!selectedKitchen) {
                  openLocationSelector();
                  return;
                }

                if (orderMode === OrderMode.DELIVERY && (!selectedSlot || !deliveryAddress)) {
                  openDeliverySlotModal();
                  return;
                }
                
                // Navigate to checkout page
                window.location.href = "/checkout";
                toggleCart();
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
