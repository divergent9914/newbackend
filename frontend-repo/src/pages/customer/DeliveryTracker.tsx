import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, apiRequestRaw } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom delivery agent icon
const deliveryAgentIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// Custom destination icon
const destinationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1180/1180058.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// Component to update map view when location changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function DeliveryTracker() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
  const [routeHistory, setRouteHistory] = useState<[number, number][]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [eta, setEta] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('pending');
  const [isLive, setIsLive] = useState<boolean>(true);
  const socketRef = useRef<WebSocket | null>(null);

  // Query to get delivery information
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/delivery', id],
    queryFn: async () => {
      const response = await apiRequestRaw('GET', `/api/delivery/${id}`);
      if (!response.ok) throw new Error('Failed to fetch delivery information');
      return response.json();
    },
    enabled: !!id,
    refetchInterval: isLive ? false : 10000, // Only poll if we don't have a live connection
  });

  // Initialize WebSocket connection and delivery data
  useEffect(() => {
    if (!data) return;

    setDeliveryInfo(data);
    
    if (data.currentLat && data.currentLng) {
      setCurrentLocation([parseFloat(data.currentLat), parseFloat(data.currentLng)]);
    }
    
    if (data.destinationLat && data.destinationLng) {
      setDestinationLocation([parseFloat(data.destinationLat), parseFloat(data.destinationLng)]);
    }
    
    if (data.status) {
      setStatus(data.status);
    }
    
    if (data.estimatedArrivalTime) {
      updateETA(new Date(data.estimatedArrivalTime));
    }
    
    // Set up location history
    if (data.locationHistory && data.locationHistory.length > 0) {
      const history = data.locationHistory
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((point: any) => [parseFloat(point.latitude), parseFloat(point.longitude)] as [number, number]);
      
      setRouteHistory(history);
    }
    
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      // Join the specific delivery tracking room
      newSocket.send(JSON.stringify({
        type: 'joinDeliveryTracking',
        deliveryId: parseInt(id)
      }));
      setIsLive(true);
    };
    
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'deliveryLocationUpdated') {
        const { location, estimatedArrival } = message;
        
        if (location && location.lat && location.lng) {
          setCurrentLocation([parseFloat(location.lat), parseFloat(location.lng)]);
          
          // Add to route history
          setRouteHistory(prev => [...prev, [parseFloat(location.lat), parseFloat(location.lng)]]);
        }
        
        if (estimatedArrival) {
          updateETA(new Date(estimatedArrival));
        }
        
        // Update progress based on route history length
        if (routeHistory.length > 0) {
          const calculatedProgress = Math.min(100, Math.round((routeHistory.length / 20) * 100));
          setProgress(calculatedProgress);
        }
      } else if (message.type === 'deliveryCompleted') {
        setStatus('delivered');
        setProgress(100);
        toast({
          title: "Delivery Completed",
          description: "Your order has been delivered successfully!",
          variant: "success"
        });
      }
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLive(false);
      toast({
        title: "Connection Lost",
        description: "Live tracking connection lost. Falling back to regular updates.",
        variant: "destructive"
      });
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsLive(false);
    };
    
    socketRef.current = newSocket;
    setSocket(newSocket);
    
    // Cleanup WebSocket on component unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [data, id, toast]);

  // Function to update ETA display
  function updateETA(estimatedArrival: Date) {
    const now = new Date();
    const diff = estimatedArrival.getTime() - now.getTime();
    
    if (diff <= 0) {
      setEta('Arriving now');
      return;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) {
      setEta('Less than a minute');
    } else if (minutes === 1) {
      setEta('1 minute');
    } else if (minutes < 60) {
      setEta(`${minutes} minutes`);
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        setEta(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setEta(`${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`);
      }
    }
  }

  // Function to simulate delivery
  const simulateDelivery = async () => {
    try {
      const response = await apiRequestRaw('POST', `/api/delivery/${id}/simulate`);
      if (!response.ok) throw new Error('Failed to start delivery simulation');
      
      const responseData = await response.json();
      
      toast({
        title: "Simulation Started",
        description: "Delivery simulation has started. You'll see live updates on the map.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
      toast({
        title: "Simulation Failed",
        description: "Could not start delivery simulation. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-t-4 border-primary rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-3xl text-red-500 mb-4">Error Loading Delivery</div>
        <p className="text-lg mb-6">We couldn't load your delivery information.</p>
        <Button onClick={() => setLocation('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Tracking</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Badge variant={status === 'delivered' ? "success" : status === 'in_transit' ? "default" : "secondary"}>
                    {status === 'delivered' ? 'Delivered' : status === 'in_transit' ? 'In Transit' : 'Preparing'}
                  </Badge>
                  {isLive && (
                    <Badge variant="outline" className="bg-green-50">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      Live Updates
                    </Badge>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(currentLocation || destinationLocation) ? (
                <div className="h-[400px] rounded-md overflow-hidden">
                  <MapContainer 
                    center={currentLocation || destinationLocation || [0, 0]} 
                    zoom={14} 
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {currentLocation && (
                      <Marker position={currentLocation} icon={deliveryAgentIcon}>
                        <Popup>
                          Delivery Agent: {deliveryInfo.deliveryAgentName || 'En Route'}<br />
                          {eta && `ETA: ${eta}`}
                        </Popup>
                      </Marker>
                    )}
                    
                    {destinationLocation && (
                      <Marker position={destinationLocation} icon={destinationIcon}>
                        <Popup>
                          Destination:<br />
                          {deliveryInfo.address}
                        </Popup>
                      </Marker>
                    )}
                    
                    {routeHistory.length > 1 && (
                      <Polyline 
                        positions={routeHistory} 
                        color="#3B82F6" 
                        weight={4} 
                        opacity={0.7} 
                        dashArray="10,10" 
                      />
                    )}
                    
                    {currentLocation && <ChangeMapView center={currentLocation} />}
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-md">
                  <p className="text-lg text-gray-500">No location data available yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <div className="w-full mb-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Delivery Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              {eta && status !== 'delivered' && (
                <p className="text-sm text-muted-foreground">Estimated arrival in {eta}</p>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>
                Order #{deliveryInfo?.orderId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">{deliveryInfo?.address}</p>
                </div>
                
                {deliveryInfo?.deliveryAgentName && (
                  <div>
                    <h3 className="font-medium">Delivery Agent</h3>
                    <p className="text-sm text-muted-foreground">{deliveryInfo.deliveryAgentName}</p>
                    {deliveryInfo.deliveryAgentPhone && (
                      <p className="text-sm text-muted-foreground">{deliveryInfo.deliveryAgentPhone}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium">Status Updates</h3>
                  <div className="mt-2 space-y-2">
                    {status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <p className="text-sm">Your order is being prepared</p>
                      </div>
                    )}
                    
                    {status === 'in_transit' && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm">Your order is on the way</p>
                      </div>
                    )}
                    
                    {status === 'delivered' && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">Your order has been delivered</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation(`/orders/${deliveryInfo?.orderId}`)}
                  >
                    View Order Details
                  </Button>
                </div>
                
                {/* Simulation button for testing - remove in production */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="pt-2">
                    <Button 
                      variant="secondary" 
                      className="w-full" 
                      onClick={simulateDelivery}
                      disabled={status === 'in_transit' || status === 'delivered'}
                    >
                      Simulate Delivery (Testing)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}