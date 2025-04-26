import { useState, useEffect } from "react";
import { useUIStore, useLocationStore } from "@/lib/store";
import { Kitchen } from "@/lib/types";
import { MapPin, Search, Clock3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationProps {
  latitude: number;
  longitude: number;
}

export default function LocationModal() {
  const { isLocationSelectorOpen, closeLocationSelector } = useUIStore();
  const { selectedKitchen, setSelectedKitchen } = useLocationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("list");
  const [userLocation, setUserLocation] = useState<LocationProps | null>(null);

  const { data: kitchens, isLoading } = useQuery({
    queryKey: ['/api/kitchens'],
    enabled: isLocationSelectorOpen
  });

  useEffect(() => {
    if (isLocationSelectorOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [isLocationSelectorOpen]);

  // Calculate distance between user and kitchen
  const calculateDistance = (kitchenLat: string, kitchenLng: string): number => {
    if (!userLocation || !kitchenLat || !kitchenLng) return 999; // Return large number if location not available
    
    const R = 6371; // Radius of Earth in km
    const lat1 = userLocation.latitude * Math.PI / 180;
    const lat2 = parseFloat(kitchenLat) * Math.PI / 180;
    const dLat = (parseFloat(kitchenLat) - userLocation.latitude) * Math.PI / 180;
    const dLon = (parseFloat(kitchenLng) - userLocation.longitude) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1) * Math.cos(lat2) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSelectKitchen = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    closeLocationSelector();
  };

  const filteredKitchens = kitchens
    ? kitchens.filter((kitchen: Kitchen) => 
        kitchen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kitchen.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kitchen.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!isLocationSelectorOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Select your location</h2>
          <p className="text-sm text-muted-foreground">Choose a kitchen within 10km of your location</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Location tabs */}
          <Tabs 
            defaultValue="list" 
            value={selectedTab} 
            onValueChange={setSelectedTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search input */}
          <div className="flex w-full items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="text" 
                placeholder="Search for area, locality" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleUseCurrentLocation}>
              Use current
            </Button>
          </div>

          {/* Kitchen list */}
          <div className="border rounded-md divide-y h-[300px] overflow-auto">
            {isLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))
            ) : filteredKitchens.length > 0 ? (
              filteredKitchens.map((kitchen: Kitchen) => {
                const distance = calculateDistance(kitchen.latitude || "0", kitchen.longitude || "0");
                const isCurrentLocation = distance < 0.5; // Less than 500m
                
                return (
                  <div 
                    key={kitchen.id} 
                    className="p-4 flex justify-between items-center hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleSelectKitchen(kitchen)}
                  >
                    <div>
                      <h3 className="font-medium">{kitchen.name}</h3>
                      <p className="text-sm text-muted-foreground">{kitchen.area}, {kitchen.city}</p>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock3 size={12} className="mr-1" />
                        <span>Open: {kitchen.openTime} - {kitchen.closeTime}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      {isCurrentLocation ? (
                        <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted relative location-pulse">
                            <MapPin size={16} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No kitchens found matching your search
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeLocationSelector}>Cancel</Button>
            <Button 
              disabled={!selectedKitchen}
              onClick={closeLocationSelector}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
