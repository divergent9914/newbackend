import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocationStore, useUIStore } from '@/lib/store';
import { Kitchen } from '@shared/schema';

interface LocationSelectorProps {
  isButton?: boolean;
}

export default function LocationSelector({ isButton }: LocationSelectorProps = {}) {
  const { isLocationSelectorOpen, closeLocationSelector, openLocationSelector } = useUIStore();
  const { selectedKitchen, setSelectedKitchen } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'list' | 'map'>('list');

  // Fetch kitchen data
  const { data: kitchens, isLoading } = useQuery({
    queryKey: ['/api/kitchens'],
  });

  const handleSelectKitchen = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    closeLocationSelector();
  };

  // Filter kitchens based on search query
  const filteredKitchens = kitchens && Array.isArray(kitchens)
    ? kitchens.filter((kitchen: Kitchen) =>
        kitchen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kitchen.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kitchen.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isButton) {
    return (
      <Button
        variant="outline"
        className="inline-flex items-center"
        onClick={openLocationSelector}
      >
        <MapPin className="h-4 w-4 mr-2" />
        <span>
          {selectedKitchen
            ? `${selectedKitchen.name}, ${selectedKitchen.area}`
            : "Select location"}
        </span>
      </Button>
    );
  }

  return (
    <Dialog open={isLocationSelectorOpen} onOpenChange={closeLocationSelector}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle>Select Delivery Location</DialogTitle>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full" 
              onClick={closeLocationSelector}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>Choose the kitchen nearest to your location</DialogDescription>
          
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by area, city or kitchen name"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex mt-4 space-x-2">
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewType('list')}
            >
              List View
            </Button>
            <Button 
              variant={viewType === 'map' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewType('map')}
            >
              Map View
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-auto flex-1">
          {viewType === 'list' ? (
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading kitchens...</p>
                </div>
              ) : filteredKitchens.length > 0 ? (
                filteredKitchens.map((kitchen: Kitchen) => (
                  <div 
                    key={kitchen.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectKitchen(kitchen)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{kitchen.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {kitchen.area}, {kitchen.city}
                        </p>
                      </div>
                      <div className="text-xs flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {kitchen.openTime || '10:00 AM'} - {kitchen.closeTime || '10:00 PM'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p>No kitchens found. Try a different search term.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-[400px] bg-accent/20">
              {/* This would be replaced with an actual map component in production */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="h-8 w-8 mb-3 text-primary" />
                <h3 className="font-medium text-lg">Map View</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  In a real application, this would show an interactive map with kitchen locations.
                </p>
                
                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : kitchens && Array.isArray(kitchens) ? (
                    kitchens.slice(0, 4).map((kitchen: Kitchen) => (
                      <Button 
                        key={kitchen.id} 
                        variant="outline" 
                        className="h-auto py-2 text-left flex flex-col items-start justify-start"
                        onClick={() => handleSelectKitchen(kitchen)}
                      >
                        <span className="font-medium text-sm">{kitchen.name}</span>
                        <span className="text-xs text-muted-foreground">{kitchen.area}</span>
                      </Button>
                    ))
                  ) : (
                    <p>No kitchens available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
