import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-rose-500 p-6 text-center text-white shadow-lg">
      <button
        className="absolute right-2 top-2 rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      
      <h3 className="text-lg font-bold sm:text-xl">First Order 50% OFF!</h3>
      <p className="mt-2 text-sm text-white/90 sm:text-base">
        Use code <span className="font-mono font-bold">AAMIS50</span> at checkout
      </p>
      
      <Button 
        variant="outline" 
        className="mt-4 bg-white/10 text-white hover:bg-white/20"
      >
        Order Now
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
