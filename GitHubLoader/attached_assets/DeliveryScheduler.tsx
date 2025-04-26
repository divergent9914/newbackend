import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore, useOrderStore } from '@/lib/store';
import { getTimeSlotLabel } from '@/lib/utils';

export default function DeliveryScheduler() {
  const { openDeliverySlotModal } = useUIStore();
  const { selectedSlot } = useOrderStore();

  return (
    <Button 
      variant="outline" 
      className="flex items-center justify-center gap-2 h-16"
      onClick={openDeliverySlotModal}
    >
      <CalendarClock className="h-5 w-5" />
      <div className="text-left">
        <p className="text-sm font-medium">Delivery Time</p>
        <p className="text-xs text-muted-foreground">
          {selectedSlot 
            ? getTimeSlotLabel(selectedSlot.startTime, selectedSlot.endTime)
            : 'Schedule your delivery'}
        </p>
      </div>
    </Button>
  );
}
