import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocationStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import OrderModeSelector from '@/components/OrderModeSelector';
import RawSection from '@/components/RawSection';
import PromoBanner from '@/components/PromoBanner';
import DeliveryScheduler from '@/components/DeliveryScheduler';
import ProductGrid from '@/components/ProductGrid';

export default function Home() {
  const { selectedKitchen, setSelectedKitchen, openLocationSelector } = useLocationStore();
  
  // Fetch kitchens if no kitchen is selected
  const { data: kitchens } = useQuery({
    queryKey: ['/api/kitchens'],
    enabled: !selectedKitchen
  });
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Auto-select the first kitchen if none is selected
  useEffect(() => {
    if (!selectedKitchen && kitchens && kitchens.length > 0) {
      setSelectedKitchen(kitchens[0]);
    }
  }, [kitchens, selectedKitchen, setSelectedKitchen]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Promo Banner */}
      <PromoBanner />

      {/* Delivery Options */}
      <div className="mb-8">
        <OrderModeSelector />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-16"
            onClick={openLocationSelector}
          >
            <Map className="h-5 w-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Delivery Location</p>
              <p className="text-xs text-muted-foreground">
                {selectedKitchen ? `${selectedKitchen.name}, ${selectedKitchen.area}` : 'Select location'}
              </p>
            </div>
          </Button>
          
          <DeliveryScheduler />
        </div>
      </div>
      
      {/* Licious-inspired Raw Category Section */}
      <RawSection 
        title="Explore Raw Categories" 
        subtitle="Premium quality, farm-fresh meat" 
      />
      
      {/* Categories Section */}
      <div className="mt-8">
        {categories && categories?.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Button 
                  key={category.id} 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <img 
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-6 w-6 object-cover rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Product Grid */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Featured Products</h2>
        <ProductGrid />
      </div>
    </div>
  );
}
