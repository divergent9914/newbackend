import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, X } from 'lucide-react';

// Kitchen/Location type definition
interface Kitchen {
  id: number;
  name: string;
  area: string;
  city: string;
  state: string;
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationSelectorProps {
  isButton?: boolean;
  onSelectKitchen?: (kitchen: Kitchen) => void;
}

export default function LocationSelector({ isButton = false, onSelectKitchen }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch locations/kitchens
  const { data: kitchens = [], isLoading } = useQuery({
    queryKey: ['/api/kitchens'],
    queryFn: async () => {
      const response = await fetch('/api/kitchens');
      if (!response.ok) {
        throw new Error('Failed to fetch kitchens');
      }
      return response.json() as Promise<Kitchen[]>;
    }
  });
  
  // Filter kitchens based on search query
  const filteredKitchens = searchQuery.trim() !== ''
    ? kitchens.filter((kitchen: Kitchen) => 
        kitchen.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kitchen.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kitchen.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  useEffect(() => {
    // If there's only one kitchen, auto-select it
    if (kitchens.length === 1 && !selectedKitchen) {
      handleSelectKitchen(kitchens[0]);
    }
  }, [kitchens, selectedKitchen]);
  
  const handleSelectKitchen = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    if (onSelectKitchen) {
      onSelectKitchen(kitchen);
    }
    setIsOpen(false);
  };
  
  const toggle = () => setIsOpen(prev => !prev);
  
  // Button version of the component for compact display
  if (isButton) {
    return (
      <>
        <button 
          onClick={toggle}
          className="flex items-center gap-1 text-sm hover:text-primary transition"
        >
          <MapPin className="h-4 w-4" />
          <span>
            {selectedKitchen ? (
              <span>
                {selectedKitchen.area}, {selectedKitchen.city}
              </span>
            ) : (
              'Select location'
            )}
          </span>
        </button>
        
        {/* Dropdown Modal */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 p-3">
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search for area, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {searchQuery.trim() !== '' ? (
                  filteredKitchens.length > 0 ? (
                    filteredKitchens.map((kitchen: Kitchen) => (
                      <button
                        key={kitchen.id}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md mb-1 flex items-start"
                        onClick={() => handleSelectKitchen(kitchen)}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                        <div>
                          <p className="font-medium">{kitchen.area}</p>
                          <p className="text-xs text-gray-500">{kitchen.city}, {kitchen.state}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-3 text-gray-500">No locations found</p>
                  )
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-2">Popular locations</p>
                    {kitchens.slice(0, 4).map((kitchen: Kitchen) => (
                      <button
                        key={kitchen.id}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md mb-1 flex items-start"
                        onClick={() => handleSelectKitchen(kitchen)}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                        <div>
                          <p className="font-medium">{kitchen.area}</p>
                          <p className="text-xs text-gray-500">{kitchen.city}, {kitchen.state}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </>
    );
  }
  
  // Full version of the location selector for dedicated page
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Select your location</h2>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search for area, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse h-16 bg-gray-100 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {searchQuery.trim() !== '' ? (
            filteredKitchens.length > 0 ? (
              filteredKitchens.map((kitchen: Kitchen) => (
                <button
                  key={kitchen.id}
                  className="w-full p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition"
                  onClick={() => handleSelectKitchen(kitchen)}
                >
                  <div className="flex">
                    <MapPin className="h-5 w-5 mt-0.5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">{kitchen.area}</p>
                      <p className="text-sm text-gray-500">{kitchen.city}, {kitchen.state}</p>
                      <p className="text-xs mt-1">
                        {kitchen.isOpen ? (
                          <span className="text-green-600">Open now · {kitchen.openingTime} - {kitchen.closingTime}</span>
                        ) : (
                          <span className="text-red-500">Closed now</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No locations found</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </div>
            )
          ) : (
            <>
              <p className="font-medium mb-2">Popular locations</p>
              {kitchens.map((kitchen: Kitchen) => (
                <button
                  key={kitchen.id}
                  className="w-full p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition"
                  onClick={() => handleSelectKitchen(kitchen)}
                >
                  <div className="flex">
                    <MapPin className="h-5 w-5 mt-0.5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">{kitchen.area}</p>
                      <p className="text-sm text-gray-500">{kitchen.city}, {kitchen.state}</p>
                      <p className="text-xs mt-1">
                        {kitchen.isOpen ? (
                          <span className="text-green-600">Open now · {kitchen.openingTime} - {kitchen.closingTime}</span>
                        ) : (
                          <span className="text-red-500">Closed now</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}