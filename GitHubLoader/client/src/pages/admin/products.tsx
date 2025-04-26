import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  ArrowUpDown,
  MoreVertical,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Box
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { Product } from "@/lib/types";

export default function ProductsList() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Get products data
  const { data: productsData, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get categories data for filter
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Filter and process products based on search and category
  const filteredProducts = productsData?.filter(product => {
    let matches = true;
    
    // Filter by category if selected
    if (categoryFilter) {
      matches = matches && product.categorySlug === categoryFilter;
    }
    
    // Filter by search query (product name or description)
    if (searchQuery) {
      const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      matches = matches && (nameMatch || descMatch);
    }
    
    return matches;
  }) || [];

  const toggleProductSelection = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.map(category => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/admin/products/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="w-12 px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <span className="sr-only">Select all</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={() => {
                          if (selectedProducts.length === filteredProducts.length) {
                            setSelectedProducts([]);
                          } else {
                            setSelectedProducts(filteredProducts.map(product => product.id));
                          }
                        }}
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
                      Product
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      No products found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 overflow-hidden rounded-md">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Box className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {categoriesData?.find(c => c.slug === product.categorySlug)?.name || 
                          product.categorySlug}
                      </td>
                      <td className="px-4 py-3 font-medium">₹{product.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={product.inStock} 
                            id={`stock-status-${product.id}`}
                          />
                          <Badge variant={product.inStock ? "outline" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/product/${product.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View on Site
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/products/${product.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}