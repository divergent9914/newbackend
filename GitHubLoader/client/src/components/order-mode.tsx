import { useCartStore } from "@/lib/store";
import { OrderMode } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Package, Utensils, Check } from "lucide-react";

export default function OrderModeSelector() {
  const { orderMode, setOrderMode } = useCartStore();
  
  const orderModes = [
    {
      mode: OrderMode.DELIVERY,
      title: "Delivery",
      description: "Get your food delivered to your doorstep",
      icon: <Bike size={24} className={orderMode === OrderMode.DELIVERY ? "text-primary" : ""} />
    },
    {
      mode: OrderMode.TAKEAWAY,
      title: "Takeaway",
      description: "Pick up your food from our kitchen",
      icon: <Package size={24} className={orderMode === OrderMode.TAKEAWAY ? "text-primary" : ""} />
    },
    {
      mode: OrderMode.DINE_IN,
      title: "Dine In",
      description: "Enjoy your meal at our restaurant",
      icon: <Utensils size={24} className={orderMode === OrderMode.DINE_IN ? "text-primary" : ""} />
    }
  ];
  
  return (
    <section className="py-4">
      <div className="container">
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold leading-none tracking-tight">How would you like to enjoy your meal?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orderModes.map((item) => (
                <div 
                  key={item.mode}
                  className={`rounded-md ${
                    orderMode === item.mode 
                      ? 'border-2 border-primary bg-background' 
                      : 'border border-input bg-background'
                  } p-4 space-y-2 relative cursor-pointer`}
                  onClick={() => setOrderMode(item.mode)}
                >
                  {item.icon}
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {orderMode === item.mode && (
                    <div className="absolute top-2 right-2">
                      <Check size={16} className="text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
