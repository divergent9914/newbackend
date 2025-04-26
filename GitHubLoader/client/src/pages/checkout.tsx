import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  useCartStore, 
  useLocationStore, 
  useOrderStore, 
  useUserStore,
  useUIStore
} from "@/lib/store";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { ChevronLeft, CircleDollarSign, MapPin, X } from "lucide-react";
import { DeliveryFeeCalculator } from "@/components/delivery-fee-calculator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrderMode } from "@/lib/types";

const addressSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["online", "cod"])
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function Checkout() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { items, getTotalPrice, getTotalItems, orderMode, clearCart } = useCartStore();
  const { selectedKitchen } = useLocationStore();
  const { selectedSlot, setDeliveryAddress } = useOrderStore();
  const { isAuthenticated, user } = useUserStore();
  const { openAuthModal } = useUIStore();
  
  const subtotal = getTotalPrice();
  const deliveryFee = 0; // This will be calculated by DeliveryFeeCalculator component
  const platformFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee + platformFee;
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.name || "",
      streetAddress: user?.address || "",
      city: selectedKitchen?.city || "Guwahati",
      phoneNumber: user?.phone || "",
      deliveryInstructions: "",
      paymentMethod: "online"
    }
  });
  
  const handleSubmit = async (data: AddressFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to complete your order",
        variant: "destructive"
      });
      openAuthModal();
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some items to place an order.",
        variant: "destructive"
      });
      return;
    }
    
    if (orderMode === "delivery" && !selectedKitchen) {
      toast({
        title: "Select delivery location",
        description: "Please select a delivery location to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the order data
      const orderData = {
        kitchenId: selectedKitchen?.id || 1,
        orderMode,
        deliverySlotId: selectedSlot?.id || null,
        deliveryAddress: orderMode === "delivery" 
          ? `${data.fullName}, ${data.streetAddress}, ${data.city}, ${data.phoneNumber}${data.deliveryInstructions ? `, ${data.deliveryInstructions}` : ""}`
          : null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes
        })),
        subtotal: subtotal.toString(),
        deliveryFee: deliveryFee.toString(),
        serviceFee: platformFee.toString(),
        total: total.toString()
      };
      
      // Store delivery address in order store for future reference
      if (orderMode === "delivery" && data.streetAddress) {
        setDeliveryAddress(data.streetAddress);
      }
      
      // Call the API to create the order
      await apiRequest("POST", "/api/orders", orderData);
      
      // Clear the cart after successful order
      clearCart();
      
      // Show success message
      toast({
        title: "Order placed successfully!",
        description: `Your order #${generateOrderNumber()} has been placed.`,
      });
      
      // Navigate to order confirmation page (to be implemented)
      window.location.href = "/";
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Failed to place order",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <X className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            You haven't added any items to your cart yet.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {orderMode === OrderMode.DELIVERY ? "Delivery" : orderMode === OrderMode.TAKEAWAY ? "Takeaway" : "Dine-in"} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderMode === OrderMode.DELIVERY && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          {...form.register("fullName")} 
                          placeholder="Enter your full name" 
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          {...form.register("phoneNumber")} 
                          placeholder="Enter your phone number" 
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input 
                        id="streetAddress" 
                        {...form.register("streetAddress")} 
                        placeholder="Enter your street address" 
                      />
                      {form.formState.errors.streetAddress && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.streetAddress.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        {...form.register("city")} 
                        placeholder="Enter your city" 
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                      <Textarea 
                        id="deliveryInstructions" 
                        {...form.register("deliveryInstructions")} 
                        placeholder="Add any specific delivery instructions" 
                      />
                    </div>
                  </>
                )}
                
                {orderMode === OrderMode.TAKEAWAY && (
                  <div className="py-4 text-center">
                    <p className="mb-4">
                      You've selected takeaway from <strong>{selectedKitchen?.name}</strong>. 
                      Your order will be prepared and ready for pickup.
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          {...form.register("fullName")} 
                          placeholder="Enter your full name" 
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          {...form.register("phoneNumber")} 
                          placeholder="Enter your phone number" 
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {orderMode === OrderMode.DINE_IN && (
                  <div className="py-4 text-center">
                    <p className="mb-4">
                      You've selected dine-in at <strong>{selectedKitchen?.name}</strong>. 
                      Your order will be prepared and served at your table.
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          {...form.register("fullName")} 
                          placeholder="Enter your full name" 
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          {...form.register("phoneNumber")} 
                          placeholder="Enter your phone number" 
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CircleDollarSign className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="online"
                  {...form.register("paymentMethod")}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1">Online Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : `Place Order • ${formatCurrency(total)}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-start">
                      <div className="font-medium">
                        {item.quantity} x {item.product?.name}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(Number(item.product?.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {orderMode === OrderMode.DELIVERY && (
                  <DeliveryFeeCalculator />
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}