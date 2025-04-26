import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Save, 
  ArrowLeft, 
  AlertTriangle,
  Trash2,
  MapPin,
  Clock,
  Map,
  CircleAlert
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { Kitchen } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

// Kitchen form schema
const kitchenSchema = z.object({
  name: z.string().min(2, "Kitchen name is required"),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(2, "City is required"),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  isActive: z.boolean().default(true),
  latitude: z.string().optional(),
  longitude: z.string().optional()
});

type KitchenFormValues = z.infer<typeof kitchenSchema>;

export default function KitchenEdit() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/kitchens/:id");
  const isNewKitchen = !params?.id;
  const kitchenId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get kitchen data if editing
  const { data: kitchen, isLoading: kitchenLoading } = useQuery<Kitchen>({
    queryKey: ['/api/kitchens', kitchenId],
    enabled: !isNewKitchen && !!kitchenId
  });

  // Form setup
  const form = useForm<KitchenFormValues>({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      name: kitchen?.name || "",
      area: kitchen?.area || "",
      city: kitchen?.city || "",
      openTime: kitchen?.openTime || "",
      closeTime: kitchen?.closeTime || "",
      isActive: kitchen?.isActive ?? true,
      latitude: kitchen?.latitude || "",
      longitude: kitchen?.longitude || ""
    },
  });

  // Update form when kitchen data is loaded
  useState(() => {
    if (kitchen) {
      form.reset({
        name: kitchen.name,
        area: kitchen.area,
        city: kitchen.city,
        openTime: kitchen.openTime || "",
        closeTime: kitchen.closeTime || "",
        isActive: kitchen.isActive,
        latitude: kitchen.latitude || "",
        longitude: kitchen.longitude || ""
      });
    }
  });

  // Create/Update kitchen mutation
  const { mutate: saveKitchen, isPending: isSaving } = useMutation({
    mutationFn: async (data: KitchenFormValues) => {
      // This would call your API to save the kitchen
      if (isNewKitchen) {
        return fetch('/api/admin/kitchens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(res => res.json());
      } else {
        return fetch(`/api/admin/kitchens/${kitchenId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(res => res.json());
      }
    },
    onSuccess: () => {
      // Show success toast and redirect
      toast({
        title: `Kitchen ${isNewKitchen ? 'created' : 'updated'} successfully`,
        description: `${form.getValues().name} has been ${isNewKitchen ? 'added to' : 'updated in'} your locations.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/kitchens'] });
      
      // Navigate back to kitchens list
      navigate('/admin/kitchens');
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error saving kitchen",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete kitchen mutation
  const { mutate: deleteKitchen, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return fetch(`/api/admin/kitchens/${kitchenId}`, {
        method: 'DELETE',
      }).then(res => res.json());
    },
    onSuccess: () => {
      // Show success toast and redirect
      toast({
        title: "Kitchen deleted",
        description: "The kitchen has been removed from your locations.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/kitchens'] });
      
      // Navigate back to kitchens list
      navigate('/admin/kitchens');
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error deleting kitchen",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: KitchenFormValues) => {
    saveKitchen(data);
  };

  // Loading state
  if ((!isNewKitchen && kitchenLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/kitchens")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isNewKitchen ? "Add New Kitchen" : "Edit Kitchen"}</h1>
            <p className="text-muted-foreground">
              {isNewKitchen ? "Create a new kitchen location" : `Editing ${kitchen?.name}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isNewKitchen && (
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </Button>
          )}
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save {isNewKitchen ? "Kitchen" : "Changes"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle>Delete Kitchen</CardTitle>
              </div>
              <CardDescription>
                This action cannot be undone. This will permanently delete the kitchen and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                <CircleAlert className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Warning: Deleting this kitchen will also remove all associated products and orders.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteKitchen()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Kitchen"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Kitchen Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="hours">Operating Hours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your kitchen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kitchen Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter kitchen name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area/Locality</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter area or locality" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Kitchen Status</FormLabel>
                          <FormDescription>
                            Set this kitchen as active or inactive
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>
                    Set the exact location coordinates for this kitchen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter latitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter longitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="h-48 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Map Preview</p>
                      <p className="text-xs text-muted-foreground">
                        (Map integration to be implemented)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hours" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operating Hours</CardTitle>
                  <CardDescription>
                    Set the opening and closing hours for this kitchen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="openTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Time</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. 9:00 AM" 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter in 12-hour format (e.g. 9:00 AM)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="closeTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Closing Time</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. 9:00 PM" 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter in 12-hour format (e.g. 9:00 PM)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}