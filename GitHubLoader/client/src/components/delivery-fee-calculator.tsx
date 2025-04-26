import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateDeliveryFee, formatCurrency } from "@/lib/utils";
import { useCartStore, useLocationStore, useUserStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Component to calculate and display delivery fee based on distance and order value
 */
export function DeliveryFeeCalculator() {
  const { selectedKitchen } = useLocationStore();
  const { getTotalPrice, orderMode } = useCartStore();
  const { user } = useUserStore();
  
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Check if user has a subscription - this would come from user data in a real app
  const hasSubscription = user !== null;
  const isDelivery = orderMode === "delivery";
  const subtotal = getTotalPrice();
  
  // Calculate distance when kitchen changes
  useEffect(() => {
    if (!selectedKitchen || !isDelivery) return;
    
    // In a real app, get the user's location and calculate distance
    // For now, we'll use a mock distance
    setDistance(3.2);
  }, [selectedKitchen, isDelivery]);
  
  // Calculate delivery fee when relevant factors change
  useEffect(() => {
    const calculateFee = async () => {
      if (!isDelivery || !distance) {
        setDeliveryFee(0);
        return;
      }
      
      setIsCalculating(true);
      try {
        const fee = await calculateDeliveryFee(distance, subtotal, hasSubscription);
        setDeliveryFee(fee);
      } catch (error) {
        console.error("Failed to calculate delivery fee:", error);
        setDeliveryFee(0);
      } finally {
        setIsCalculating(false);
      }
    };
    
    calculateFee();
  }, [distance, subtotal, hasSubscription, isDelivery]);
  
  if (!isDelivery) return null;
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            Delivery Fee Calculation
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <Info size={14} />
                    <span className="sr-only">Delivery fee info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p className="text-sm">
                    Delivery fee is calculated based on distance, order value, and subscription status.
                    Orders above ₹500 get free delivery within 5km.
                    Subscribers enjoy free delivery within 5km on all orders.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          
          {hasSubscription && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Subscriber
            </Badge>
          )}
        </div>
        
        <Separator className="my-3" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Distance</span>
            {distance ? (
              <span>{distance} km</span>
            ) : (
              <Skeleton className="h-4 w-12" />
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Value</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {distance && distance > 1 && (
            <>
              {subtotal >= 500 && distance <= 5 && (
                <div className="text-xs text-green-600 font-medium">
                  Free delivery on orders above ₹500 within 5km!
                </div>
              )}
              
              {hasSubscription && distance <= 5 && (
                <div className="text-xs text-green-600 font-medium">
                  Free delivery within 5km for subscribers!
                </div>
              )}
            </>
          )}
          
          <Separator className="my-1" />
          
          <div className="flex justify-between font-medium">
            <span>Delivery Fee</span>
            {isCalculating ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <span>{formatCurrency(deliveryFee || 0)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}