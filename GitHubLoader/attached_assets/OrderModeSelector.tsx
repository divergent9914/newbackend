import React from 'react';
import { Truck, Bike, UtensilsCrossed } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCartStore } from '@/lib/store';
import { OrderMode } from '@/lib/types';

export default function OrderModeSelector() {
  const { orderMode, setOrderMode } = useCartStore();

  return (
    <div className="mb-4 rounded-md border p-2">
      <ToggleGroup 
        type="single" 
        variant="outline"
        value={orderMode}
        onValueChange={(value) => {
          if (value) setOrderMode(value as OrderMode);
        }}
        className="grid grid-cols-3 w-full"
      >
        <ToggleGroupItem 
          value={OrderMode.DELIVERY} 
          className="flex flex-col items-center justify-center py-2 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Delivery"
        >
          <Truck className="h-5 w-5" />
          <span className="text-xs font-medium">Delivery</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value={OrderMode.TAKEAWAY} 
          className="flex flex-col items-center justify-center py-2 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Takeaway"
        >
          <Bike className="h-5 w-5" />
          <span className="text-xs font-medium">Takeaway</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value={OrderMode.DINE_IN} 
          className="flex flex-col items-center justify-center py-2 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Dine In"
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span className="text-xs font-medium">Dine In</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
