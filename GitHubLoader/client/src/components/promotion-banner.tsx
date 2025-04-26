import { useState } from "react";
import { X, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface PromotionBannerProps {
  code: string;
  discount: string;
  minAmount: number;
  description: string;
}

export default function PromotionBanner({ 
  code = "AAMIS20", 
  discount = "20% off", 
  minAmount = 500,
  description = "Valid for orders above ₹500. One-time use only."
}: PromotionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { getTotalPrice, items } = useCartStore();
  const { toast } = useToast();

  const handleApplyCode = () => {
    const subtotal = getTotalPrice();
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before applying a promo code.",
        variant: "destructive"
      });
      return;
    }
    
    if (subtotal < minAmount) {
      toast({
        title: "Minimum order value not met",
        description: `Your order must be at least ₹${minAmount} to use this code.`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Promo code applied!",
      description: `${code} has been applied to your order.`
    });
  };

  if (dismissed) return null;

  return (
    <section className="py-8">
      <div className="container">
        <div className="rounded-lg bg-primary/5 border-primary/20 border p-4 md:p-6 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-6 w-6 p-0"
            onClick={() => setDismissed(true)}
          >
            <X size={18} />
            <span className="sr-only">Dismiss</span>
          </Button>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
              <Percent size={40} className="text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold gradient-text">FIRST ORDER SPECIAL</h3>
              <p className="mt-2 text-lg">
                Get {discount} on your first order with code: <span className="font-bold">{code}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              <Button className="mt-3" onClick={handleApplyCode}>
                Apply Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
