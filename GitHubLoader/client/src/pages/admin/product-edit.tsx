import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
  Info,
  Plus,
  X
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { Product } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

// Product form schema
const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  categoryId: z.string().min(1, "Category is required"),
  inStock: z.boolean().default(true),
  imageUrl: z.string().optional(),
  kitchenId: z.string().min(1, "Kitchen is required")
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductEdit() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/products/:id");
  const isNewProduct = !params?.id; // Check if this is a new product
  const productId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get product data if editing
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !isNewProduct && !!productId
  });

  // Get categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Get kitchens for dropdown
  const { data: kitchens, isLoading: kitchensLoading } = useQuery<any[]>({
    queryKey: ['/api/kitchens'],
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      categoryId: product?.categoryId?.toString() || "",
      inStock: product?.inStock ?? true,
      imageUrl: product?.imageUrl || "",
      kitchenId: product?.kitchenId?.toString() || ""
    },
  });

  // Update form when product data is loaded
  useState(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        categoryId: product.categoryId?.toString() || "",
        inStock: product.inStock,
        imageUrl: product.imageUrl || "",
        kitchenId: product.kitchenId?.toString() || ""
      });
    }
  });

  // Create/Update product mutation
  const { mutate: saveProduct, isPending: isSaving } = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // This would call your API to save the product
      if (isNewProduct) {
        return fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(res => res.json());
      } else {
        return fetch(`/api/admin/products/${productId}`, {
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
        title: `Product ${isNewProduct ? 'created' : 'updated'} successfully`,
        description: `${form.getValues().name} has been ${isNewProduct ? 'added to' : 'updated in'} your catalog.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Navigate back to products list
      navigate('/admin/products');
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error saving product",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete product mutation
  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      }).then(res => res.json());
    },
    onSuccess: () => {
      // Show success toast and redirect
      toast({
        title: "Product deleted",
        description: "The product has been removed from your catalog.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Navigate back to products list
      navigate('/admin/products');
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error deleting product",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: ProductFormValues) => {
    saveProduct(data);
  };

  // Loading state
  if ((!isNewProduct && productLoading) || categoriesLoading || kitchensLoading) {
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
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isNewProduct ? "Add New Product" : "Edit Product"}</h1>
            <p className="text-muted-foreground">
              {isNewProduct ? "Create a new product in your catalog" : `Editing ${product?.name}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isNewProduct && (
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
            Save {isNewProduct ? "Product" : "Changes"}
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
                <CardTitle>Delete Product</CardTitle>
              </div>
              <CardDescription>
                This action cannot be undone. This will permanently delete the product from your catalog.
              </CardDescription>
            </CardHeader>
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
                onClick={() => deleteProduct()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Product Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter product name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter product description"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="text"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="kitchenId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kitchen</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a kitchen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kitchens?.map(kitchen => (
                              <SelectItem key={kitchen.id} value={kitchen.id.toString()}>
                                {kitchen.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Media</CardTitle>
                  <CardDescription>
                    Add images for your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image URL</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input 
                              {...field} 
                              placeholder="Enter image URL"
                            />
                            
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer">
                              {field.value ? (
                                <div className="relative mx-auto w-full max-w-xs">
                                  <img 
                                    src={field.value} 
                                    alt="Product preview" 
                                    className="mx-auto max-h-48 object-contain rounded-md"
                                  />
                                  <Button 
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-6 w-6"
                                    onClick={() => form.setValue('imageUrl', '')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Upload an image or enter a URL
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Recommended size: 800x800px
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Availability</CardTitle>
                  <CardDescription>
                    Manage product inventory and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Availability</FormLabel>
                          <FormDescription>
                            Mark this product as in stock or out of stock.
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
          </Tabs>
        </form>
      </Form>
    </div>
  );
}