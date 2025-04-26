import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DeliverySlot } from '@/lib/types';
import { useUIStore, useOrderStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function DeliverySlotModal() {
  const { isDeliverySlotModalOpen, toggleDeliverySlotModal } = useUIStore();
  const { selectedSlot, setSelectedSlot } = useOrderStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Fetch delivery slots
  const { data: deliverySlots, isLoading } = useQuery({
    queryKey: ['/api/delivery-slots'],
  });

  // Update available dates based on fetched slots
  useEffect(() => {
    if (deliverySlots && deliverySlots.length > 0) {
      const dates = Array.from(
        new Set(
          deliverySlots.map((slot: DeliverySlot) =>
            format(new Date(slot.startTime), 'yyyy-MM-dd')
          )
        )
      ).map((dateStr) => new Date(dateStr));
      
      setAvailableDates(dates);
      
      // Pre-select date if a slot is already selected
      if (selectedSlot) {
        setSelectedDate(new Date(selectedSlot.startTime));
      }
    }
  }, [deliverySlots, selectedSlot]);

  // Filter slots for the selected date
  useEffect(() => {
    if (selectedDate && deliverySlots) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const filteredSlots = deliverySlots.filter((slot: DeliverySlot) => {
        const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
        return slotDate === selectedDateStr;
      });
      
      setSlots(filteredSlots);
    }
  }, [selectedDate, deliverySlots]);

  const handleSelectTimeSlot = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
    toggleDeliverySlotModal();
  };

  const handleClose = () => {
    toggleDeliverySlotModal();
  };

  return (
    <Dialog open={isDeliverySlotModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Delivery Time</DialogTitle>
          <DialogDescription>
            Select a convenient time for your order to be delivered
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="calendar">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="slots">
              <Clock className="mr-2 h-4 w-4" />
              Time Slots
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  // Disable dates that don't have slots
                  return (
                    !availableDates.some(
                      (availableDate) =>
                        format(availableDate, 'yyyy-MM-dd') ===
                        format(date, 'yyyy-MM-dd')
                    ) ||
                    // Disable dates in the past
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  );
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="slots">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : slots.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isFullyBooked = slot.capacity !== null && 
                                       slot.bookedCount !== null && 
                                       slot.bookedCount >= slot.capacity;
                  
                  return (
                    <Button
                      key={slot.id}
                      variant="outline"
                      className={cn(
                        "w-full justify-between",
                        selectedSlot?.id === slot.id && "border-primary",
                        isFullyBooked && "opacity-50"
                      )}
                      disabled={isFullyBooked}
                      onClick={() => handleSelectTimeSlot(slot)}
                    >
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                          {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                        </span>
                      </div>
                      {slot.capacity !== null && slot.bookedCount !== null && (
                        <span className="text-xs text-muted-foreground">
                          {slot.capacity - slot.bookedCount} slots left
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">
                  No delivery slots available for this date.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please select another date from the calendar.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
