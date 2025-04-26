import { useState, useEffect } from "react";
import { useUIStore, useOrderStore } from "@/lib/store";
import { DeliverySlot } from "@/lib/types";
import { format, addDays, isSameDay } from "date-fns";
import { Check, Clock3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function DeliverySlotModal() {
  const { isDeliverySlotModalOpen, closeDeliverySlotModal } = useUIStore();
  const { selectedSlot, setSelectedSlot, deliveryAddress, setDeliveryAddress } = useOrderStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [address, setAddress] = useState(deliveryAddress);
  const { toast } = useToast();

  const { data: slots, isLoading } = useQuery({
    queryKey: ['/api/delivery-slots', format(selectedDate, 'yyyy-MM-dd')],
    enabled: isDeliverySlotModalOpen
  });

  useEffect(() => {
    if (deliveryAddress) {
      setAddress(deliveryAddress);
    }
  }, [deliveryAddress, isDeliverySlotModalOpen]);

  const getDates = () => {
    const today = new Date();
    // Generate dates for next 5 days
    return Array(5).fill(0).map((_, i) => addDays(today, i));
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast({
        title: "Select a time slot",
        description: "Please select a delivery time slot to continue",
        variant: "destructive"
      });
      return;
    }

    if (!address.trim()) {
      toast({
        title: "Enter delivery address",
        description: "Please enter your delivery address to continue",
        variant: "destructive"
      });
      return;
    }

    setDeliveryAddress(address);
    closeDeliverySlotModal();
  };

  if (!isDeliverySlotModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Select Delivery Time</h2>
          <p className="text-sm text-muted-foreground">Choose when you'd like your food delivered</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Date selection */}
          <div className="flex overflow-x-auto pb-2 -mx-1">
            {getDates().map((date, index) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <div key={date.toString()} className="flex-shrink-0 px-1">
                  <button 
                    className={`flex flex-col items-center justify-center h-20 w-16 rounded-md border ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-xs text-muted-foreground uppercase">
                      {isToday ? 'Today' : format(date, 'EEE')}
                    </span>
                    <span className="text-lg font-medium">{format(date, 'd')}</span>
                    <span className="text-xs">{format(date, 'MMM')}</span>
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Time slots */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-2">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : slots && slots.length > 0 ? (
                slots.map((slot: DeliverySlot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  
                  return (
                    <button 
                      key={slot.id}
                      className={`flex items-center justify-between rounded-md border p-3 hover:bg-accent hover:text-accent-foreground ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-input bg-background'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock3 size={16} />
                        <span className="text-sm">
                          {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                        </span>
                      </div>
                      {isSelected && <Check size={16} className="text-primary" />}
                    </button>
                  );
                })
              ) : (
                <p className="col-span-2 text-center text-sm text-muted-foreground py-4">
                  No delivery slots available for this date
                </p>
              )}
            </div>
          </div>
          
          {/* Delivery address */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Delivery Address</h3>
            <Textarea
              placeholder="Enter your complete delivery address with landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-20"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDeliverySlotModal}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm Schedule</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
