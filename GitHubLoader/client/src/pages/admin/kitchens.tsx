import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  Plus,
  MapPin,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { Kitchen } from "@/lib/types";

export default function KitchensList() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Get kitchens data
  const { data: kitchensData, isLoading } = useQuery<Kitchen[]>({
    queryKey: ['/api/kitchens'],
  });

  // Filter kitchens based on search
  const filteredKitchens = kitchensData?.filter(kitchen => {
    if (!searchQuery) return true;
    
    const nameMatch = kitchen.name.toLowerCase().includes(searchQuery.toLowerCase());
    const areaMatch = kitchen.area.toLowerCase().includes(searchQuery.toLowerCase());
    const cityMatch = kitchen.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatch || areaMatch || cityMatch;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kitchens</h1>
          <p className="text-muted-foreground">Manage your kitchen locations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search kitchens..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate("/admin/kitchens/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Kitchen
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading kitchens...</span>
        </div>
      ) : filteredKitchens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No kitchens found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't added any kitchens yet. Add your first kitchen to get started."}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => navigate("/admin/kitchens/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Kitchen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKitchens.map((kitchen) => (
            <Card key={kitchen.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{kitchen.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/kitchens/${kitchen.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Kitchen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Kitchen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center mt-1">
                  <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                  <CardDescription className="text-xs">
                    {kitchen.area}, {kitchen.city}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {kitchen.openTime || '9:00 AM'} - {kitchen.closeTime || '9:00 PM'}
                      </span>
                    </div>
                    <Badge variant={kitchen.isActive ? "default" : "outline"}>
                      {kitchen.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between space-y-0 rounded-md border p-2">
                    <label htmlFor={`kitchen-status-${kitchen.id}`} className="text-sm font-medium">
                      Kitchen Status
                    </label>
                    <Switch 
                      id={`kitchen-status-${kitchen.id}`}
                      checked={kitchen.isActive}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/admin/kitchens/${kitchen.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Manage Kitchen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}