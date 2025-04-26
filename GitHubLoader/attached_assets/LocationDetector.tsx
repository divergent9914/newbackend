import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocationStore } from '@/lib/store';
import { Kitchen } from '@shared/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Constants
const EARTH_RADIUS_KM = 6371;
const MAX_DELIVERY_RADIUS_KM = 10;
const DEFAULT_TEST_LOCATION = {
  lat: 26.7180796,
  lon: 88.431155,
  name: 'Siliguri'
};

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * 
    Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * 
    Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Finds the nearest kitchen from a list based on user coordinates
 */
function findNearestKitchen(userLat: number, userLon: number, kitchens: Kitchen[]): {
  kitchen: Kitchen | null;
  distance: number;
} {
  let nearestKitchen: Kitchen | null = null;
  let minDistance = Number.MAX_VALUE;

  // Process each kitchen to find the nearest
  kitchens.forEach(kitchen => {
    // Skip kitchens with missing coordinates
    if (!kitchen.latitude || !kitchen.longitude) return;

    const kitchenLat = parseFloat(String(kitchen.latitude));
    const kitchenLon = parseFloat(String(kitchen.longitude));

    // Skip invalid coordinates
    if (isNaN(kitchenLat) || isNaN(kitchenLon)) return;

    const distance = calculateDistance(userLat, userLon, kitchenLat, kitchenLon);
    
    // Log distance for debugging
    console.log(`Distance to ${kitchen.name}: ${distance.toFixed(2)}km`);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestKitchen = kitchen;
    }
  });

  // Check if within delivery radius
  if (minDistance > MAX_DELIVERY_RADIUS_KM) {
    console.log(`Nearest kitchen is ${minDistance.toFixed(2)}km away, which is outside the ${MAX_DELIVERY_RADIUS_KM}km delivery radius`);
    return { kitchen: null, distance: minDistance };
  }

  if (nearestKitchen) {
    console.log(`Selected nearest kitchen: ${nearestKitchen.name} (${minDistance.toFixed(2)}km away)`);
  }
  
  return { kitchen: nearestKitchen, distance: minDistance };
}

export default function LocationDetector() {
  const { toast } = useToast();
  const { setSelectedKitchen } = useLocationStore();
  const [isDetecting, setIsDetecting] = useState(true);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [showOutOfRangeDialog, setShowOutOfRangeDialog] = useState(false);
  
  // Fetch kitchens data
  const { data: kitchens, isLoading: isLoadingKitchens } = useQuery({
    queryKey: ['/api/kitchens'],
  });

  /**
   * Process location coordinates and find the nearest kitchen
   */
  const processUserLocation = (latitude: number, longitude: number) => {
    setUserLocation({ latitude, longitude } as GeolocationCoordinates);
    setIsDetecting(false);
    
    // Check if we have kitchens data and find the nearest
    if (kitchens && Array.isArray(kitchens) && kitchens.length > 0) {
      const { kitchen: nearest, distance } = findNearestKitchen(
        latitude,
        longitude,
        kitchens as Kitchen[]
      );
      
      if (nearest) {
        setSelectedKitchen(nearest);
        toast({
          title: "Location Set",
          description: `Delivering from ${nearest.name}, ${nearest.area} (${distance.toFixed(2)}km away)`,
        });
      } else {
        setShowOutOfRangeDialog(true);
      }
    }
  };
  
  /**
   * Detect user's location through various methods
   */
  const detectLocation = () => {
    // Don't attempt detection if kitchen data isn't loaded yet
    if (isLoadingKitchens) return;
    
    setIsDetecting(true);
    
    // Check URL parameters for manual location override
    const urlParams = new URLSearchParams(window.location.search);
    const manualLat = urlParams.get('lat');
    const manualLon = urlParams.get('lon');
    
    if (manualLat && manualLon) {
      const lat = parseFloat(manualLat);
      const lon = parseFloat(manualLon);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        console.log(`Using manual coordinates from URL: ${lat}, ${lon}`);
        processUserLocation(lat, lon);
        return;
      }
    }
    
    // Use test location (for development)
    // In production, set this to false to use browser geolocation
    const useTestLocation = true;
    if (useTestLocation) {
      const { lat, lon, name } = DEFAULT_TEST_LOCATION;
      console.log(`Using test location: ${name} (${lat}, ${lon})`);
      processUserLocation(lat, lon);
      return;
    }
    
    // Use browser geolocation as fallback
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsDetecting(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        processUserLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Error",
          description: `Could not get your location: ${error.message}`,
          variant: "destructive",
        });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Detect location whenever kitchen data changes
  useEffect(() => {
    detectLocation();
  }, [kitchens]);

  return (
    <>
      {isDetecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-lg shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Detecting your location...</p>
          </div>
        </div>
      )}

      <AlertDialog open={showOutOfRangeDialog} onOpenChange={setShowOutOfRangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Location Out of Range</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  We're sorry, but your location appears to be outside our delivery area. 
                  We currently only deliver within a {MAX_DELIVERY_RADIUS_KM}km radius of our kitchens.
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Please select a different location</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.open('https://www.google.com/maps/search/Aamis+locations', '_blank')}>
              View Locations
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setShowOutOfRangeDialog(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}